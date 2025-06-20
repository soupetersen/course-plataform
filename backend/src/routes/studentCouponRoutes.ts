import { FastifyInstance } from 'fastify';
import { StudentCouponController } from '@/controllers/StudentCouponController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';

export async function studentCouponRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const authMiddleware = new AuthMiddleware();
  const studentCouponController = new StudentCouponController(container);

  fastify.get('/available', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  code: { type: 'string' },
                  description: { type: 'string' },
                  discountType: { type: 'string', enum: ['PERCENTAGE', 'FLAT_RATE'] },
                  discountValue: { type: 'number' },
                  minimumAmount: { type: 'number', nullable: true },
                  maxUsageCount: { type: 'number', nullable: true },
                  currentUsageCount: { type: 'number' },
                  validUntil: { type: 'string' },
                  isActive: { type: 'boolean' },
                  courseId: { type: 'string', nullable: true },
                  courseTitle: { type: 'string', nullable: true },
                  createdBy: { type: 'string', nullable: true },
                  isGlobal: { type: 'boolean' }
                }
              }
            }
          }
        }
      }
    }
  }, studentCouponController.getAvailableCoupons.bind(studentCouponController));

  fastify.get('/my-coupons', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  coupon: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      code: { type: 'string' },
                      description: { type: 'string' },
                      discountType: { type: 'string' },
                      discountValue: { type: 'number' },
                      courseTitle: { type: 'string', nullable: true }
                    }
                  },
                  discountAmount: { type: 'number' },
                  usedAt: { type: 'string' },
                  payment: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: { type: 'string' },
                      amount: { type: 'number' },
                      currency: { type: 'string' },
                      status: { type: 'string' },
                      createdAt: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, studentCouponController.getMyCoupons.bind(studentCouponController));
}
