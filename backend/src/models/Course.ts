import { randomUUID } from 'crypto';

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export class Course {
  id: string;
  title: string;
  description: string;
  content?: string;
  imageUrl?: string;
  price: number;
  duration: number;
  level: CourseLevel;
  status: CourseStatus;
  isActive: boolean;
  instructorId: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    title: string;
    description: string;
    content?: string;
    imageUrl?: string;
    price: number;
    duration: number;
    level: CourseLevel;
    status: CourseStatus;
    isActive?: boolean;
    instructorId: string;
    categoryId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.title = params.title;
    this.description = params.description;
    this.content = params.content;
    this.imageUrl = params.imageUrl;
    this.price = params.price;
    this.duration = params.duration;
    this.level = params.level;
    this.status = params.status;
    this.isActive = params.isActive ?? true;
    this.instructorId = params.instructorId;
    this.categoryId = params.categoryId;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  static create(params: {
    title: string;
    description: string;
    content?: string;
    imageUrl?: string;
    price: number;
    duration: number;
    level: CourseLevel;
    instructorId: string;
    categoryId: string;
  }): Course {
    return new Course({
      id: randomUUID(),
      title: params.title,
      description: params.description,
      content: params.content,
      imageUrl: params.imageUrl,
      price: params.price,
      duration: params.duration,
      level: params.level,
      status: 'DRAFT',
      isActive: true,
      instructorId: params.instructorId,
      categoryId: params.categoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  update(data: Partial<{
    title: string;
    description: string;
    content: string;
    imageUrl: string;
    price: number;
    duration: number;
    level: CourseLevel;
  }>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.content !== undefined) this.content = data.content;
    if (data.imageUrl !== undefined) this.imageUrl = data.imageUrl;
    if (data.price !== undefined) this.price = data.price;
    if (data.duration !== undefined) this.duration = data.duration;
    if (data.level !== undefined) this.level = data.level;
    this.updatedAt = new Date();
  }

  publish(): void {
    this.status = 'PUBLISHED';
    this.updatedAt = new Date();
  }

  archive(): void {
    this.status = 'ARCHIVED';
    this.updatedAt = new Date();
  }

  isPublished(): boolean {
    return this.status === 'PUBLISHED';
  }
}
