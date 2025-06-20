import { FastifyRequest, FastifyReply } from 'fastify';
import { DIContainer } from '@/shared/utils/DIContainer';
import { UserInfo } from '@/shared/types';
import { prisma } from '@/infrastructure/database/prisma';

interface AnalyticsQuery {
  period?: '7d' | '30d' | '90d' | '1y';
}

export class InstructorAnalyticsController {
  private container: DIContainer;

  constructor(container: DIContainer) {
    this.container = container;
  }

  async getPaymentAnalytics(request: FastifyRequest<{ Querystring: AnalyticsQuery }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo as UserInfo;
      const { period = '30d' } = request.query;
      
      if (!userInfo) {
        return reply.status(401).send({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      if (userInfo.role !== 'INSTRUCTOR' && userInfo.role !== 'ADMIN') {
        return reply.status(403).send({
          success: false,
          error: 'Only instructors can access payment analytics'
        });
      }

      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const courses = await prisma.course.findMany({
        where: {
          instructorId: userInfo.userId
        },
        select: {
          id: true,
          title: true,
          price: true,
          enrollments: {
            select: {
              id: true,
              enrolledAt: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          payments: {
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            },
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      const allPayments = courses.flatMap((course: any) => course.payments);
      const completedPayments = allPayments.filter((payment: any) => payment.status === 'COMPLETED');
      
      const totalRevenue = completedPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
      const totalTransactions = completedPayments.length;
      const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

      const monthlyData = [];
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        const monthPayments = completedPayments.filter((payment: any) => {
          const paymentDate = new Date(payment.createdAt);
          return paymentDate >= monthStart && paymentDate <= monthEnd;
        });
        
        const monthRevenue = monthPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
        
        monthlyData.push({
          month: monthStart.toLocaleString('pt-BR', { month: 'short' }),
          revenue: monthRevenue,
          transactions: monthPayments.length
        });
        
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      const topCourses = courses
        .map((course: any) => {
          const coursePayments = course.payments.filter((p: any) => p.status === 'COMPLETED');
          const revenue = coursePayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
          
          return {
            courseId: course.id,
            courseTitle: course.title,
            revenue,
            enrollments: course.enrollments.length
          };
        })
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 5);

      const recentTransactions = completedPayments
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map((payment: any) => {
          const course = courses.find((c: any) => c.id === payment.courseId);
          return {
            id: payment.id,
            courseTitle: course?.title || 'Unknown Course',
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paymentType: payment.paymentType,
            createdAt: payment.createdAt.toISOString(),
            studentName: payment.user.name || payment.user.email
          };
        });

      const conversionRate = 15.5;

      const analytics = {
        totalRevenue,
        totalTransactions,
        averageOrderValue,
        monthlyRevenue: totalRevenue * 0.3,
        conversionRate,
        topCourses,
        recentTransactions,
        monthlyData: monthlyData.slice(-6) 
      };

      return reply.send({
        success: true,
        data: analytics
      });

    } catch (error: any) {
      console.error('Error fetching payment analytics:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to fetch payment analytics'
      });
    }
  }

  async getCourseRevenue(request: FastifyRequest<{ Params: { courseId: string } }>, reply: FastifyReply) {
    try {
      const userInfo = (request as any).userInfo as UserInfo;
      const { courseId } = request.params;
      
      if (!userInfo) {
        return reply.status(401).send({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          instructorId: userInfo.userId
        }
      });

      if (!course) {
        return reply.status(404).send({
          success: false,
          error: 'Course not found or access denied'
        });
      }

      const payments = await prisma.payment.findMany({
        where: {
          courseId,
          status: 'COMPLETED'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          couponUsages: {
            include: {
              coupon: {
                select: {
                  code: true,
                  discountType: true,
                  discountValue: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const totalRevenue = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
      const totalDiscountGiven = payments.reduce((sum: number, payment: any) => {
        return sum + payment.couponUsages.reduce((couponSum: number, usage: any) => couponSum + usage.discountAmount, 0);
      }, 0);

      return reply.send({
        success: true,
        data: {
          courseId,
          courseTitle: course.title,
          totalRevenue,
          totalDiscountGiven,
          totalTransactions: payments.length,
          averageOrderValue: payments.length > 0 ? totalRevenue / payments.length : 0,
          payments: payments.map((payment: any) => ({
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            createdAt: payment.createdAt.toISOString(),
            studentName: payment.user.name || payment.user.email,
            couponsUsed: payment.couponUsages.map((usage: any) => ({
              code: usage.coupon.code,
              discountAmount: usage.discountAmount
            }))
          }))
        }
      });

    } catch (error: any) {
      console.error('Error fetching course revenue:', error);
      return reply.status(500).send({
        success: false,
        error: error.message || 'Failed to fetch course revenue'
      });
    }
  }
}
