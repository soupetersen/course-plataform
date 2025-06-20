import { FastifyInstance } from 'fastify';
import { InstructorCouponController } from '@/controllers/InstructorCouponController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';
import { ManageCouponsUseCase } from '@/use-cases/ManageCouponsUseCase';

export async function instructorCouponRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const manageCouponsUseCase = container.resolve<ManageCouponsUseCase>('ManageCouponsUseCase');
  const instructorCouponController = new InstructorCouponController(manageCouponsUseCase);
  const authMiddleware = new AuthMiddleware();

  fastify.get('/instructor/courses', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, instructorCouponController.getMyCourses.bind(instructorCouponController));

  fastify.post('/instructor/coupons', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, instructorCouponController.createCoupon.bind(instructorCouponController));

  fastify.get('/instructor/coupons', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, instructorCouponController.getMyCoupons.bind(instructorCouponController));

  fastify.put('/instructor/coupons/:id', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, instructorCouponController.updateMyCoupon.bind(instructorCouponController));

  fastify.delete('/instructor/coupons/:id', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, instructorCouponController.deleteMyCoupon.bind(instructorCouponController));
}
