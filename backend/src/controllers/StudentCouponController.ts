import { FastifyRequest, FastifyReply } from 'fastify';
import { DIContainer } from '@/shared/utils/DIContainer';
import { UserInfo } from '@/shared/types';
import { prisma } from '@/infrastructure/database/prisma';
import { CouponUsage, Coupon, Course, User, Payment } from '@prisma/client';

export class StudentCouponController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  async getAvailableCoupons(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo as UserInfo;
      
      if (!userInfo) {
        return reply.status(401).send({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const now = new Date();
      const coupons = await prisma.coupon.findMany({
        where: {
          isActive: true,
          validUntil: {
            gt: now
          }
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              price: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true
            }
          },
          usages: {
            where: {
              userId: userInfo.userId
            }
          }
        },
        orderBy: [
          { validUntil: 'asc' },
          { createdAt: 'desc' }
        ]
      });

      const availableCoupons = coupons.filter((coupon: any) => {
        const userUsages = coupon.couponUsages.length;
        
        if (coupon.maxUsagePerUser && userUsages >= coupon.maxUsagePerUser) {
          return false;
        }

        if (coupon.maxUsageCount && coupon.currentUsageCount >= coupon.maxUsageCount) {
          return false;
        }

        return true;
      });

      const formattedCoupons = availableCoupons.map((coupon: any) => ({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumAmount: coupon.minimumAmount,
        maxUsageCount: coupon.maxUsageCount,
        currentUsageCount: coupon.currentUsageCount,
        validUntil: coupon.validUntil.toISOString(),
        isActive: coupon.isActive,
        courseId: coupon.courseId,
        courseTitle: coupon.course?.title,
        createdBy: coupon.creator?.name,
        isGlobal: !coupon.createdById
      }));

      return reply.send({
        success: true,
        data: formattedCoupons
      });

    } catch (error: any) {
      console.error('Error fetching available coupons:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to fetch available coupons'
      });
    }
  }

  async getMyCoupons(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo as UserInfo;
      
      if (!userInfo) {
        return reply.status(401).send({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const couponUsages = await prisma.couponUsage.findMany({
        where: {
          userId: userInfo.userId
        },
        include: {
          coupon: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true
                }
              }
            }
          },
          payment: {
            select: {
              id: true,
              amount: true,
              currency: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: {
          usedAt: 'desc'
        }
      });

      const formattedUsages = couponUsages.map((usage: any) => ({
        id: usage.id,
        coupon: {
          id: usage.coupon.id,
          code: usage.coupon.code,
          description: usage.coupon.description,
          discountType: usage.coupon.discountType,
          discountValue: usage.coupon.discountValue,
          courseTitle: usage.coupon.course?.title
        },
        discountAmount: usage.discountAmount,
        usedAt: usage.usedAt.toISOString(),
        payment: usage.payment ? {
          id: usage.payment.id,
          amount: usage.payment.amount,
          currency: usage.payment.currency,
          status: usage.payment.status,
          createdAt: usage.payment.createdAt.toISOString()
        } : null
      }));

      return reply.send({
        success: true,
        data: formattedUsages
      });

    } catch (error: any) {
      console.error('Error fetching user coupons:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to fetch user coupons'
      });
    }
  }
}
