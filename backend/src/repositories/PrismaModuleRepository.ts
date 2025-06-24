import { ModuleRepository } from '@/interfaces/ModuleRepository';
import { Module } from '@/models/Module';
import { PrismaClient } from '@prisma/client';

export class PrismaModuleRepository implements ModuleRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Partial<Module>): Promise<Module> {
    const createData = {
      id: data.id!,
      title: data.title!,
      description: data.description,
      order: data.order!,
      courseId: data.courseId!,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    const module = await this.prisma.module.create({ data: createData });
    return new Module({
      id: module.id,
      title: module.title,
      description: module.description || undefined,
      order: module.order,
      isLocked: false,
      courseId: module.courseId,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    });
  }

  async findById(id: string): Promise<Module | null> {
    const module = await this.prisma.module.findUnique({ where: { id } });
    if (!module) return null;
    return new Module({
      id: module.id,
      title: module.title,
      description: module.description || undefined,
      order: module.order,
      isLocked: false,
      courseId: module.courseId,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    });
  }

  async findAll(): Promise<Module[]> {
    const modules = await this.prisma.module.findMany();
    return modules.map(module => new Module({
      id: module.id,
      title: module.title,
      description: module.description || undefined,
      order: module.order,
      isLocked: false,
      courseId: module.courseId,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    }));
  }
  async findByCourseId(courseId: string): Promise<Module[]> {
    const modules = await this.prisma.module.findMany({ 
      where: { courseId }, 
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' } 
    });
    return modules.map(module => new Module({
      id: module.id,
      title: module.title,
      description: module.description || undefined,
      order: module.order,
      isLocked: false,
      courseId: module.courseId,
      lessons: module.lessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        description: lesson.description || undefined,
        videoUrl: lesson.videoUrl || undefined,
        duration: lesson.duration,
        order: lesson.order,
        moduleId: lesson.moduleId,
        courseId: lesson.courseId,
        type: lesson.type as any,
        isPreview: lesson.isPreview,
        isLocked: lesson.isLocked,
        quizPassingScore: lesson.quizPassingScore || undefined,
        createdAt: lesson.createdAt.toISOString(),
        updatedAt: lesson.updatedAt.toISOString(),
      })),
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    }));
  }

  async update(id: string, data: Partial<Module>): Promise<Module> {
    const updateData = {
      title: data.title,
      description: data.description,
      order: data.order,
      updatedAt: new Date(),
    };
    const module = await this.prisma.module.update({ where: { id }, data: updateData });
    return new Module({
      id: module.id,
      title: module.title,
      description: module.description || undefined,
      order: module.order,
      isLocked: false,
      courseId: module.courseId,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.module.delete({ where: { id } });
  }
}
