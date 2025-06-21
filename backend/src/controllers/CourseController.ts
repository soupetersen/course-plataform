import { FastifyRequest, FastifyReply } from 'fastify';
import { DIContainer } from '@/shared/utils/DIContainer';
import { CreateCourseUseCase } from '@/use-cases/CreateCourseUseCase';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { CreateCourseDto, UpdateCourseDto } from '@/dtos/CourseDto';

interface CourseParams {
  id: string;
}

export class CourseController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const body = request.body as any;
      
      const createCourseDto: CreateCourseDto = {
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        price: body.price,
        categoryId: body.categoryId,
      };
      
      const createCourseUseCase = this.container.resolve<CreateCourseUseCase>('CreateCourseUseCase');
      const course = await createCourseUseCase.execute(createCourseDto, userInfo.userId);

      reply.status(201).send({
        success: true,
        data: course
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Falha ao criar curso'
      });
    }
  }  
  
  async findAll(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();      const query = request.query as any;
      const where: any = {};
      
      if (query.status) {
        where.isPublished = query.status === 'PUBLISHED';
      }

      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 10;
      const skip = (page - 1) * limit;

      const courses = await prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              description: true            }
          },
          enrollments: true,
          reviews: {
            select: {
              rating: true
            }
          }
        }
      });      const transformedCourses = courses.map((course: any) => {
        const averageRating = course.reviews.length > 0 
          ? course.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / course.reviews.length
          : 0;
        
        return {
          id: course.id,
          title: course.title,
          description: course.description || '',
          imageUrl: course.imageUrl || undefined,
          price: course.price,
          level: 'BEGINNER',
          duration: 0,
          status: course.isPublished ? 'PUBLISHED' : 'DRAFT',
          isActive: true,
          instructorId: course.instructorId,
          instructor: course.instructor,
          categoryId: course.categoryId || '',
          category: course.category,
          enrollments_count: course.enrollments.length,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: course.reviews.length,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        };
      });

      await prisma.$disconnect();

      reply.send({
        success: true,
        data: transformedCourses
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch courses'
      });
    }
  }

  async findById(request: FastifyRequest<{ Params: CourseParams }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          modules: {
            include: {
              lessons: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { order: 'asc' }          },
          enrollments: true,
          reviews: {
            select: {
              rating: true
            }
          }
        }
      });

      if (!course) {
        return reply.status(404).send({
          success: false,
          message: 'Course not found'
        });      }

      const averageRating = course.reviews.length > 0 
        ? course.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / course.reviews.length
        : 0;

      const transformedCourse = {
        id: course.id,
        title: course.title,
        description: course.description || '',
        imageUrl: course.imageUrl || undefined,
        price: course.price,
        level: 'BEGINNER',
        duration: 0,
        status: course.isPublished ? 'PUBLISHED' : 'DRAFT',
        isActive: true,
        instructorId: course.instructorId,
        instructor: course.instructor,
        categoryId: course.categoryId || '',
        category: course.category,
        modules: course.modules || [],
        enrollments: course.enrollments || [],
        averageRating: Math.round(averageRating * 10) / 10,
        reviewCount: course.reviews.length,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      };

      await prisma.$disconnect();

      reply.send({
        success: true,
        data: transformedCourse
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch course'
      });
    }
  }

  async findByInstructor(request: FastifyRequest<{ Params: { instructorId: string } }>, reply: FastifyReply) {
    try {
      const { instructorId } = request.params;
      
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const courses = await prisma.course.findMany({
        where: {
          instructorId: instructorId
        },
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          },
          category: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          modules: true,
          enrollments: true,
          reviews: {
            select: {
              rating: true
            }
          }
        }
      });

      const transformedCourses = courses.map((course: any) => {
        const averageRating = course.reviews.length > 0 
          ? course.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / course.reviews.length
          : 0;
        
        return {
          id: course.id,
          title: course.title,
          description: course.description || '',
          imageUrl: course.imageUrl || undefined,
          price: course.price,
          level: 'BEGINNER',
          duration: 0,
          status: course.isPublished ? 'PUBLISHED' : 'DRAFT',
          isActive: true,
          instructorId: course.instructorId,
          instructor: course.instructor,
          categoryId: course.categoryId || '',
          category: course.category,
          modules: course.modules || [],
          enrollments: course.enrollments || [],
          averageRating: Math.round(averageRating * 10) / 10, 
          reviewCount: course.reviews.length,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt,
        };
      });

      await prisma.$disconnect();

      reply.send({
        success: true,
        data: transformedCourses
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch instructor courses'
      });
    }
  }

  async update(request: FastifyRequest<{ Params: CourseParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { id } = request.params;
      const updateCourseDto = request.body as UpdateCourseDto;

      const courseRepository = this.container.resolve<CourseRepository>('CourseRepository');
      
      const existingCourse = await courseRepository.findById(id);
      if (!existingCourse) {
        return reply.status(404).send({
          success: false,
          message: 'Course not found'
        });
      }

      if (existingCourse.instructorId !== userInfo.userId && userInfo.role !== 'admin') {
        return reply.status(403).send({
          success: false,
          message: 'Not authorized to update this course'
        });
      }

      existingCourse.update(updateCourseDto);
      const updatedCourse = await courseRepository.update(id, existingCourse);

      reply.send({
        success: true,
        data: updatedCourse
      });
    } catch (error) {
      reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update course'
      });
    }
  }

  async delete(request: FastifyRequest<{ Params: CourseParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { id } = request.params;

      const courseRepository = this.container.resolve<CourseRepository>('CourseRepository');
      
      const existingCourse = await courseRepository.findById(id);
      if (!existingCourse) {
        return reply.status(404).send({
          success: false,
          message: 'Course not found'
        });
      }

      if (existingCourse.instructorId !== userInfo.userId && userInfo.role !== 'admin') {
        return reply.status(403).send({
          success: false,
          message: 'Not authorized to delete this course'
        });
      }

      await courseRepository.delete(id);

      reply.send({
        success: true,
        message: 'Course deleted successfully'
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete course'
      });
    }
  }
  async publish(request: FastifyRequest<{ Params: CourseParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { id } = request.params;

      const courseRepository = this.container.resolve<CourseRepository>('CourseRepository');
      
      const existingCourse = await courseRepository.findById(id);
      if (!existingCourse) {
        return reply.status(404).send({
          success: false,
          message: 'Course not found'
        });
      }

      if (existingCourse.instructorId !== userInfo.userId && userInfo.role !== 'admin') {
        return reply.status(403).send({
          success: false,
          message: 'Not authorized to publish this course'
        });
      }

      existingCourse.publish();
      const updatedCourse = await courseRepository.update(id, existingCourse);

      reply.send({
        success: true,
        data: updatedCourse
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to publish course'
      });
    }
  }

  async unpublish(request: FastifyRequest<{ Params: CourseParams }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo;
      if (!userInfo) {
        return reply.status(401).send({
          success: false,
          message: 'User not authenticated'
        });
      }

      const { id } = request.params;

      const courseRepository = this.container.resolve<CourseRepository>('CourseRepository');
      
      const existingCourse = await courseRepository.findById(id);
      if (!existingCourse) {
        return reply.status(404).send({
          success: false,
          message: 'Course not found'
        });
      }

      if (existingCourse.instructorId !== userInfo.userId && userInfo.role !== 'admin') {
        return reply.status(403).send({
          success: false,
          message: 'Not authorized to unpublish this course'
        });
      }

      existingCourse.archive();
      const updatedCourse = await courseRepository.update(id, existingCourse);

      reply.send({
        success: true,
        data: updatedCourse
      });
    } catch (error) {
      reply.status(500).send({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to unpublish course'
      });
    }
  }
}
