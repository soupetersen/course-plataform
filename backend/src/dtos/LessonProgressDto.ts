export interface CreateLessonProgressDto {
  userId: string;
  lessonId: string;
  courseId: string;
  watchTime?: number;
}

export interface UpdateLessonProgressDto {
  isCompleted?: boolean;
  watchTime?: number;
  completedAt?: Date;
}

export interface LessonProgressResponseDto {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  watchTime: number;
  completedAt?: Date;
  lastAccessed: Date;
}

export interface CreateQuizAttemptDto {
  userId: string;
  lessonId: string;
  courseId: string;
  answers: QuizAnswerDto[];
}

export interface QuizAnswerDto {
  questionId: string;
  selectedOptionId?: string;
  timeSpent: number;
}

export interface QuizAttemptResponseDto {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  isPassing: boolean;
  completedAt: Date;
  timeSpent: number;
  answers: QuizAnswerResponseDto[];
}

export interface QuizAnswerResponseDto {
  id: string;
  questionId: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  timeSpent: number;
}
