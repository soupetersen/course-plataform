import { Coupon } from '@/models/Coupon';
import { CouponRepository } from '@/interfaces/CouponRepository';
import { PrismaClient } from '@prisma/client';

export class PrismaCouponRepository implements CouponRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(coupon: Coupon): Promise<Coupon> {
    const created = await this.prisma.coupon.create({
      data: {
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
        createdById: coupon.createdById,
      },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<Coupon | null> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });

    return coupon ? this.toDomain(coupon) : null;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    return coupon ? this.toDomain(coupon) : null;
  }

  async findActiveByCode(code: string): Promise<Coupon | null> {
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        validFrom: { lte: new Date() },
        OR: [
          { validUntil: null },
          { validUntil: { gt: new Date() } }
        ],
      },
    });

    return coupon ? this.toDomain(coupon) : null;
  }

  async findAll(): Promise<Coupon[]> {
    const coupons = await this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return coupons.map(this.toDomain);
  }

  async findByCreatedById(createdById: string): Promise<Coupon[]> {
    const coupons = await this.prisma.coupon.findMany({
      where: { createdById },
      orderBy: { createdAt: 'desc' },
    });

    return coupons.map(this.toDomain);
  }

  async findActive(): Promise<Coupon[]> {
    const coupons = await this.prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: { lte: new Date() },
        OR: [
          { validUntil: null },
          { validUntil: { gt: new Date() } }
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return coupons.map(this.toDomain);
  }

  async update(id: string, data: Partial<Coupon>): Promise<Coupon> {
    const updated = await this.prisma.coupon.update({
      where: { id },
      data: {
        ...(data.code && { code: data.code }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.discountType && { discountType: data.discountType }),
        ...(data.discountValue !== undefined && { discountValue: data.discountValue }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.usedCount !== undefined && { usedCount: data.usedCount }),
        ...(data.validFrom !== undefined && { validFrom: data.validFrom }),
        ...(data.validUntil !== undefined && { validUntil: data.validUntil }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.courseId !== undefined && { courseId: data.courseId }),
        updatedAt: new Date(),
      },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.coupon.delete({
      where: { id },
    });
  }

  async incrementUsedCount(id: string): Promise<void> {
    await this.prisma.coupon.update({
      where: { id },
      data: {
        usedCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }

  private toDomain = (prismaData: any): Coupon => {
    return new Coupon(
      prismaData.id,
      prismaData.code,
      prismaData.description,
      prismaData.discountType,
      prismaData.discountValue,
      prismaData.maxUses,
      prismaData.usedCount,
      prismaData.validFrom,
      prismaData.validUntil,
      prismaData.isActive,
      prismaData.courseId,
      prismaData.createdById,
      prismaData.createdAt,
      prismaData.updatedAt
    );
  }
}