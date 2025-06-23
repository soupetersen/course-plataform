export type LessonType = 'VIDEO' | 'TEXT' | 'QUIZ';

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  duration?: number;
  order: number;
  moduleId: string;
  courseId: string;
  type: LessonType;
  isPreview: boolean;
  isLocked: boolean;
  quizPassingScore?: number;
  quizAttempts?: number;
  allowReview?: boolean;
  questions?: Question[];
  progress?: LessonProgress;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  question: string;
  explanation?: string;
  order: number;
  points: number;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface CreateLessonData {
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoDuration?: number;
  duration?: number;
  order?: number;
  moduleId: string;
  type: LessonType;
  isPreview?: boolean;
  isLocked?: boolean;
  quizPassingScore?: number;
  quizAttempts?: number;
  allowReview?: boolean;
}

export interface CreateQuestionData {
  question: string;
  explanation?: string;
  order: number;
  points: number;
  options: CreateQuestionOptionData[];
}

export interface CreateQuestionOptionData {
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  watchTime: number;
  completedAt?: Date;
  lastAccessed: Date;
}

export interface QuizAttempt {
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
  answers: QuizAnswer[];
}

export interface QuizAnswer {
  id: string;
  questionId: string;
  selectedOptionId?: string;
  isCorrect: boolean;
  timeSpent: number;
}
