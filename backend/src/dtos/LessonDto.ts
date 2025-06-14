import { LessonType } from '@/models/Lesson';

export interface CreateLessonDto {
  title: string;
  content: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  moduleId: string;
  courseId: string;
  type: LessonType;
  isPreview?: boolean;
  isLocked?: boolean;
}

export interface UpdateLessonDto {
  title?: string;
  content?: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order?: number;
  type?: LessonType;
  isPreview?: boolean;
  isLocked?: boolean;
}

export interface LessonResponseDto {
  id: string;
  title: string;
  description?: string;
  content: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  moduleId: string;
  courseId: string;
  type: LessonType;
  isPreview: boolean;
  isLocked: boolean;
  isCompleted?: boolean;
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
