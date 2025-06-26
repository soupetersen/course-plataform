import { FastifyInstance } from 'fastify';
import { LessonProgressController } from '@/controllers/LessonProgressController';

export const lessonProgressRoutes = async (fastify: FastifyInstance) => {
  const progressController = new LessonProgressController();

  fastify.post('/lessons/progress/video', {
    handler: progressController.updateVideoProgress.bind(progressController),
  });

  fastify.post('/lessons/progress/complete', {
    handler: progressController.completeLesson.bind(progressController),
  });

  fastify.get('/users/:userId/courses/:courseId/progress', {
    handler: progressController.getProgressByUserAndCourse.bind(progressController),
  });

  fastify.post('/lessons/quiz/submit', {
    handler: progressController.submitQuiz.bind(progressController),
  });

  fastify.get('/users/:userId/lessons/:lessonId/quiz-attempts', {
    handler: progressController.getQuizAttempts.bind(progressController),
  });
};
