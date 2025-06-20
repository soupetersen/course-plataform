export class Coupon {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly description: string | null,
    public readonly discountType: 'PERCENTAGE' | 'FLAT_RATE',
    public readonly discountValue: number,
    public readonly maxUses: number | null,
    public readonly usedCount: number,
    public readonly validFrom: Date,
    public readonly validUntil: Date | null,
    public readonly isActive: boolean,
    public readonly courseId: string | null,
    public readonly createdById: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data: {
    code: string;
    description?: string | null;
    discountType: 'PERCENTAGE' | 'FLAT_RATE';
    discountValue: number;
    maxUses?: number | null;
    validFrom?: Date;
    validUntil?: Date | null;
    isActive?: boolean;
    courseId?: string | null;
    createdById: string;
  }): Coupon {
    return new Coupon(
      '',
      data.code.toUpperCase(),
      data.description || null,
      data.discountType,
      data.discountValue,
      data.maxUses || null,
      0,
      data.validFrom || new Date(),
      data.validUntil || null,
      data.isActive ?? true,
      data.courseId || null,
      data.createdById,
      new Date(),
      new Date()
    );
  }

  isValid(): boolean {
    if (!this.isActive) return false;
    
    const now = new Date();
    if (this.validFrom > now) return false;
    if (this.validUntil && this.validUntil < now) return false;
    
    if (this.maxUses !== null && this.usedCount >= this.maxUses) return false;
    
    return true;
  }

  canBeUsed(): boolean {
    return this.isValid();
  }

  calculateDiscount(originalAmount: number): number {
    if (!this.isValid()) return 0;

    if (this.discountType === 'PERCENTAGE') {
      return Math.round((originalAmount * this.discountValue) / 100);
    } else {
      return Math.min(this.discountValue, originalAmount);
    }
  }

  incrementUsage(): void {
    (this as any).usedCount += 1;
    (this as any).updatedAt = new Date();
  }
}
