import { EnrollmentRepository } from '@/interfaces/EnrollmentRepository';
import { Enrollment } from '@/models/Enrollment';
import { PrismaClient } from '@prisma/client';

export class PrismaEnrollmentRepository implements EnrollmentRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Partial<Enrollment>): Promise<Enrollment> {
    const createData = {
      id: data.id!,
      userId: data.userId!,
      courseId: data.courseId!,
      enrolledAt: data.enrolledAt || new Date(),
      completedAt: data.completedAt,
      progress: data.progress ?? 0,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    const enrollment = await this.prisma.enrollment.create({ data: createData });
    return new Enrollment(
      enrollment.id,
      enrollment.userId,
      enrollment.courseId,
      enrollment.enrolledAt,
      enrollment.completedAt || undefined,
      enrollment.progress,
      enrollment.isActive,
      enrollment.createdAt,
      enrollment.updatedAt
    );
  }

  async findById(id: string): Promise<Enrollment | null> {
    const enrollment = await this.prisma.enrollment.findUnique({ where: { id } });
    if (!enrollment) return null;
    return new Enrollment(
      enrollment.id,
      enrollment.userId,
      enrollment.courseId,
      enrollment.enrolledAt,
      enrollment.completedAt || undefined,
      enrollment.progress,
      enrollment.isActive,
      enrollment.createdAt,
      enrollment.updatedAt
    );
  }

  async findAll(): Promise<Enrollment[]> {
    const enrollments = await this.prisma.enrollment.findMany();
    return enrollments.map(enrollment => new Enrollment(
      enrollment.id,
      enrollment.userId,
      enrollment.courseId,
      enrollment.enrolledAt,
      enrollment.completedAt || undefined,
      enrollment.progress,
      enrollment.isActive,
      enrollment.createdAt,
      enrollment.updatedAt
    ));
  }

  async findByUserId(userId: string): Promise<Enrollment[]> {
    const enrollments = await this.prisma.enrollment.findMany({ where: { userId } });
    return enrollments.map(enrollment => new Enrollment(
      enrollment.id,
      enrollment.userId,
      enrollment.courseId,
      enrollment.enrolledAt,
      enrollment.completedAt || undefined,
      enrollment.progress,
      enrollment.isActive,
      enrollment.createdAt,
      enrollment.updatedAt
    ));
  }

  async findByCourseId(courseId: string): Promise<Enrollment[]> {
    const enrollments = await this.prisma.enrollment.findMany({ where: { courseId } });
    return enrollments.map(enrollment => new Enrollment(
      enrollment.id,
      enrollment.userId,
      enrollment.courseId,
      enrollment.enrolledAt,
      enrollment.completedAt || undefined,
      enrollment.progress,
      enrollment.isActive,
      enrollment.createdAt,
      enrollment.updatedAt
    ));
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Enrollment | null> {
    const enrollment = await this.prisma.enrollment.findFirst({ where: { userId, courseId } });
    if (!enrollment) return null;
    return new Enrollment(
      enrollment.id,
      enrollment.userId,
      enrollment.courseId,
      enrollment.enrolledAt,
      enrollment.completedAt || undefined,
      enrollment.progress,
      enrollment.isActive,
      enrollment.createdAt,
      enrollment.updatedAt
    );
  }

  async update(id: string, data: Partial<Enrollment>): Promise<Enrollment> {
    const updateData = {
      completedAt: data.completedAt,
      progress: data.progress,
      isActive: data.isActive,
      updatedAt: new Date(),
    };
    const enrollment = await this.prisma.enrollment.update({ where: { id }, data: updateData });
    return new Enrollment(
      enrollment.id,
      enrollment.userId,
      enrollment.courseId,
      enrollment.enrolledAt,
      enrollment.completedAt || undefined,
      enrollment.progress,
      enrollment.isActive,
      enrollment.createdAt,
      enrollment.updatedAt
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.enrollment.delete({ where: { id } });
  }

  async findActiveByUserId(userId: string): Promise<Enrollment[]> {
    const enrollments = await this.prisma.enrollment.findMany({ where: { userId, isActive: true } });
    return enrollments.map(enrollment => new Enrollment(
      enrollment.id,
      enrollment.userId,
      enrollment.courseId,
      enrollment.enrolledAt,
      enrollment.completedAt || undefined,
      enrollment.progress,
      enrollment.isActive,
      enrollment.createdAt,
      enrollment.updatedAt
    ));
  }

  async findCompletedByUserId(userId: string): Promise<Enrollment[]> {
    const enrollments = await this.prisma.enrollment.findMany({ where: { userId, completedAt: { not: null } } });
    return enrollments.map(enrollment => new Enrollment(
      enrollment.id,
      enrollment.userId,
      enrollment.courseId,
      enrollment.enrolledAt,
      enrollment.completedAt || undefined,
      enrollment.progress,
      enrollment.isActive,
      enrollment.createdAt,
      enrollment.updatedAt
    ));
  }
}
