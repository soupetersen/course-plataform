import { ReviewRepository } from '@/interfaces/ReviewRepository';
import { Review } from '@/models/Review';
import { PrismaClient } from '@prisma/client';

export class PrismaReviewRepository implements ReviewRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Partial<Review>): Promise<Review> {
    const createData = {
      id: data.id!,
      rating: data.rating!,
      comment: data.comment,
      userId: data.userId!,
      courseId: data.courseId!,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };

    const review = await this.prisma.review.create({ data: createData });
    
    return new Review({
      id: review.id,
      rating: review.rating,
      comment: review.comment || undefined,
      userId: review.userId,
      courseId: review.courseId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    });
  }

  async findById(id: string): Promise<Review | null> {
    const review = await this.prisma.review.findUnique({ 
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!review) return null;
    
    return new Review({
      id: review.id,
      rating: review.rating,
      comment: review.comment || undefined,
      userId: review.userId,
      courseId: review.courseId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    });
  }

  async findByCourseId(courseId: string): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({ 
      where: { courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return reviews.map(review => new Review({
      id: review.id,
      rating: review.rating,
      comment: review.comment || undefined,
      userId: review.userId,
      courseId: review.courseId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));
  }

  async findByUserId(userId: string): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({ 
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return reviews.map(review => new Review({
      id: review.id,
      rating: review.rating,
      comment: review.comment || undefined,
      userId: review.userId,
      courseId: review.courseId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    }));
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<Review | null> {
    const review = await this.prisma.review.findUnique({ 
      where: { 
        userId_courseId: {
          userId,
          courseId
        }
      }
    });
    
    if (!review) return null;
    
    return new Review({
      id: review.id,
      rating: review.rating,
      comment: review.comment || undefined,
      userId: review.userId,
      courseId: review.courseId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    });
  }

  async update(id: string, data: Partial<Review>): Promise<Review> {
    const updateData = {
      rating: data.rating,
      comment: data.comment,
      updatedAt: new Date(),
    };
    
    const review = await this.prisma.review.update({ 
      where: { id }, 
      data: updateData 
    });
    
    return new Review({
      id: review.id,
      rating: review.rating,
      comment: review.comment || undefined,
      userId: review.userId,
      courseId: review.courseId,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({ where: { id } });
  }

  async getAverageRatingByCourse(courseId: string): Promise<number> {
    const result = await this.prisma.review.aggregate({
      where: { courseId },
      _avg: {
        rating: true
      }
    });
    
    return result._avg.rating || 0;
  }

  async getReviewCountByCourse(courseId: string): Promise<number> {
    return await this.prisma.review.count({
      where: { courseId }
    });
  }
}
