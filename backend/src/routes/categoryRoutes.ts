import { FastifyInstance } from 'fastify';
import { CategoryController } from '@/controllers/CategoryController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';

export async function categoryRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const categoryController = new CategoryController(container);
  const authMiddleware = new AuthMiddleware();

  
  fastify.get('/', categoryController.findAll.bind(categoryController));
  
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, categoryController.findById.bind(categoryController));

  
  fastify.register(async function(fastify) {
    fastify.addHook('preHandler', authMiddleware.authenticate.bind(authMiddleware));

    fastify.post('/', {
      schema: {
        body: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            description: { type: 'string' }
          }
        }
      }
    }, categoryController.create.bind(categoryController));

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
            name: { type: 'string' },
            description: { type: 'string' }
          }
        }
      }
    }, categoryController.update.bind(categoryController));

    fastify.delete('/:id', {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      }
    }, categoryController.delete.bind(categoryController));
  });
}
