import { FastifyInstance } from 'fastify';
import { EnrollmentController } from '@/controllers/EnrollmentController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';

export async function enrollmentRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const enrollmentController = new EnrollmentController(container);
  const authMiddleware = new AuthMiddleware();

  fastify.addHook('preHandler', authMiddleware.authenticate.bind(authMiddleware));

  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['courseId'],
        properties: {
          courseId: { type: 'string' }
        }
      }
    }
  }, enrollmentController.enroll.bind(enrollmentController));

  fastify.get('/my-enrollments', enrollmentController.getUserEnrollments.bind(enrollmentController));

  fastify.get('/user/:userId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string' }
        }
      }
    }
  }, enrollmentController.getUserEnrollmentsByUserId.bind(enrollmentController));

  fastify.get('/course/:courseId', {
    schema: {
      params: {
        type: 'object',
        properties: {
          courseId: { type: 'string' }
        }
      }
    }
  }, enrollmentController.getCourseEnrollments.bind(enrollmentController));

  fastify.patch('/:id/progress', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['progress'],
        properties: {
          progress: { type: 'number', minimum: 0, maximum: 100 }
        }
      }
    }
  }, enrollmentController.updateProgress.bind(enrollmentController));

  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, enrollmentController.unenroll.bind(enrollmentController));
}
