import { FastifyInstance } from 'fastify';
import { AdminPlatformSettingsController } from '@/controllers/AdminPlatformSettingsController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';
import { PlatformSettingRepository } from '@/interfaces/PlatformSettingRepository';

export async function adminPlatformSettingsRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const authMiddleware = new AuthMiddleware();

  const platformSettingRepository = container.resolve<PlatformSettingRepository>('PlatformSettingRepository');
  const adminController = new AdminPlatformSettingsController(platformSettingRepository);

  fastify.get('/', {
    preHandler: [
      authMiddleware.authenticate.bind(authMiddleware),
      authMiddleware.requireAdmin()
    ]
  }, adminController.getSettings.bind(adminController));

  fastify.get('/:key', {
    preHandler: [
      authMiddleware.authenticate.bind(authMiddleware),
      authMiddleware.requireAdmin()
    ],
    schema: {
      params: {
        type: 'object',
        properties: {
          key: { type: 'string' }
        }
      }
    }
  }, adminController.getSetting.bind(adminController));

  fastify.put('/:key', {
    preHandler: [
      authMiddleware.authenticate.bind(authMiddleware),
      authMiddleware.requireAdmin()
    ],
    schema: {
      params: {
        type: 'object',
        properties: {
          key: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['value'],
        properties: {
          value: { type: 'string' }
        }
      }
    }
  }, adminController.updateSetting.bind(adminController));

  fastify.post('/', {
    preHandler: [
      authMiddleware.authenticate.bind(authMiddleware),
      authMiddleware.requireAdmin()
    ],
    schema: {
      body: {
        type: 'object',
        required: ['key', 'value', 'type'],
        properties: {
          key: { type: 'string' },
          value: { type: 'string' },
          type: { type: 'string', enum: ['STRING', 'NUMBER', 'BOOLEAN'] },
          description: { type: 'string' }
        }
      }
    }
  }, adminController.createSetting.bind(adminController));
}
