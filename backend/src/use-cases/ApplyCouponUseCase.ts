import { CouponRepository } from '../interfaces/CouponRepository';
import { CouponUsageRepository } from '../interfaces/CouponUsageRepository';
import { Coupon } from '../models/Coupon';
import { CouponUsage } from '../models/CouponUsage';

export interface ApplyCouponRequest {
  couponId: string;
  userId: string;
}

export interface ApplyCouponResponse {
  success: boolean;
  coupon?: Coupon;
  error?: string;
}

export class ApplyCouponUseCase {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly couponUsageRepository: CouponUsageRepository
  ) {}

  async execute(request: ApplyCouponRequest): Promise<ApplyCouponResponse> {
    const { couponId, userId } = request;

    try {
      const coupon = await this.couponRepository.findById(couponId);
      
      if (!coupon) {
        return {
          success: false,
          error: 'Cupom não encontrado'
        };
      }

      if (!coupon.isValid()) {
        return {
          success: false,
          error: 'Cupom inválido ou expirado'
        };
      }

      const hasUsed = await this.couponUsageRepository.hasUserUsedCoupon(userId, couponId);
      if (hasUsed) {
        return {
          success: false,
          error: 'Cupom já foi utilizado por este usuário'
        };
      }

      return {
        success: true,
        coupon: coupon
      };

    } catch (error) {
      return {
        success: false,
        error: 'Erro interno ao aplicar cupom'
      };
    }
  }
}
