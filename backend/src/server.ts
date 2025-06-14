import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { setupDependencies } from './infrastructure/dependencies';
import { authRoutes } from './routes/authRoutes';
import { courseRoutes } from './routes/courseRoutes';
import { moduleRoutes } from './routes/moduleRoutes';
import { lessonRoutes } from './routes/lessonRoutes';
import { enrollmentRoutes } from './routes/enrollmentRoutes';
import { paymentRoutes } from './routes/paymentRoutes';
import { categoryRoutes } from './routes/categoryRoutes';
import { createUploadRoutes } from './routes/uploadRoutes';
import { UploadController } from './controllers/UploadController';
import { S3Service } from './services/S3Service';
import { ErrorHandler } from './middlewares/ErrorHandler';

async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info'
    }
  });

  // Add basic security headers
  await fastify.addHook('onSend', async (request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    
    if (process.env.NODE_ENV === 'production') {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  });

  // Register CORS
  await fastify.register(cors, {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://localhost:5174'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  // Register multipart plugin for file uploads
  await fastify.register(multipart, {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 1000000, // Max field value size in bytes (1MB)
      fields: 10, // Max number of non-file fields
      fileSize: 10000000, // Max file size (10MB)
      files: 1, // Max number of file fields
      headerPairs: 2000 // Max number of header key=>value pairs
    }
  });
  // Setup dependency injection container
  const container = setupDependencies();
  (fastify as any).decorate('diContainer', container);

  // Register error handler
  fastify.setErrorHandler(ErrorHandler.handle);

  // Register API routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(courseRoutes, { prefix: '/api/courses' });
  await fastify.register(moduleRoutes, { prefix: '/api/modules' });
  await fastify.register(lessonRoutes, { prefix: '/api/lessons' });
  await fastify.register(enrollmentRoutes, { prefix: '/api/enrollments' });
  await fastify.register(paymentRoutes, { prefix: '/api/payments' });
  await fastify.register(categoryRoutes, { prefix: '/api/categories' });
  
  // Enable upload routes with S3 service
  const s3Service = container.resolve<S3Service>('S3Service');
  const uploadController = new UploadController(s3Service);
  await fastify.register(createUploadRoutes(uploadController), { prefix: '/api/uploads' });

  // Health check endpoint
  fastify.get('/health', async () => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      memory: {
        used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
      },
      environment: process.env.NODE_ENV || 'development'
    };
  });

  // API info endpoint
  fastify.get('/api', async () => {
    return {
      name: 'Course Platform API',
      version: '1.0.0',
      description: 'A comprehensive course platform backend with user management, course creation, and payment processing',
      endpoints: {
        auth: '/api/auth',
        courses: '/api/courses',
        modules: '/api/modules',
        lessons: '/api/lessons',
        enrollments: '/api/enrollments',
        payments: '/api/payments',
        categories: '/api/categories',
        uploads: '/api/uploads',
        health: '/health'
      }
    };
  });

  return fastify;
}

async function start() {
  try {
    const app = await buildApp();
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';

    await app.listen({ port, host });
    app.log.info(`🚀 Server listening on http://${host}:${port}`);
    app.log.info(`📚 API documentation available at http://${host}:${port}/api`);
    app.log.info(`❤️  Health check available at http://${host}:${port}/health`);
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

// Graceful shutdown handlers
process.on('SIGINT', async () => {
  console.log('📡 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('📡 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start server if this file is run directly
if (require.main === module) {
  start();
}

export { buildApp };
