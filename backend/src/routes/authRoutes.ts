import { FastifyInstance } from 'fastify';
import { AuthController } from '@/controllers/AuthController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';

export async function authRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const authController = new AuthController(container);
  const authMiddleware = new AuthMiddleware();

  fastify.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          role: { type: 'string', enum: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] }
        }
      }
    }
  }, authController.register.bind(authController));

  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      }
    }
  }, authController.login.bind(authController));

  fastify.get('/me', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, authController.me.bind(authController));
}
