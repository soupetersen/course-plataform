
import { LessonRepository } from '@/interfaces/LessonRepository';
import { Lesson, LessonType } from '@/models/Lesson';
import { PrismaClient } from '@prisma/client';

export class PrismaLessonRepository implements LessonRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Partial<Lesson>): Promise<Lesson> {
    const createData = {
      id: data.id!,
      title: data.title!,
      content: data.content!,
      description: data.description,
      videoUrl: data.videoUrl,
      duration: data.duration,
      order: data.order!,
      moduleId: data.moduleId!,
      courseId: data.courseId!,
      type: data.type || 'VIDEO',
      isPreview: data.isPreview ?? false,
      isLocked: data.isLocked ?? false,
      isCompleted: data.isCompleted ?? false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    const lesson = await this.prisma.lesson.create({ data: createData });
    
    
    const lessonWithAllFields = lesson as any;
    
    return new Lesson({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      description: lessonWithAllFields.description || undefined,
      videoUrl: lesson.videoUrl || undefined,
      duration: lesson.duration || undefined,
      order: lesson.order,
      moduleId: lesson.moduleId!,
      courseId: lessonWithAllFields.courseId,
      type: lessonWithAllFields.type as LessonType,
      isPreview: lessonWithAllFields.isPreview,
      isLocked: lessonWithAllFields.isLocked,
      isCompleted: lesson.isCompleted,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    });
  }

  async findById(id: string): Promise<Lesson | null> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return null;
    
    
    const lessonWithAllFields = lesson as any;
    
    return new Lesson({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      description: lessonWithAllFields.description || undefined,
      videoUrl: lesson.videoUrl || undefined,
      duration: lesson.duration || undefined,
      order: lesson.order,
      moduleId: lesson.moduleId!,
      courseId: lessonWithAllFields.courseId,
      type: (lessonWithAllFields.type || 'VIDEO') as LessonType,
      isPreview: lessonWithAllFields.isPreview || false,
      isLocked: lessonWithAllFields.isLocked || false,
      isCompleted: lesson.isCompleted,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    });
  }

  async findByCourseId(courseId: string): Promise<Lesson[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId } as any,
      orderBy: { order: 'asc' }
    });
    
    return lessons.map(lesson => {
      const lessonWithAllFields = lesson as any;
      return new Lesson({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        description: lessonWithAllFields.description || undefined,
        videoUrl: lesson.videoUrl || undefined,
        duration: lesson.duration || undefined,
        order: lesson.order,
        moduleId: lesson.moduleId!,
        courseId: lessonWithAllFields.courseId,
        type: (lessonWithAllFields.type || 'VIDEO') as LessonType,
        isPreview: lessonWithAllFields.isPreview || false,
        isLocked: lessonWithAllFields.isLocked || false,
        isCompleted: lesson.isCompleted,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      });
    });
  }

  async findByModuleId(moduleId: string): Promise<Lesson[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' }
    });
    
    return lessons.map(lesson => {
      const lessonWithAllFields = lesson as any;
      return new Lesson({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        description: lessonWithAllFields.description || undefined,
        videoUrl: lesson.videoUrl || undefined,
        duration: lesson.duration || undefined,
        order: lesson.order,
        moduleId: lesson.moduleId!,
        courseId: lessonWithAllFields.courseId,
        type: (lessonWithAllFields.type || 'VIDEO') as LessonType,
        isPreview: lessonWithAllFields.isPreview || false,
        isLocked: lessonWithAllFields.isLocked || false,
        isCompleted: lesson.isCompleted,
        createdAt: lesson.createdAt,
        updatedAt: lesson.updatedAt,
      });
    });
  }

  async update(id: string, data: Partial<Lesson>): Promise<Lesson> {
    const updateData = {
      title: data.title,
      content: data.content,
      description: data.description,
      videoUrl: data.videoUrl,
      duration: data.duration,
      order: data.order,
      type: data.type,
      isPreview: data.isPreview,
      isLocked: data.isLocked,
      updatedAt: new Date(),
    };
    const lesson = await this.prisma.lesson.update({ where: { id }, data: updateData as any });
    
    const lessonWithAllFields = lesson as any;
    return new Lesson({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content,
      description: lessonWithAllFields.description || undefined,
      videoUrl: lesson.videoUrl || undefined,
      duration: lesson.duration || undefined,
      order: lesson.order,
      moduleId: lesson.moduleId!,
      courseId: lessonWithAllFields.courseId,
      type: (lessonWithAllFields.type || 'VIDEO') as LessonType,
      isPreview: lessonWithAllFields.isPreview || false,
      isLocked: lessonWithAllFields.isLocked || false,
      isCompleted: lesson.isCompleted,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lesson.delete({ where: { id } });
  }
}
