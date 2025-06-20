import { PrismaClient } from '@prisma/client';
import { CouponUsageRepository } from '../../domain/repositories/CouponUsageRepository';
import { CouponUsage } from '../../domain/models/CouponUsage';

export class PrismaCouponUsageRepository implements CouponUsageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(couponUsage: CouponUsage): Promise<CouponUsage> {
    const created = await this.prisma.couponUsage.create({
      data: {
        couponId: couponUsage.couponId,
        userId: couponUsage.userId,
        paymentId: couponUsage.paymentId,
        discountAmount: couponUsage.discountAmount,
        usedAt: couponUsage.usedAt,
      },
    });

    return this.toDomain(created);
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
      orderBy: { usedAt: 'desc' },
    });

    return usages.map(this.toDomain);
  }

  async findByCouponId(couponId: string): Promise<CouponUsage[]> {
    const usages = await this.prisma.couponUsage.findMany({
      where: { couponId },
      orderBy: { usedAt: 'desc' },
    });

    return usages.map(this.toDomain);
  }

  async findByUserAndCoupon(userId: string, couponId: string): Promise<CouponUsage[]> {
    const usages = await this.prisma.couponUsage.findMany({
      where: {
        userId,
        couponId,
      },
      orderBy: { usedAt: 'desc' },
    });

    return usages.map(this.toDomain);
  }

  async countByCouponId(couponId: string): Promise<number> {
    return await this.prisma.couponUsage.count({
      where: { couponId },
    });
  }

  async hasUserUsedCoupon(userId: string, couponId: string): Promise<boolean> {
    const usage = await this.prisma.couponUsage.findFirst({
      where: {
        userId,
        couponId,
      },
    });

    return !!usage;
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
