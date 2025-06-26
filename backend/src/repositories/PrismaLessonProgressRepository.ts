import { LessonProgressRepository } from '@/interfaces/LessonProgressRepository';
import { LessonProgress, QuizAttempt, QuizAnswer } from '@/models/LessonProgress';
import { PrismaClient } from '@prisma/client';

export class PrismaLessonProgressRepository implements LessonProgressRepository {
  constructor(private prisma: PrismaClient) {}

  async createProgress(data: Partial<LessonProgress>): Promise<LessonProgress> {
    const progress = await this.prisma.lessonProgress.create({
      data: {
        id: data.id!,
        userId: data.userId!,
        lessonId: data.lessonId!,
        courseId: data.courseId!,
        isCompleted: data.isCompleted ?? false,
        watchTime: data.watchTime ?? 0,
        completedAt: data.completedAt || null,
        lastAccessed: data.lastAccessed || new Date(),
      }
    });

    return new LessonProgress(
      progress.id,
      progress.userId,
      progress.lessonId,
      progress.courseId,
      progress.isCompleted,
      progress.watchTime,
      progress.completedAt,
      progress.lastAccessed,
      progress.createdAt,
      progress.updatedAt
    );
  }

  async findProgressById(id: string): Promise<LessonProgress | null> {
    const progress = await this.prisma.lessonProgress.findUnique({
      where: { id }
    });

    if (!progress) return null;

    return new LessonProgress(
      progress.id,
      progress.userId,
      progress.lessonId,
      progress.courseId,
      progress.isCompleted,
      progress.watchTime,
      progress.completedAt,
      progress.lastAccessed,
      progress.createdAt,
      progress.updatedAt
    );
  }

  async findProgressByUserAndLesson(userId: string, lessonId: string): Promise<LessonProgress | null> {
    const progress = await this.prisma.lessonProgress.findUnique({
      where: { 
        userId_lessonId: {
          userId,
          lessonId
        }
      }
    });

    if (!progress) return null;

    return new LessonProgress(
      progress.id,
      progress.userId,
      progress.lessonId,
      progress.courseId,
      progress.isCompleted,
      progress.watchTime,
      progress.completedAt,
      progress.lastAccessed,
      progress.createdAt,
      progress.updatedAt
    );
  }

  async findProgressByUserAndCourse(userId: string, courseId: string): Promise<LessonProgress[]> {
    const progressList = await this.prisma.lessonProgress.findMany({
      where: { userId, courseId }
    });

    return progressList.map(progress => new LessonProgress(
      progress.id,
      progress.userId,
      progress.lessonId,
      progress.courseId,
      progress.isCompleted,
      progress.watchTime,
      progress.completedAt,
      progress.lastAccessed,
      progress.createdAt,
      progress.updatedAt
    ));
  }

  async updateProgress(id: string, data: Partial<LessonProgress>): Promise<LessonProgress> {
    const progress = await this.prisma.lessonProgress.update({
      where: { id },
      data: {
        isCompleted: data.isCompleted,
        watchTime: data.watchTime,
        completedAt: data.completedAt,
        lastAccessed: new Date(),
        updatedAt: new Date(),
      }
    });

    return new LessonProgress(
      progress.id,
      progress.userId,
      progress.lessonId,
      progress.courseId,
      progress.isCompleted,
      progress.watchTime,
      progress.completedAt,
      progress.lastAccessed,
      progress.createdAt,
      progress.updatedAt
    );
  }

  async deleteProgress(id: string): Promise<void> {
    await this.prisma.lessonProgress.delete({ where: { id } });
  }

  async createQuizAttempt(data: Partial<QuizAttempt>): Promise<QuizAttempt> {
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        id: data.id!,
        userId: data.userId!,
        lessonId: data.lessonId!,
        courseId: data.courseId!,
        score: data.score ?? 0,
        totalQuestions: data.totalQuestions ?? 0,
        correctAnswers: data.correctAnswers ?? 0,
        isPassing: data.isPassing ?? false,
        completedAt: data.completedAt || new Date(),
        timeSpent: data.timeSpent ?? 0,
      }
    });

    return new QuizAttempt(
      attempt.id,
      attempt.userId,
      attempt.lessonId,
      attempt.courseId,
      attempt.score,
      attempt.totalQuestions,
      attempt.correctAnswers,
      attempt.isPassing,
      attempt.completedAt,
      attempt.timeSpent
    );
  }

  async findQuizAttemptById(id: string): Promise<QuizAttempt | null> {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id }
    });

    if (!attempt) return null;

    return new QuizAttempt(
      attempt.id,
      attempt.userId,
      attempt.lessonId,
      attempt.courseId,
      attempt.score,
      attempt.totalQuestions,
      attempt.correctAnswers,
      attempt.isPassing,
      attempt.completedAt,
      attempt.timeSpent
    );
  }

  async findQuizAttemptsByUserAndLesson(userId: string, lessonId: string): Promise<QuizAttempt[]> {
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { userId, lessonId },
      orderBy: { completedAt: 'desc' }
    });

    return attempts.map(attempt => new QuizAttempt(
      attempt.id,
      attempt.userId,
      attempt.lessonId,
      attempt.courseId,
      attempt.score,
      attempt.totalQuestions,
      attempt.correctAnswers,
      attempt.isPassing,
      attempt.completedAt,
      attempt.timeSpent
    ));
  }

  async findLatestQuizAttempt(userId: string, lessonId: string): Promise<QuizAttempt | null> {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: { userId, lessonId },
      orderBy: { completedAt: 'desc' }
    });

    if (!attempt) return null;

    return new QuizAttempt(
      attempt.id,
      attempt.userId,
      attempt.lessonId,
      attempt.courseId,
      attempt.score,
      attempt.totalQuestions,
      attempt.correctAnswers,
      attempt.isPassing,
      attempt.completedAt,
      attempt.timeSpent
    );
  }

  async createQuizAnswer(data: Partial<QuizAnswer>): Promise<QuizAnswer> {
    const answer = await this.prisma.quizAnswer.create({
      data: {
        id: data.id!,
        attemptId: data.attemptId!,
        questionId: data.questionId!,
        selectedOptionId: data.selectedOptionId || null,
        isCorrect: data.isCorrect ?? false,
        timeSpent: data.timeSpent ?? 0,
      }
    });

    return new QuizAnswer(
      answer.id,
      answer.attemptId,
      answer.questionId,
      answer.selectedOptionId,
      answer.isCorrect,
      answer.timeSpent,
      answer.createdAt
    );
  }

  async findQuizAnswersByAttempt(attemptId: string): Promise<QuizAnswer[]> {
    const answers = await this.prisma.quizAnswer.findMany({
      where: { attemptId }
    });

    return answers.map(answer => new QuizAnswer(
      answer.id,
      answer.attemptId,
      answer.questionId,
      answer.selectedOptionId,
      answer.isCorrect,
      answer.timeSpent,
      answer.createdAt
    ));
  }

  async findQuizAnswerByAttemptAndQuestion(attemptId: string, questionId: string): Promise<QuizAnswer | null> {
    const answer = await this.prisma.quizAnswer.findUnique({
      where: {
        attemptId_questionId: {
          attemptId,
          questionId
        }
      }
    });

    if (!answer) return null;

    return new QuizAnswer(
      answer.id,
      answer.attemptId,
      answer.questionId,
      answer.selectedOptionId,
      answer.isCorrect,
      answer.timeSpent,
      answer.createdAt
    );
  }
}
