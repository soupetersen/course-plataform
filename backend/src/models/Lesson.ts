import { randomUUID } from 'crypto';

export type LessonType = 'VIDEO' | 'TEXT' | 'QUIZ';

export class Lesson {
  id: string;
  title: string;
  content?: string;
  description?: string;
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
  quizPassingScore?: number;
  quizAttempts?: number;
  allowReview?: boolean;
  createdAt: Date;
  updatedAt: Date;
  constructor(params: {
    id: string;
    title: string;
    content?: string;
    description?: string;
    videoUrl?: string;
    videoDuration?: number;
    duration?: number;
    order: number;
    moduleId: string;
    courseId: string;
    type: LessonType;
    isPreview?: boolean;
    isLocked?: boolean;
    isCompleted?: boolean;
    quizPassingScore?: number;
    quizAttempts?: number;
    allowReview?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.title = params.title;
    this.content = params.content;
    this.description = params.description;
    this.videoUrl = params.videoUrl;
    this.videoDuration = params.videoDuration;
    this.duration = params.duration;
    this.order = params.order;
    this.moduleId = params.moduleId;
    this.courseId = params.courseId;
    this.type = params.type;
    this.isPreview = params.isPreview ?? false;
    this.isLocked = params.isLocked ?? false;
    this.isCompleted = params.isCompleted ?? false;
    this.quizPassingScore = params.quizPassingScore;
    this.quizAttempts = params.quizAttempts ?? 0;
    this.allowReview = params.allowReview ?? true;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  static create(data: {
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
  }): Lesson {
    return new Lesson({
      id: randomUUID(),
      title: data.title,
      content: data.content,
      description: data.description,
      videoUrl: data.videoUrl,
      duration: data.duration,
      order: data.order || 0,
      moduleId: data.moduleId,
      courseId: data.courseId,
      type: data.type,
      isPreview: data.isPreview ?? false,
      isLocked: data.isLocked ?? false,
      isCompleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  update(data: Partial<{
    title: string;
    content: string;
    description: string;
    videoUrl: string;
    duration: number;
    order: number;
    type: LessonType;
    isPreview: boolean;
    isLocked: boolean;
  }>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.content !== undefined) this.content = data.content;
    if (data.description !== undefined) this.description = data.description;
    if (data.videoUrl !== undefined) this.videoUrl = data.videoUrl;
    if (data.duration !== undefined) this.duration = data.duration;
    if (data.order !== undefined) this.order = data.order;
    if (data.type !== undefined) this.type = data.type;
    if (data.isPreview !== undefined) this.isPreview = data.isPreview;
    if (data.isLocked !== undefined) this.isLocked = data.isLocked;
    this.updatedAt = new Date();
  }

  markAsCompleted(): void {
    this.isCompleted = true;
    this.updatedAt = new Date();
  }
}
