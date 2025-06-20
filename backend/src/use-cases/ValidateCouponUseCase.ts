import { CouponRepository } from '../domain/repositories/CouponRepository';
import { CouponUsageRepository } from '../domain/repositories/CouponUsageRepository';
import { Coupon } from '../domain/models/Coupon';
import { CouponUsage } from '../domain/models/CouponUsage';

export interface ValidateCouponRequest {
  code: string;
  userId: string;
  originalAmount: number;
}

export interface ValidateCouponResponse {
  isValid: boolean;
  coupon?: Coupon;
  discountAmount: number;
  finalAmount: number;
  error?: string;
}

export class ValidateCouponUseCase {
  constructor(
    private readonly couponRepository: CouponRepository,
    private readonly couponUsageRepository: CouponUsageRepository
  ) {}

  async execute(request: ValidateCouponRequest): Promise<ValidateCouponResponse> {
    const { code, userId, originalAmount } = request;

    const coupon = await this.couponRepository.findActiveByCode(code);
    
    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: originalAmount,
        error: 'Cupom não encontrado ou inativo'
      };
    }

    if (!coupon.isValid()) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: originalAmount,
        error: 'Cupom expirado ou sem usos disponíveis'
      };
    }

    const hasUsed = await this.couponUsageRepository.hasUserUsedCoupon(userId, coupon.id);
    if (hasUsed) {
      return {
        isValid: false,
        discountAmount: 0,
        finalAmount: originalAmount,
        error: 'Você já utilizou este cupom'
      };
    }

    const discountAmount = coupon.calculateDiscount(originalAmount);
    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return {
      isValid: true,
      coupon,
      discountAmount,
      finalAmount
    };
  }
}
