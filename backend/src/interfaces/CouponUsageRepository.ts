import { CouponUsage } from '../models/CouponUsage';

export interface CouponUsageRepository {
  create(couponUsage: CouponUsage): Promise<CouponUsage>;
  findById(id: string): Promise<CouponUsage | null>;
  findByCouponId(couponId: string): Promise<CouponUsage[]>;
  findByUserId(userId: string): Promise<CouponUsage[]>;
  findByPaymentId(paymentId: string): Promise<CouponUsage | null>;
  hasUserUsedCoupon(userId: string, couponId: string): Promise<boolean>;
  countByCouponId(couponId: string): Promise<number>;
}
