import { LessonProgress, QuizAttempt, QuizAnswer } from '@/models/LessonProgress';

export interface LessonProgressRepository {
  // Lesson Progress
  createProgress(data: Partial<LessonProgress>): Promise<LessonProgress>;
  findProgressById(id: string): Promise<LessonProgress | null>;
  findProgressByUserAndLesson(userId: string, lessonId: string): Promise<LessonProgress | null>;
  findProgressByUserAndCourse(userId: string, courseId: string): Promise<LessonProgress[]>;
  updateProgress(id: string, data: Partial<LessonProgress>): Promise<LessonProgress>;
  deleteProgress(id: string): Promise<void>;
  
  // Quiz Attempts
  createQuizAttempt(data: Partial<QuizAttempt>): Promise<QuizAttempt>;
  findQuizAttemptById(id: string): Promise<QuizAttempt | null>;
  findQuizAttemptsByUserAndLesson(userId: string, lessonId: string): Promise<QuizAttempt[]>;
  findLatestQuizAttempt(userId: string, lessonId: string): Promise<QuizAttempt | null>;
  
  // Quiz Answers
  createQuizAnswer(data: Partial<QuizAnswer>): Promise<QuizAnswer>;
  findQuizAnswersByAttempt(attemptId: string): Promise<QuizAnswer[]>;
  findQuizAnswerByAttemptAndQuestion(attemptId: string, questionId: string): Promise<QuizAnswer | null>;
}
