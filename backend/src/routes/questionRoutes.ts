import { FastifyInstance } from 'fastify';
import { QuestionController } from '@/controllers/QuestionController';

export const questionRoutes = async (fastify: FastifyInstance) => {
  const questionController = new QuestionController();

  // Rotas para questões
  fastify.post('/lessons/:lessonId/questions', {
    handler: questionController.createQuestion.bind(questionController),
  });

  fastify.get('/lessons/:lessonId/questions', {
    handler: questionController.getQuestionsByLesson.bind(questionController),
  });

  fastify.put('/questions/:id', {
    handler: questionController.updateQuestion.bind(questionController),
  });

  fastify.delete('/questions/:id', {
    handler: questionController.deleteQuestion.bind(questionController),
  });

  // Rotas para opções de questões
  fastify.put('/questions/:questionId/options/:optionId', {
    handler: questionController.updateQuestionOption.bind(questionController),
  });

  fastify.delete('/questions/:questionId/options/:optionId', {
    handler: questionController.deleteQuestionOption.bind(questionController),
  });
};
