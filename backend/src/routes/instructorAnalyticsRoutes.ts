import { FastifyInstance, FastifyRequest } from 'fastify';
import { InstructorAnalyticsController } from '@/controllers/InstructorAnalyticsController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';

type AnalyticsQuery = {
  period?: '7d' | '30d' | '90d' | '1y';
};

export async function instructorAnalyticsRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const authMiddleware = new AuthMiddleware();
  const analyticsController = new InstructorAnalyticsController(container);

  fastify.get('/payments', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      querystring: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['7d', '30d', '90d', '1y'],
            default: '30d'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                totalRevenue: { type: 'number' },
                totalTransactions: { type: 'number' },
                averageOrderValue: { type: 'number' },
                monthlyRevenue: { type: 'number' },
                conversionRate: { type: 'number' },
                topCourses: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      courseId: { type: 'string' },
                      courseTitle: { type: 'string' },
                      revenue: { type: 'number' },
                      enrollments: { type: 'number' }
                    }
                  }
                },
                recentTransactions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      courseTitle: { type: 'string' },
                      amount: { type: 'number' },
                      currency: { type: 'string' },
                      status: { type: 'string' },
                      paymentType: { type: 'string' },
                      createdAt: { type: 'string' },
                      studentName: { type: 'string' }
                    }
                  }
                },
                monthlyData: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      month: { type: 'string' },
                      revenue: { type: 'number' },
                      transactions: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, (request, reply) => {
    return analyticsController.getPaymentAnalytics(
      request as FastifyRequest<{ Querystring: AnalyticsQuery }>, 
      reply
    );
  });

  fastify.get('/courses/:courseId/revenue', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      params: {
        type: 'object',
        properties: {
          courseId: { type: 'string' }
        },
        required: ['courseId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                courseId: { type: 'string' },
                courseTitle: { type: 'string' },
                totalRevenue: { type: 'number' },
                totalDiscountGiven: { type: 'number' },
                totalTransactions: { type: 'number' },
                averageOrderValue: { type: 'number' },
                payments: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      amount: { type: 'number' },
                      currency: { type: 'string' },
                      createdAt: { type: 'string' },
                      studentName: { type: 'string' },
                      couponsUsed: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            code: { type: 'string' },
                            discountAmount: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, (request, reply) => {
    return analyticsController.getCourseRevenue(
      request as FastifyRequest<{ Params: { courseId: string } }>, 
      reply
    );
  });
}
