export interface CreateModuleDto {
  title: string;
  description?: string;
  order?: number;
  courseId: string;
}

export interface UpdateModuleDto {
  title?: string;
  description?: string;
  order?: number;
}

export interface ModuleResponseDto {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  lessonsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  lessons?: LessonResponseDto[];
}

interface LessonResponseDto {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isCompleted?: boolean;
}
