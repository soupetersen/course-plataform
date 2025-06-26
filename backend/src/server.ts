import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import websocket from '@fastify/websocket';
import { setupDependencies } from './infrastructure/dependencies';
import { passwordResetRoutes } from './routes/passwordResetRoutes';
import { authRoutes } from './routes/authRoutes';
import { courseRoutes } from './routes/courseRoutes';
import { moduleRoutes } from './routes/moduleRoutes';
import { lessonRoutes } from './routes/lessonRoutes';
import { enrollmentRoutes } from './routes/enrollmentRoutes';
import { paymentRoutes } from './routes/paymentRoutes';
import { categoryRoutes } from './routes/categoryRoutes';
import { reviewRoutes } from './routes/reviewRoutes';
import { adminCouponRoutes } from './routes/adminCouponRoutes';
import { adminPlatformSettingsRoutes } from './routes/adminPlatformSettingsRoutes';
import { instructorCouponRoutes } from './routes/instructorCouponRoutes';
import { instructorAnalyticsRoutes } from './routes/instructorAnalyticsRoutes';
import { instructorPayoutRoutes } from './routes/instructorPayoutRoutes';
import { studentCouponRoutes } from './routes/studentCouponRoutes';
import { createUploadRoutes } from './routes/uploadRoutes';
import { savedCardRoutes } from './routes/savedCardRoutes';
import { questionRoutes } from './routes/questionRoutes';
import { lessonProgressRoutes } from './routes/lessonProgressRoutes';
import { lessonWebSocketRoutes } from './routes/lessonWebSocketRoutes';
import { UploadController } from './controllers/UploadController';
import { S3Service } from './services/S3Service';
import { ErrorHandler } from './middlewares/ErrorHandler';

async function buildApp() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info'
    }  });

  await fastify.register(websocket);

  await fastify.addHook('onSend', async (request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    
    if (process.env.NODE_ENV === 'production') {
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
  });

  await fastify.register(cors, {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  });

  await fastify.register(multipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 1000000, 
      fields: 10,
      fileSize: 10000000, 
      files: 1, 
      headerPairs: 2000 
    }
  });
  const container = setupDependencies();
  (fastify as any).decorate('diContainer', container);

  fastify.setErrorHandler(ErrorHandler.handle);
  await fastify.register(passwordResetRoutes, { prefix: '/api/auth' });
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(courseRoutes, { prefix: '/api/courses' });
  await fastify.register(moduleRoutes, { prefix: '/api/modules' });
  await fastify.register(lessonRoutes, { prefix: '/api' });  
  await fastify.register(enrollmentRoutes, { prefix: '/api/enrollments' });
  await fastify.register(paymentRoutes, { prefix: '/api/payments' });  
  await fastify.register(categoryRoutes, { prefix: '/api/categories' });  
  await fastify.register(reviewRoutes, { prefix: '/api' });
  await fastify.register(adminCouponRoutes, { prefix: '/api/admin/coupons' }); 
  await fastify.register(adminPlatformSettingsRoutes, { prefix: '/api/admin/settings' });  
  await fastify.register(instructorCouponRoutes, { prefix: '/api' });
  await fastify.register(instructorAnalyticsRoutes, { prefix: '/api/instructor/analytics' });
  await fastify.register(instructorPayoutRoutes, { prefix: '/api' });
  await fastify.register(studentCouponRoutes, { prefix: '/api/coupons' });  await fastify.register(questionRoutes, { prefix: '/api' });
  await fastify.register(lessonProgressRoutes, { prefix: '/api' });
  
  await fastify.register(lessonWebSocketRoutes);
  
    const s3Service = container.resolve<S3Service>('S3Service');
  const uploadController = new UploadController(s3Service);
  await fastify.register(createUploadRoutes(uploadController), { prefix: '/api/uploads' });
  await fastify.register(savedCardRoutes, { prefix: '' });

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

  fastify.get('/api', async () => {
    return {
      name: 'EduMy API',
      version: '1.0.0',
      description: 'EduMy - Plataforma completa de cursos online com gerenciamento de usuários, criação de cursos e processamento de pagamentos',      endpoints: {
        auth: '/api/auth',
        courses: '/api/courses',
        modules: '/api/modules',
        lessons: '/api/lessons',
        enrollments: '/api/enrollments',
        payments: '/api/payments',
        categories: '/api/categories',
        uploads: '/api/uploads',        admin: {
          coupons: '/api/admin/coupons',
          settings: '/api/admin/settings'
        },
        instructor: {
          coupons: '/api/instructor/coupons',
          courses: '/api/instructor/courses'
        },
        health: '/health'
      }
    };
  });  return fastify;
}

async function start() {
  try {
    const app = await buildApp();
    const port = parseInt(process.env.PORT || '3000');
    const host = process.env.HOST || '0.0.0.0';    await app.listen({ port, host });
    
    await app.ready();
    
    app.log.info(`🚀 Server listening on http://${host}:${port}`);
    app.log.info(`📚 API documentation available at http://${host}:${port}/api`);
    app.log.info(`❤️  Health check available at http://${host}:${port}/health`);
    app.log.info(`🔌 WebSocket available at ws://${host}:${port}/ws/lessons`);
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('📡 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('📡 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

if (require.main === module) {
  start();
}

export { buildApp };
