import { randomUUID } from 'crypto';

export class Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  isLocked: boolean;
  courseId: string;
  lessons?: any[];
  createdAt: Date;
  updatedAt: Date;
  constructor(params: {
    id: string;
    title: string;
    description?: string;
    order: number;
    isLocked?: boolean;
    courseId: string;
    lessons?: any[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.id = params.id;
    this.title = params.title;
    this.description = params.description;
    this.order = params.order;
    this.isLocked = params.isLocked ?? false;
    this.courseId = params.courseId;
    this.lessons = params.lessons;
    this.createdAt = params.createdAt || new Date();
    this.updatedAt = params.updatedAt || new Date();
  }

  static create(params: {
    title: string;
    description?: string;
    order: number;
    courseId: string;
    isLocked?: boolean;
  }): Module {
    return new Module({
      id: randomUUID(),
      title: params.title,
      description: params.description,
      order: params.order,
      isLocked: params.isLocked ?? false,
      courseId: params.courseId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  update(data: Partial<{
    title: string;
    description: string;
    order: number;
    isLocked: boolean;
  }>): void {
    if (data.title !== undefined) this.title = data.title;
    if (data.description !== undefined) this.description = data.description;
    if (data.order !== undefined) this.order = data.order;
    if (data.isLocked !== undefined) this.isLocked = data.isLocked;
    this.updatedAt = new Date();
  }
}
