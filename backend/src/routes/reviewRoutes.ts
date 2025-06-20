import { FastifyInstance } from 'fastify';
import { ReviewController } from '@/controllers/ReviewController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';

export async function reviewRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const reviewController = new ReviewController(container);
  const authMiddleware = new AuthMiddleware();

  fastify.post('/courses/:courseId/reviews', {
    schema: {
      params: {
        type: 'object',
        properties: {
          courseId: { type: 'string' }
        },
        required: ['courseId']
      },
      body: {
        type: 'object',
        properties: {
          rating: { type: 'number', minimum: 1, maximum: 5 },
          comment: { type: 'string' }
        },
        required: ['rating']
      }
    },
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, reviewController.create.bind(reviewController));

  fastify.get('/courses/:courseId/reviews', {
    schema: {
      params: {
        type: 'object',
        properties: {
          courseId: { type: 'string' }
        },
        required: ['courseId']
      }
    }
  }, reviewController.findByCourse.bind(reviewController));

  fastify.get('/courses/:courseId/rating-stats', {
    schema: {
      params: {
        type: 'object',
        properties: {
          courseId: { type: 'string' }
        },
        required: ['courseId']
      }
    }
  }, reviewController.getCourseRatingStats.bind(reviewController));

  fastify.get('/my-reviews', {
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, reviewController.findByUser.bind(reviewController));

  fastify.put('/reviews/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          rating: { type: 'number', minimum: 1, maximum: 5 },
          comment: { type: 'string' }
        }
      }
    },
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, async (request, reply) => {
    await reviewController.update(request as any, reply);
  });

  fastify.delete('/reviews/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    },
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, async (request, reply) => {
    await reviewController.delete(request as any, reply);
  });
}
