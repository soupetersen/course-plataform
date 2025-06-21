import { FastifyRequest, FastifyReply } from 'fastify';
import { ManageCouponsUseCase } from '@/use-cases/ManageCouponsUseCase';

export class AdminCouponController {
  constructor(private manageCouponsUseCase: ManageCouponsUseCase) {}

  async createCoupon(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { 
        code, 
        description,
        discountType, 
        discountValue, 
        maxUses, 
        validUntil, 
        isActive,
        courseId,
        createdById
      } = req.body as {
        code: string;
        description?: string;
        discountType: 'PERCENTAGE' | 'FLAT_RATE';
        discountValue: number;
        maxUses?: number;
        validUntil?: string;
        isActive?: boolean;
        courseId?: string;
        createdById: string;
      };

      const result = await this.manageCouponsUseCase.createCoupon({
        code,
        description,
        discountType,
        discountValue,
        maxUses,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        isActive,
        courseId,
        createdById
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
      req.log.error('Error creating coupon:', error);
      reply.status(500).send({
        success: false,
        error: 'Falha ao criar cupom'
      });
    }
  }

  async updateCoupon(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
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

      reply.status(200).send({
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
          updatedAt: result.coupon?.updatedAt
        }
      });
    } catch (error) {
      req.log.error('Error updating coupon:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to update coupon'
      });
    }
  }

  async deleteCoupon(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      const result = await this.manageCouponsUseCase.deleteCoupon(id);

      if (!result.success) {
        reply.status(400).send({
          success: false,
          error: result.error
        });
        return;
      }

      reply.status(200).send({
        success: true,
        message: 'Coupon deleted successfully'
      });
    } catch (error) {
      req.log.error('Error deleting coupon:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to delete coupon'
      });
    }
  }

  async getCoupon(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { id } = req.params as { id: string };

      const result = await this.manageCouponsUseCase.getCoupon(id);

      if (!result.success) {
        reply.status(404).send({
          success: false,
          error: result.error
        });
        return;
      }

      reply.status(200).send({
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
          createdAt: result.coupon?.createdAt,
          updatedAt: result.coupon?.updatedAt
        }
      });
    } catch (error) {
      req.log.error('Error fetching coupon:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch coupon'
      });
    }
  }

  async getAllCoupons(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const result = await this.manageCouponsUseCase.getAllCoupons();

      if (!result.success) {
        reply.status(500).send({
          success: false,
          error: result.error
        });
        return;
      }

      reply.status(200).send({
        success: true,
        data: result.coupons.map(coupon => ({
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
          createdAt: coupon.createdAt,
          updatedAt: coupon.updatedAt
        }))
      });
    } catch (error) {
      req.log.error('Error fetching coupons:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch coupons'
      });
    }
  }

  async getActiveCoupons(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const result = await this.manageCouponsUseCase.getActiveCoupons();

      if (!result.success) {
        reply.status(500).send({
          success: false,
          error: result.error
        });
        return;
      }

      reply.status(200).send({
        success: true,
        data: result.coupons.map(coupon => ({
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
          createdAt: coupon.createdAt
        }))
      });
    } catch (error) {
      req.log.error('Error fetching active coupons:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch active coupons'
      });
    }
  }
}
