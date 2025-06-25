import { Lesson, LessonType } from '@/models/Lesson';
import { LessonRepository } from '@/interfaces/LessonRepository';
import { PrismaService } from '@/infrastructure/database/prisma';
import { LessonProgress } from '@/models/LessonProgress';

export class PrismaLessonRepository implements LessonRepository {
  constructor(private prisma: PrismaService) {}

  async create(lesson: Lesson): Promise<Lesson> {
    const createdLesson = await this.prisma.lesson.create({
      data: {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content || null,
        description: lesson.description || null,
        videoUrl: lesson.videoUrl || null,
        videoDuration: lesson.videoDuration || null,
        orderIndex: lesson.order,
        moduleId: lesson.moduleId,
        courseId: lesson.courseId,
        lessonType: lesson.type,
        isFree: lesson.isPreview || false,
        createdAt: lesson.createdAt || new Date(),
        updatedAt: lesson.updatedAt || new Date(),
      },
      include: {
        module: true,
        course: true,
      },
    });

    const lessonWithAllFields = await this.prisma.lesson.findUnique({
      where: { id: createdLesson.id },
      include: { module: true, course: true },
    });

    if (!lessonWithAllFields) {
      throw new Error('Lesson not found after creation');
    }
    
    return new Lesson({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content || undefined,
      description: lessonWithAllFields.description || undefined,
      videoUrl: lesson.videoUrl || undefined,
      duration: lesson.duration || undefined,
      order: lesson.order,
      moduleId: lesson.moduleId!,
      courseId: lessonWithAllFields.courseId,
      type: lesson.type,
      isPreview: lesson.isPreview || false,
      isLocked: lesson.isLocked || false,
      createdAt: lesson.createdAt || new Date(),
      updatedAt: lesson.updatedAt || new Date(),
    });
  }

  async findById(id: string): Promise<Lesson | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: true,
        course: true,
      },
    });

    if (!lesson) return null;

    return new Lesson({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content || undefined,
      description: lesson.description || undefined,
      videoUrl: lesson.videoUrl || undefined,
      videoDuration: lesson.videoDuration || undefined,
      duration: lesson.videoDuration || undefined,
      order: lesson.orderIndex,
      moduleId: lesson.moduleId,
      courseId: lesson.courseId,
      type: lesson.lessonType as LessonType,
      isPreview: lesson.isFree,
      isLocked: false,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    });
  }

  async findByModuleId(moduleId: string): Promise<Lesson[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { orderIndex: 'asc' },
      include: {
        module: true,
        course: true,
        lessonProgress: true,
      },
    });

    return lessons.map(lesson => new Lesson({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content || undefined,
      description: lesson.description || undefined,
      videoUrl: lesson.videoUrl || undefined,
      videoDuration: lesson.videoDuration || undefined,
      duration: lesson.videoDuration || undefined,
      order: lesson.orderIndex,
      moduleId: lesson.moduleId,
      courseId: lesson.courseId,
      type: lesson.lessonType as LessonType,
      isPreview: lesson.isFree,
      isLocked: false,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    }));
  }

  async findByCourseId(courseId: string): Promise<Lesson[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: [
        { module: { orderIndex: 'asc' } },
        { orderIndex: 'asc' }
      ],
      include: {
        module: true,
        course: true,
        lessonProgress: true,
      },
    });

    return lessons.map(lesson => new Lesson({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content || undefined,
      description: lesson.description || undefined,
      videoUrl: lesson.videoUrl || undefined,
      videoDuration: lesson.videoDuration || undefined,
      duration: lesson.videoDuration || undefined,
      order: lesson.orderIndex,
      moduleId: lesson.moduleId,
      courseId: lesson.courseId,
      type: lesson.lessonType as LessonType,
      isPreview: lesson.isFree,
      isLocked: false,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    }));
  }

  async update(lesson: Lesson): Promise<Lesson> {
    const updatedLesson = await this.prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        title: lesson.title,
        content: lesson.content || undefined,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        videoDuration: lesson.videoDuration,
        orderIndex: lesson.order,
        lessonType: lesson.type,
        isFree: lesson.isPreview || false,
        updatedAt: new Date(),
      },
      include: {
        module: true,
        course: true,
      },
    });

    return new Lesson({
      id: updatedLesson.id,
      title: updatedLesson.title,
      content: updatedLesson.content || undefined,
      description: updatedLesson.description || undefined,
      videoUrl: updatedLesson.videoUrl || undefined,
      videoDuration: updatedLesson.videoDuration || undefined,
      duration: updatedLesson.videoDuration || undefined,
      order: updatedLesson.orderIndex,
      moduleId: updatedLesson.moduleId,
      courseId: updatedLesson.courseId,
      type: updatedLesson.lessonType as LessonType,
      isPreview: updatedLesson.isFree,
      isLocked: false,
      createdAt: updatedLesson.createdAt,
      updatedAt: updatedLesson.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lesson.delete({
      where: { id },
    });
  }

  async getWithProgress(lessonId: string, userId: string): Promise<{ lesson: Lesson; progress: LessonProgress | null }> {
    const lesson = await this.findById(lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const progressData = await this.prisma.lessonProgress.findFirst({
      where: {
        lessonId,
        userId,
      },
    });

    const progress = progressData ? new LessonProgress(
      progressData.id,
      progressData.userId,
      progressData.lessonId,
      progressData.courseId,
      progressData.isCompleted,
      progressData.completedAt || undefined,
      progressData.watchTime || 0,
      progressData.createdAt,
      progressData.updatedAt
    ) : null;

    return { lesson, progress };
  }
}
