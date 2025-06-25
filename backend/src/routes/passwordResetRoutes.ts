import { FastifyInstance } from 'fastify';
import { PasswordResetController } from '@/controllers/PasswordResetController';
import { DIContainer } from '@/shared/utils/DIContainer';

export async function passwordResetRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const passwordResetController = new PasswordResetController(container);

  fastify.post('/forgot-password', {
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' }
        }
      }
    }
  }, passwordResetController.forgotPassword.bind(passwordResetController));

  fastify.post('/validate-reset-code', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'code'],
        properties: {
          email: { type: 'string', format: 'email' },
          code: { type: 'string', minLength: 6, maxLength: 6 }
        }
      }
    }
  }, passwordResetController.validateResetCode.bind(passwordResetController));

  fastify.post('/reset-password', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'code', 'newPassword'],
        properties: {
          email: { type: 'string', format: 'email' },
          code: { type: 'string', minLength: 6, maxLength: 6 },
          newPassword: { type: 'string', minLength: 8 }
        }
      }
    }
  }, passwordResetController.resetPassword.bind(passwordResetController));
}
