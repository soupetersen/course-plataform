import { FastifyInstance } from 'fastify';
import { CourseController } from '@/controllers/CourseController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';

export async function courseRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const courseController = new CourseController(container);
  const authMiddleware = new AuthMiddleware();

  fastify.get('/', courseController.findAll.bind(courseController));
  
  fastify.get('/instructor/:instructorId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          instructorId: { type: 'string' }
        }
      }
    }
  }, courseController.findByInstructor.bind(courseController));
  
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, courseController.findById.bind(courseController));

  fastify.register(async function(fastify) {
    fastify.addHook('preHandler', authMiddleware.authenticate.bind(authMiddleware));

    fastify.post('/', {
      schema: {
        body: {
          type: 'object',
          required: ['title', 'price'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            imageUrl: { type: 'string' },
            price: { type: 'number', minimum: 0 },
            level: { type: 'string', enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] },
            categoryId: { type: 'string' }
          }
        }
      }
    }, courseController.create.bind(courseController));

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
            imageUrl: { type: 'string' },
            price: { type: 'number', minimum: 0 },
            categoryId: { type: 'string' },
            isPublished: { type: 'boolean' }
          }
        }
      }
    }, courseController.update.bind(courseController));

    fastify.delete('/:id', {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      }
    }, courseController.delete.bind(courseController));    fastify.patch('/:id/publish', {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      }
    }, courseController.publish.bind(courseController));

    fastify.patch('/:id/unpublish', {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      }
    }, courseController.unpublish.bind(courseController));
  });
}
