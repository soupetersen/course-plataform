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
  async findByUserId(userId: string): Promise<any[]> {
    const enrollments = await this.prisma.enrollment.findMany({ 
      where: { userId },
      include: {
        course: {
          include: {
            instructor: true,
            category: true,
            modules: {
              include: {
                lessons: true
              }
            }
          }
        },
        user: true
      }
    });
      return enrollments.map(enrollment => ({
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt || undefined,
      progress: enrollment.progress,
      isActive: enrollment.isActive,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      course: {
        ...enrollment.course,
        instructor: enrollment.course.instructor ? {
          id: enrollment.course.instructor.id,
          name: enrollment.course.instructor.name,
          email: enrollment.course.instructor.email,
          role: enrollment.course.instructor.role,
          isActive: enrollment.course.instructor.isActive,
          createdAt: enrollment.course.instructor.createdAt,
          updatedAt: enrollment.course.instructor.updatedAt,
        } : null,
      },
    }));
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
  }  async findActiveByUserId(userId: string): Promise<any[]> {
    const enrollments = await this.prisma.enrollment.findMany({ 
      where: { userId, isActive: true },
      include: {
        course: {
          include: {
            instructor: true,
            category: true,
            modules: {
              include: {
                lessons: true
              }
            }
          }
        },
        user: true
      }
    });
    
    return enrollments.map(enrollment => ({
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt || undefined,
      progress: enrollment.progress,
      isActive: enrollment.isActive,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      course: {
        ...enrollment.course,
        instructor: enrollment.course.instructor ? {
          id: enrollment.course.instructor.id,
          name: enrollment.course.instructor.name,
          email: enrollment.course.instructor.email,
          role: enrollment.course.instructor.role,
          isActive: enrollment.course.instructor.isActive,
          createdAt: enrollment.course.instructor.createdAt,
          updatedAt: enrollment.course.instructor.updatedAt,
        } : null,
      },
      user: enrollment.user ? {
        id: enrollment.user.id,
        name: enrollment.user.name,
        email: enrollment.user.email,
        role: enrollment.user.role,
        isActive: enrollment.user.isActive,
        createdAt: enrollment.user.createdAt,
        updatedAt: enrollment.user.updatedAt,
      } : null
    }));
  }  async findCompletedByUserId(userId: string): Promise<any[]> {
    const enrollments = await this.prisma.enrollment.findMany({ 
      where: { userId, completedAt: { not: null } },
      include: {
        course: {
          include: {
            instructor: true,
            category: true,
            modules: {
              include: {
                lessons: true
              }
            }
          }
        },
        user: true
      }
    });
    
    return enrollments.map(enrollment => ({
      id: enrollment.id,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt || undefined,
      progress: enrollment.progress,
      isActive: enrollment.isActive,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
      course: {
        ...enrollment.course,
        instructor: enrollment.course.instructor ? {
          id: enrollment.course.instructor.id,
          name: enrollment.course.instructor.name,
          email: enrollment.course.instructor.email,
          role: enrollment.course.instructor.role,
          isActive: enrollment.course.instructor.isActive,
          createdAt: enrollment.course.instructor.createdAt,
          updatedAt: enrollment.course.instructor.updatedAt,
        } : null,
      },
      user: enrollment.user ? {
        id: enrollment.user.id,
        name: enrollment.user.name,
        email: enrollment.user.email,
        role: enrollment.user.role,
        isActive: enrollment.user.isActive,
        createdAt: enrollment.user.createdAt,
        updatedAt: enrollment.user.updatedAt,
      } : null
    }));
  }

  async addUserToCourse(courseId: string, userId: string): Promise<Enrollment> {
    const enrollment = await this.create({
      id: crypto.randomUUID(),
      userId,
      courseId,
      enrolledAt: new Date(),
      isActive: true,
    });
    return enrollment;
  }

  async removeUserFromCourse(courseId: string, userId: string): Promise<void> {
    const enrollment = await this.findByUserAndCourse(userId, courseId);
    if (enrollment) {
      await this.delete(enrollment.id);
    }
  }

  async pauseUserEnrollment(courseId: string, userId: string): Promise<void> {
    const enrollment = await this.findByUserAndCourse(userId, courseId);
    if (enrollment) {
      await this.update(enrollment.id, { isActive: false });
    }
  }

  async resumeUserEnrollment(courseId: string, userId: string): Promise<void> {
    const enrollment = await this.findByUserAndCourse(userId, courseId);
    if (enrollment) {
      await this.update(enrollment.id, { isActive: true });
    }
  }
}
