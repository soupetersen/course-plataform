import { FastifyRequest, FastifyReply } from 'fastify';
import { ManageCouponsUseCase } from '@/use-cases/ManageCouponsUseCase';

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    role: string;
  };
}

export class InstructorCouponController {
  constructor(private manageCouponsUseCase: ManageCouponsUseCase) {}

  async createCoupon(req: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN')) {
        reply.status(403).send({
          success: false,
          error: 'Access denied. Only instructors can create coupons.'
        });
        return;
      }

      const { 
        code, 
        description,
        discountType, 
        discountValue, 
        maxUses, 
        validUntil, 
        isActive,
        courseId 
      } = req.body as {
        code: string;
        description?: string;
        discountType: 'PERCENTAGE' | 'FLAT_RATE';
        discountValue: number;
        maxUses?: number;
        validUntil?: string;
        isActive?: boolean;
        courseId?: string;
      };

      if (courseId) {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        const course = await prisma.course.findFirst({
          where: {
            id: courseId,
            instructorId: req.user.id
          }
        });

        if (!course) {
          reply.status(403).send({
            success: false,
            error: 'You can only create coupons for your own courses.'
          });
          return;
        }
        
        await prisma.$disconnect();
      }

      const result = await this.manageCouponsUseCase.createCoupon({
        code,
        description,
        discountType,
        discountValue,
        maxUses,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        isActive: isActive ?? true,
        courseId: courseId || undefined, 
        createdById: req.user.id
      });

      if (!result.success) {
        reply.status(400).send({
          success: false,
          error: result.error
        });
        return;
      }

      reply.status(201).send({
        success: true,
        data: {
          id: result.coupon?.id,
          code: result.coupon?.code,
          description: result.coupon?.description,
          discountType: result.coupon?.discountType,
          discountValue: result.coupon?.discountValue,
          maxUses: result.coupon?.maxUses,
          usedCount: result.coupon?.usedCount,
          validFrom: result.coupon?.validFrom,
          validUntil: result.coupon?.validUntil,
          isActive: result.coupon?.isActive,
          courseId: result.coupon?.courseId,
          createdAt: result.coupon?.createdAt
        }
      });
    } catch (error) {
      req.log.error('Error creating instructor coupon:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to create coupon'
      });
    }
  }

  async getMyCoupons(req: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN')) {
        reply.status(403).send({
          success: false,
          error: 'Access denied. Only instructors can view their coupons.'
        });
        return;
      }

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const coupons = await prisma.coupon.findMany({
        where: {
          createdById: req.user.id
        },
        include: {
          course: {
            select: {
              id: true,
              title: true
            }
          },
          usages: {
            select: {
              id: true,
              usedAt: true,
              discountAmount: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      await prisma.$disconnect();

      const transformedCoupons = coupons.map((coupon: any) => ({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
        validFrom: coupon.validFrom,
        validUntil: coupon.validUntil,
        isActive: coupon.isActive,
        courseId: coupon.courseId,
        courseName: coupon.course?.title || 'All Courses',
        totalDiscountGiven: coupon.usages.reduce((sum: number, usage: any) => sum + usage.discountAmount, 0),
        usages: coupon.usages,
        createdAt: coupon.createdAt
      }));

      reply.send({
        success: true,
        data: transformedCoupons
      });
    } catch (error) {
      req.log.error('Error fetching instructor coupons:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch coupons'
      });
    }
  }

  async updateMyCoupon(req: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN')) {
        reply.status(403).send({
          success: false,
          error: 'Access denied. Only instructors can update their coupons.'
        });
        return;
      }

      const { id } = req.params as { id: string };
      const updateData = req.body as {
        code?: string;
        description?: string;
        discountType?: 'PERCENTAGE' | 'FLAT_RATE';
        discountValue?: number;
        maxUses?: number;
        validUntil?: string;
        isActive?: boolean;
        courseId?: string;
      };

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const existingCoupon = await prisma.coupon.findFirst({
        where: {
          id,
          createdById: req.user.id
        }
      });

      if (!existingCoupon) {
        reply.status(404).send({
          success: false,
          error: 'Coupon not found or you do not have permission to update it.'
        });
        return;
      }

      if (updateData.courseId) {
        const course = await prisma.course.findFirst({
          where: {
            id: updateData.courseId,
            instructorId: req.user.id
          }
        });

        if (!course) {
          reply.status(403).send({
            success: false,
            error: 'You can only assign coupons to your own courses.'
          });
          return;
        }
      }

      await prisma.$disconnect();

      const result = await this.manageCouponsUseCase.updateCoupon({
        id,
        ...updateData,
        validUntil: updateData.validUntil ? new Date(updateData.validUntil) : undefined
      });

      if (!result.success) {
        reply.status(400).send({
          success: false,
          error: result.error
        });
        return;
      }

      reply.send({
        success: true,
        data: {
          id: result.coupon?.id,
          code: result.coupon?.code,
          description: result.coupon?.description,
          discountType: result.coupon?.discountType,
          discountValue: result.coupon?.discountValue,
          maxUses: result.coupon?.maxUses,
          usedCount: result.coupon?.usedCount,
          validFrom: result.coupon?.validFrom,
          validUntil: result.coupon?.validUntil,
          isActive: result.coupon?.isActive,
          courseId: result.coupon?.courseId,
          createdAt: result.coupon?.createdAt
        }
      });
    } catch (error) {
      req.log.error('Error updating instructor coupon:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to update coupon'
      });
    }
  }

  async deleteMyCoupon(req: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN')) {
        reply.status(403).send({
          success: false,
          error: 'Access denied. Only instructors can delete their coupons.'
        });
        return;
      }

      const { id } = req.params as { id: string };

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const existingCoupon = await prisma.coupon.findFirst({
        where: {
          id,
          createdById: req.user.id
        }
      });

      if (!existingCoupon) {
        reply.status(404).send({
          success: false,
          error: 'Coupon not found or you do not have permission to delete it.'
        });
        return;
      }

      await prisma.$disconnect();

      const result = await this.manageCouponsUseCase.deleteCoupon(id);

      if (!result.success) {
        reply.status(400).send({
          success: false,
          error: result.error
        });
        return;
      }

      reply.send({
        success: true,
        message: 'Coupon deleted successfully'
      });
    } catch (error) {
      req.log.error('Error deleting instructor coupon:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to delete coupon'
      });
    }
  }

  async getMyCourses(req: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    try {
      if (!req.user || (req.user.role !== 'INSTRUCTOR' && req.user.role !== 'ADMIN')) {
        reply.status(403).send({
          success: false,
          error: 'Access denied. Only instructors can view their courses.'
        });
        return;
      }

      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();

      const courses = await prisma.course.findMany({
        where: {
          instructorId: req.user.id
        },
        select: {
          id: true,
          title: true,
          price: true,
          isPublished: true
        },
        orderBy: {
          title: 'asc'
        }
      });

      await prisma.$disconnect();

      reply.send({
        success: true,
        data: courses
      });
    } catch (error) {
      req.log.error('Error fetching instructor courses:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch courses'
      });
    }
  }
}
