import { CouponUsage } from '../models/CouponUsage';

export interface CouponUsageRepository {
  create(couponUsage: CouponUsage): Promise<CouponUsage>;
  findById(id: string): Promise<CouponUsage | null>;
  findByUserId(userId: string): Promise<CouponUsage[]>;
  findByCouponId(couponId: string): Promise<CouponUsage[]>;
  findByUserAndCoupon(userId: string, couponId: string): Promise<CouponUsage[]>;
  countByCouponId(couponId: string): Promise<number>;
  hasUserUsedCoupon(userId: string, couponId: string): Promise<boolean>;
}
