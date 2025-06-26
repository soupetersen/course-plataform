import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateLessonProgressDto, UpdateLessonProgressDto, CreateQuizAttemptDto } from '@/dtos/LessonProgressDto';
import { LessonProgressRepository } from '@/interfaces/LessonProgressRepository';
import { PrismaLessonProgressRepository } from '@/repositories/PrismaLessonProgressRepository';
import { QuestionRepository } from '@/interfaces/QuestionRepository';
import { PrismaQuestionRepository } from '@/repositories/PrismaQuestionRepository';
import { PrismaClient } from '@prisma/client';

interface UserLessonParams {
  userId: string;
  lessonId: string;
}

interface UserCourseParams {
  userId: string;
  courseId: string;
}

interface ProgressParams {
  id: string;
}

export class LessonProgressController {
  private progressRepository: LessonProgressRepository;
  private questionRepository: QuestionRepository;

  constructor() {
    const prisma = new PrismaClient();
    this.progressRepository = new PrismaLessonProgressRepository(prisma);
    this.questionRepository = new PrismaQuestionRepository(prisma);
  }

  async updateVideoProgress(
    request: FastifyRequest<{ Body: CreateLessonProgressDto & { watchTime: number } }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, lessonId, courseId, watchTime } = request.body;

      let progress = await this.progressRepository.findProgressByUserAndLesson(userId, lessonId);

      if (!progress) {
        progress = await this.progressRepository.createProgress({
          id: crypto.randomUUID(),
          userId,
          lessonId,
          courseId,
          watchTime,
          isCompleted: false,
          lastAccessed: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        const newWatchTime = Math.max(progress.watchTime, watchTime);
        progress = await this.progressRepository.updateProgress(progress.id, {
          watchTime: newWatchTime,
          lastAccessed: new Date(),
          updatedAt: new Date(),
        });
      }

      return reply.status(200).send({
        success: true,
        data: progress,
        message: 'Progresso atualizado com sucesso',
      });
    } catch (error) {
      console.error('Error updating video progress:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async completeLesson(
    request: FastifyRequest<{ Body: CreateLessonProgressDto }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, lessonId, courseId } = request.body;

      let progress = await this.progressRepository.findProgressByUserAndLesson(userId, lessonId);

      if (!progress) {
        progress = await this.progressRepository.createProgress({
          id: crypto.randomUUID(),
          userId,
          lessonId,
          courseId,
          isCompleted: true,
          completedAt: new Date(),
          lastAccessed: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (!progress.isCompleted) {
        progress = await this.progressRepository.updateProgress(progress.id, {
          isCompleted: true,
          completedAt: new Date(),
          lastAccessed: new Date(),
          updatedAt: new Date(),
        });
      }

      return reply.status(200).send({
        success: true,
        data: progress,
        message: 'Lição concluída com sucesso',
      });
    } catch (error) {
      console.error('Error completing lesson:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async submitQuiz(
    request: FastifyRequest<{ Body: CreateQuizAttemptDto }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, lessonId, courseId, answers } = request.body;

      const questions = await this.questionRepository.findByLessonId(lessonId);
      
      if (questions.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'Nenhuma pergunta encontrada para esta lição',
        });
      }

      const questionsWithOptions = await Promise.all(
        questions.map(async (question) => {
          const options = await this.questionRepository.findOptionsByQuestionId(question.id);
          return { ...question, options };
        })
      );

      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      const quizAnswers = [];

      for (const answer of answers) {
        const question = questionsWithOptions.find(q => q.id === answer.questionId);
        if (!question) continue;

        totalPoints += question.points;

        const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId);
        const isCorrect = selectedOption?.isCorrect || false;

        if (isCorrect) {
          correctAnswers++;
          earnedPoints += question.points;
        }

        quizAnswers.push({
          id: crypto.randomUUID(),
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          isCorrect,
          timeSpent: answer.timeSpent || 0,
          createdAt: new Date(),
        });
      }

      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

      const isPassing = score >= 70; 

      const quizAttempt = await this.progressRepository.createQuizAttempt({
        id: crypto.randomUUID(),
        userId,
        lessonId,
        courseId,
        score,
        totalQuestions: questions.length,
        correctAnswers,
        isPassing,
        completedAt: new Date(),
        timeSpent: quizAnswers.reduce((total, ans) => total + ans.timeSpent, 0),
      });

      const createdAnswers = [];
      for (const answerData of quizAnswers) {
        const quizAnswer = await this.progressRepository.createQuizAnswer({
          ...answerData,
          attemptId: quizAttempt.id,
        });
        createdAnswers.push(quizAnswer);
      }

      if (isPassing) {
        await this.completeLesson({ body: { userId, lessonId, courseId } } as any, reply);
      }

      return reply.status(200).send({
        success: true,
        data: {
          ...quizAttempt,
          answers: createdAnswers,
        },
        message: isPassing ? 'Quiz concluído com sucesso!' : 'Quiz concluído, mas você precisa de uma pontuação maior para passar.',
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getProgressByUserAndCourse(
    request: FastifyRequest<{ Params: UserCourseParams }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, courseId } = request.params;

      const progressList = await this.progressRepository.findProgressByUserAndCourse(userId, courseId);

      return reply.status(200).send({
        success: true,
        data: progressList,
      });
    } catch (error) {
      console.error('Error fetching progress:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getQuizAttempts(
    request: FastifyRequest<{ Params: UserLessonParams }>,
    reply: FastifyReply
  ) {
    try {
      const { userId, lessonId } = request.params;

      const attempts = await this.progressRepository.findQuizAttemptsByUserAndLesson(userId, lessonId);

      const attemptsWithAnswers = await Promise.all(
        attempts.map(async (attempt) => {
          const answers = await this.progressRepository.findQuizAnswersByAttempt(attempt.id);
          return { ...attempt, answers };
        })
      );

      return reply.status(200).send({
        success: true,
        data: attemptsWithAnswers,
      });
    } catch (error) {
      console.error('Error fetching quiz attempts:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
