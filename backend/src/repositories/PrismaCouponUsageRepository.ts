import { PrismaClient } from '@prisma/client';
import { CouponUsageRepository } from '../interfaces/CouponUsageRepository';
import { CouponUsage } from '../models/CouponUsage';

export class PrismaCouponUsageRepository implements CouponUsageRepository {
  constructor(private prisma: PrismaClient) {}

  async create(couponUsage: CouponUsage): Promise<CouponUsage> {
    const created = await this.prisma.couponUsage.create({
      data: {
        couponId: couponUsage.couponId,
        userId: couponUsage.userId,
        paymentId: couponUsage.paymentId,
        discountAmount: couponUsage.discountAmount,
      },
    });

    return this.toDomain(created);
  }

  async findByUserAndCoupon(userId: string, couponId: string): Promise<CouponUsage[]> {
    const usages = await this.prisma.couponUsage.findMany({
      where: {
        userId,
        couponId,
      },
    });

    return usages.map(usage => this.toDomain(usage));
  }

  async findById(id: string): Promise<CouponUsage | null> {
    const usage = await this.prisma.couponUsage.findUnique({
      where: { id },
    });

    return usage ? this.toDomain(usage) : null;
  }

  async findByUserId(userId: string): Promise<CouponUsage[]> {
    const usages = await this.prisma.couponUsage.findMany({
      where: { userId },
    });

    return usages.map(usage => this.toDomain(usage));
  }

  async findByCouponId(couponId: string): Promise<CouponUsage[]> {
    const usages = await this.prisma.couponUsage.findMany({
      where: { couponId },
    });

    return usages.map(usage => this.toDomain(usage));
  }

  async countByCouponId(couponId: string): Promise<number> {
    return this.prisma.couponUsage.count({
      where: { couponId },
    });
  }

  async hasUserUsedCoupon(userId: string, couponId: string): Promise<boolean> {
    const count = await this.prisma.couponUsage.count({
      where: {
        userId,
        couponId,
      },
    });

    return count > 0;
  }

  async countByCoupon(couponId: string): Promise<number> {
    return this.prisma.couponUsage.count({
      where: { couponId },
    });
  }

  async findByPaymentId(paymentId: string): Promise<CouponUsage | null> {
    const usage = await this.prisma.couponUsage.findFirst({
      where: { paymentId },
    });

    return usage ? this.toDomain(usage) : null;
  }

  async findByPayment(paymentId: string): Promise<CouponUsage[]> {
    const usages = await this.prisma.couponUsage.findMany({
      where: { paymentId },
    });

    return usages.map(usage => this.toDomain(usage));
  }

  private toDomain(prismaData: any): CouponUsage {
    return new CouponUsage(
      prismaData.id,
      prismaData.couponId,
      prismaData.userId,
      prismaData.paymentId,
      prismaData.discountAmount,
      prismaData.usedAt
    );
  }
}