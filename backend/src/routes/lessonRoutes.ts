import { FastifyInstance } from 'fastify';
import { LessonController } from '@/controllers/LessonController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';

export async function lessonRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer;
  const authMiddleware = new AuthMiddleware();
  const lessonController = new LessonController(
    container.resolve('LessonRepository'),
    container.resolve('LessonCommentRepository'),
    container.resolve('EnrollmentRepository'),
    container.resolve('CourseRepository'),
    container.resolve('CreateLessonUseCase'),
    container.resolve('CompleteLessonUseCase')
  );

  const createLessonSchema = {
    description: 'Create a new lesson',
    tags: ['lessons'],
    security: [{ Bearer: [] }],
    params: {
      type: 'object',
      properties: { courseId: { type: 'string' } },
      required: ['courseId']
    },
    body: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        content: { type: 'string' },
        videoUrl: { type: 'string' },
        duration: { type: 'number' },
        type: { type: 'string', enum: ['TEXT', 'VIDEO'] },
        order: { type: 'number' },
        isPreview: { type: 'boolean' },
        moduleId: { type: 'string' }
      },
      required: ['title', 'type', 'order']
    }
  };

  fastify.post('/courses/:courseId/lessons', {
    schema: createLessonSchema,
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, lessonController.create.bind(lessonController));  fastify.get('/courses/:courseId/lessons', {
    schema: {
      params: {
        type: 'object',
        properties: { courseId: { type: 'string' } },
        required: ['courseId']
      }
    },
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, lessonController.findByCourse.bind(lessonController));  fastify.get('/lessons/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    },
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, lessonController.findById.bind(lessonController));  fastify.put('/lessons/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          content: { type: 'string' },
          videoUrl: { type: 'string' },
          duration: { type: 'number' },
          type: { type: 'string', enum: ['TEXT', 'VIDEO'] },
          order: { type: 'number' },
          isPreview: { type: 'boolean' },
          moduleId: { type: 'string' }
        }
      }
    },
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, lessonController.update.bind(lessonController));  fastify.delete('/lessons/:id', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    },
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, lessonController.delete.bind(lessonController));  fastify.put('/lessons/:id/progress', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          isCompleted: { type: 'boolean' },
          watchTime: { type: 'number' }
        }
      }
    },
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, lessonController.updateProgress.bind(lessonController));  fastify.post('/lessons/:id/comments', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: { content: { type: 'string' } },
        required: ['content']
      }
    },
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, lessonController.addComment.bind(lessonController));  fastify.get('/lessons/:id/comments', {
    schema: {
      params: {
        type: 'object',
        properties: { id: { type: 'string' } },
        required: ['id']
      }
    },
    preHandler: [authMiddleware.authenticate.bind(authMiddleware)]
  }, lessonController.getComments.bind(lessonController));
}
