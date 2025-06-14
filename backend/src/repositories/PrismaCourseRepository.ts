import { CourseRepository } from '@/interfaces/CourseRepository';
import { Course, CourseLevel, CourseStatus } from '@/models/Course';
import { PrismaClient } from '@prisma/client';

export class PrismaCourseRepository implements CourseRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Partial<Course>): Promise<Course> {
    const createData = {
      id: data.id!,
      title: data.title!,
      description: data.description,
      imageUrl: data.imageUrl,
      price: data.price!,
      isPublished: data.status === 'PUBLISHED',
      instructorId: data.instructorId!,
      categoryId: data.categoryId,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    const course = await this.prisma.course.create({ data: createData });
    return new Course({
      id: course.id,
      title: course.title,
      description: course.description || '',
      imageUrl: course.imageUrl || undefined,
      price: course.price,
      level: 'BEGINNER' as CourseLevel,
      duration: 0, 
      status: course.isPublished ? 'PUBLISHED' : 'DRAFT' as CourseStatus,
      isActive: true,
      instructorId: course.instructorId,
      categoryId: course.categoryId || '',
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    });
  }

  async findById(id: string): Promise<Course | null> {
    const course = await this.prisma.course.findUnique({ 
      where: { id }
    });
    if (!course) return null;
    return new Course({
      id: course.id,
      title: course.title,
      description: course.description || '',
      imageUrl: course.imageUrl || undefined,
      price: course.price,
      level: 'BEGINNER' as CourseLevel,
      duration: 0,
      status: course.isPublished ? 'PUBLISHED' : 'DRAFT' as CourseStatus,
      isActive: true,
      instructorId: course.instructorId,
      categoryId: course.categoryId || '',
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    });
  }

  async findAll(): Promise<Course[]> {
    const courses = await this.prisma.course.findMany();
    return courses.map(course => new Course({
      id: course.id,
      title: course.title,
      description: course.description || '',
      imageUrl: course.imageUrl || undefined,
      price: course.price,
      level: 'BEGINNER' as CourseLevel,
      duration: 0,
      status: course.isPublished ? 'PUBLISHED' : 'DRAFT' as CourseStatus,
      isActive: true,
      instructorId: course.instructorId,
      categoryId: course.categoryId || '',
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }));
  }

  async update(id: string, data: Partial<Course>): Promise<Course> {
    const updateData = {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      price: data.price,
      isPublished: data.status === 'PUBLISHED',
      categoryId: data.categoryId,
      updatedAt: new Date(),
    };
    const course = await this.prisma.course.update({ where: { id }, data: updateData });
    return new Course({
      id: course.id,
      title: course.title,
      description: course.description || '',
      imageUrl: course.imageUrl || undefined,
      price: course.price,
      level: 'BEGINNER' as CourseLevel,
      duration: 0,
      status: course.isPublished ? 'PUBLISHED' : 'DRAFT' as CourseStatus,
      isActive: true,
      instructorId: course.instructorId,
      categoryId: course.categoryId || '',
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.course.delete({ where: { id } });
  }
}
