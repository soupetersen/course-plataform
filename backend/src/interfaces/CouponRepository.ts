import { Coupon } from '../models/Coupon';

export interface CouponRepository {
  create(coupon: Coupon): Promise<Coupon>;
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  findActiveByCode(code: string): Promise<Coupon | null>;
  findByCreatedById(createdById: string): Promise<Coupon[]>;
  findAll(): Promise<Coupon[]>;
  findActive(): Promise<Coupon[]>;
  update(id: string, data: Partial<Coupon>): Promise<Coupon>;
  delete(id: string): Promise<void>;
  incrementUsedCount(id: string): Promise<void>;
}
