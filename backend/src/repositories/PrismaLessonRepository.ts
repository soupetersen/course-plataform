import { Lesson, LessonType } from '@/models/Lesson';
import { LessonRepository } from '@/interfaces/LessonRepository';
import { prisma } from '@/infrastructure/database/prisma';
import { LessonProgress } from '@/models/LessonProgress';

export class PrismaLessonRepository implements LessonRepository {
  private prisma = prisma;

  async create(lesson: Lesson): Promise<Lesson> {
    const createdLesson = await this.prisma.lesson.create({
      data: {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content || null,
        description: lesson.description || null,
        videoUrl: lesson.videoUrl || null,
        videoDuration: lesson.videoDuration || null,
        duration: lesson.duration || null,
        order: lesson.order,
        moduleId: lesson.moduleId,
        courseId: lesson.courseId,
        type: lesson.type,
        isPreview: lesson.isPreview || false,
        isLocked: lesson.isLocked || false,
        quizPassingScore: lesson.quizPassingScore || null,
        quizAttempts: lesson.quizAttempts || 0,
        allowReview: lesson.allowReview !== undefined ? lesson.allowReview : true,
      },
      include: {
        module: true,
        course: true,
      },
    });

    return new Lesson({
      id: createdLesson.id,
      title: createdLesson.title,
      content: createdLesson.content || undefined,
      description: createdLesson.description || undefined,
      videoUrl: createdLesson.videoUrl || undefined,
      videoDuration: createdLesson.videoDuration || undefined,
      duration: createdLesson.duration || undefined,
      order: createdLesson.order,
      moduleId: createdLesson.moduleId || '',
      courseId: createdLesson.courseId,
      type: createdLesson.type as LessonType,
      isPreview: createdLesson.isPreview,
      isLocked: createdLesson.isLocked,
      quizPassingScore: createdLesson.quizPassingScore || undefined,
      quizAttempts: createdLesson.quizAttempts,
      allowReview: createdLesson.allowReview,
      createdAt: createdLesson.createdAt,
      updatedAt: createdLesson.updatedAt,
    });
  }

  async findById(id: string): Promise<Lesson | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: true,
        course: true,
        questions: {
          include: {
            options: true,
          },
        },
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
      duration: lesson.duration || undefined,
      order: lesson.order,
      moduleId: lesson.moduleId || '',
      courseId: lesson.courseId,
      type: lesson.type as LessonType,
      isPreview: lesson.isPreview,
      isLocked: lesson.isLocked,
      quizPassingScore: lesson.quizPassingScore || undefined,
      quizAttempts: lesson.quizAttempts,
      allowReview: lesson.allowReview,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    });
  }

  async findByModuleId(moduleId: string): Promise<Lesson[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
      include: {
        module: true,
        course: true,
      },
    });

    return lessons.map((lesson: any) => new Lesson({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content || undefined,
      description: lesson.description || undefined,
      videoUrl: lesson.videoUrl || undefined,
      videoDuration: lesson.videoDuration || undefined,
      duration: lesson.duration || undefined,
      order: lesson.order,
      moduleId: lesson.moduleId || '',
      courseId: lesson.courseId,
      type: lesson.type as LessonType,
      isPreview: lesson.isPreview,
      isLocked: lesson.isLocked,
      quizPassingScore: lesson.quizPassingScore || undefined,
      quizAttempts: lesson.quizAttempts,
      allowReview: lesson.allowReview,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    }));
  }

  async findByCourseId(courseId: string): Promise<Lesson[]> {
    const lessons = await this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: [
        { module: { order: 'asc' } },
        { order: 'asc' }
      ],
      include: {
        module: true,
        course: true,
      },
    });

    return lessons.map((lesson: any) => new Lesson({
      id: lesson.id,
      title: lesson.title,
      content: lesson.content || undefined,
      description: lesson.description || undefined,
      videoUrl: lesson.videoUrl || undefined,
      videoDuration: lesson.videoDuration || undefined,
      duration: lesson.duration || undefined,
      order: lesson.order,
      moduleId: lesson.moduleId || '',
      courseId: lesson.courseId,
      type: lesson.type as LessonType,
      isPreview: lesson.isPreview,
      isLocked: lesson.isLocked,
      quizPassingScore: lesson.quizPassingScore || undefined,
      quizAttempts: lesson.quizAttempts,
      allowReview: lesson.allowReview,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
    }));
  }

  async update(id: string, data: Partial<Lesson>): Promise<Lesson> {
    const updatedLesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        description: data.description,
        videoUrl: data.videoUrl,
        videoDuration: data.videoDuration,
        duration: data.duration,
        order: data.order,
        moduleId: data.moduleId,
        type: data.type,
        isPreview: data.isPreview,
        isLocked: data.isLocked,
        quizPassingScore: data.quizPassingScore,
        quizAttempts: data.quizAttempts,
        allowReview: data.allowReview,
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
      duration: updatedLesson.duration || undefined,
      order: updatedLesson.order,
      moduleId: updatedLesson.moduleId || '',
      courseId: updatedLesson.courseId,
      type: updatedLesson.type as LessonType,
      isPreview: updatedLesson.isPreview,
      isLocked: updatedLesson.isLocked,
      quizPassingScore: updatedLesson.quizPassingScore || undefined,
      quizAttempts: updatedLesson.quizAttempts,
      allowReview: updatedLesson.allowReview,
      createdAt: updatedLesson.createdAt,
      updatedAt: updatedLesson.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lesson.delete({
      where: { id },
    });
  }

  async findProgress(lessonId: string, userId: string): Promise<LessonProgress | null> {
    const progressData = await this.prisma.lessonProgress.findFirst({
      where: {
        lessonId,
        userId,
      },
    });

    if (!progressData) return null;

    const progress = new LessonProgress(
      progressData.id,
      progressData.userId,
      progressData.lessonId,
      progressData.courseId,
      progressData.isCompleted,
      progressData.watchTime,
      progressData.completedAt,
      progressData.lastAccessed,
      progressData.createdAt,
      progressData.updatedAt
    );

    return progress;
  }

  async updateProgress(
    userId: string,
    lessonId: string,
    currentTime: number,
    isCompleted: boolean
  ): Promise<void> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { courseId: true }
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    await this.prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        watchTime: currentTime,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastAccessed: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        courseId: lesson.courseId,
        watchTime: currentTime,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastAccessed: new Date(),
      },
    });
  }
}
