import { FastifyInstance } from 'fastify';
import { AdminCouponController } from '@/controllers/AdminCouponController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';
import { ManageCouponsUseCase } from '@/use-cases/ManageCouponsUseCase';

export async function adminCouponRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const authMiddleware = new AuthMiddleware();

  const manageCouponsUseCase = container.resolve<ManageCouponsUseCase>('ManageCouponsUseCase');
  const adminCouponController = new AdminCouponController(manageCouponsUseCase);

  fastify.post('/', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      body: {
        type: 'object',
        required: ['code', 'discountType', 'discountValue'],
        properties: {
          code: { type: 'string' },
          discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] },
          discountValue: { type: 'number' },
          maxUses: { type: 'number' },
          expiresAt: { type: 'string' },
          isActive: { type: 'boolean' }
        }
      }
    }
  }, adminCouponController.createCoupon.bind(adminCouponController));

  fastify.get('/', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, adminCouponController.getAllCoupons.bind(adminCouponController));

  fastify.get('/active', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, adminCouponController.getActiveCoupons.bind(adminCouponController));

  fastify.get('/:id', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, adminCouponController.getCoupon.bind(adminCouponController));

  fastify.put('/:id', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          discountType: { type: 'string', enum: ['PERCENTAGE', 'FIXED_AMOUNT'] },
          discountValue: { type: 'number' },
          maxUses: { type: 'number' },
          expiresAt: { type: 'string' },
          isActive: { type: 'boolean' }
        }
      }
    }
  }, adminCouponController.updateCoupon.bind(adminCouponController));

  fastify.delete('/:id', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        }
      }
    }
  }, adminCouponController.deleteCoupon.bind(adminCouponController));
}
