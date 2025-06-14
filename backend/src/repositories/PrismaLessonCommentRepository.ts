import { LessonCommentRepository } from '@/interfaces/LessonCommentRepository';
import { LessonComment } from '@/models/LessonComment';
import { PrismaClient } from '@prisma/client';

export class PrismaLessonCommentRepository implements LessonCommentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Partial<LessonComment>): Promise<LessonComment> {
    const createData = {
      id: data.id!,
      content: data.content!,
      userId: data.enrollmentId!,
      lessonId: data.lessonId!,
      parentId: undefined,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    const comment = await this.prisma.lessonComment.create({ data: createData });
    return new LessonComment({
      id: comment.id,
      content: comment.content,
      lessonId: comment.lessonId,
      enrollmentId: comment.userId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });
  }

  async findByLessonId(lessonId: string): Promise<LessonComment[]> {
    const comments = await this.prisma.lessonComment.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'asc' }
    });
    return comments.map(comment => new LessonComment({
      id: comment.id,
      content: comment.content,
      lessonId: comment.lessonId,
      enrollmentId: comment.userId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));
  }

  async findById(id: string): Promise<LessonComment | null> {
    const comment = await this.prisma.lessonComment.findUnique({ where: { id } });
    if (!comment) return null;
    return new LessonComment({
      id: comment.id,
      content: comment.content,
      lessonId: comment.lessonId,
      enrollmentId: comment.userId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.lessonComment.delete({ where: { id } });
  }
}
