import { LessonType } from '@/models/Lesson';
import { QuestionResponseDto } from './QuestionDto';

export interface CreateLessonDto {
  title: string;
  content?: string;
  description?: string;
  videoUrl?: string;
  videoDuration?: number;
  duration?: number;
  order?: number;
  moduleId: string;
  courseId: string;
  type: LessonType;
  isPreview?: boolean;
  isLocked?: boolean;
  // Campos específicos para quiz
  quizPassingScore?: number;
  quizAttempts?: number;
  allowReview?: boolean;
}

export interface UpdateLessonDto {
  title?: string;
  content?: string;
  description?: string;
  videoUrl?: string;
  videoDuration?: number;
  duration?: number;
  order?: number;
  type?: LessonType;
  isPreview?: boolean;
  isLocked?: boolean;
  // Campos específicos para quiz
  quizPassingScore?: number;
  quizAttempts?: number;
  allowReview?: boolean;
}

export interface LessonResponseDto {
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
  isCompleted?: boolean;
  // Campos específicos para quiz
  quizPassingScore?: number;
  quizAttempts?: number;
  allowReview?: boolean;
  questions?: QuestionResponseDto[];
  // Dados de progresso
  progress?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateLessonCommentDto {
  content: string;
  lessonId: string;
  parentId?: string;
}

export interface UpdateLessonProgressDto {
  watchTime: number;
  isCompleted?: boolean;
}
