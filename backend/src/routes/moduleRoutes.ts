import { FastifyInstance } from 'fastify';
import { ModuleController } from '@/controllers/ModuleController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';

export async function moduleRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const moduleController = new ModuleController(container);
  const authMiddleware = new AuthMiddleware();

  fastify.addHook('preHandler', authMiddleware.authenticate.bind(authMiddleware));

  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'courseId'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          order: { type: 'number' },
          courseId: { type: 'string' }
        }
      }
    }
  }, moduleController.create.bind(moduleController));

  fastify.get('/', moduleController.findAll.bind(moduleController));

  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, moduleController.findById.bind(moduleController));

  fastify.get('/course/:courseId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          courseId: { type: 'string' }
        }
      }
    }
  }, moduleController.findByCourseId.bind(moduleController));

  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          order: { type: 'number' }
        }
      }
    }
  }, moduleController.update.bind(moduleController));

  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, moduleController.delete.bind(moduleController));
}
