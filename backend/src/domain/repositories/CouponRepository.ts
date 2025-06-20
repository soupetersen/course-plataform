import { Coupon } from '../models/Coupon';

export interface CouponRepository {
  create(coupon: Coupon): Promise<Coupon>;
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  findActiveByCode(code: string): Promise<Coupon | null>;
  findAll(): Promise<Coupon[]>;
  findActive(): Promise<Coupon[]>;
  update(id: string, coupon: Partial<Coupon>): Promise<Coupon>;
  delete(id: string): Promise<void>;
  incrementUsage(id: string): Promise<void>;
}
