export class CouponUsage {
  constructor(
    public readonly id: string,
    public readonly couponId: string,
    public readonly userId: string,
    public readonly paymentId: string,
    public readonly discountAmount: number,
    public readonly usedAt: Date
  ) {}

  static create(data: {
    couponId: string;
    userId: string;
    paymentId: string;
    discountAmount: number;
  }): CouponUsage {
    return new CouponUsage(
      '',
      data.couponId,
      data.userId,
      data.paymentId,
      data.discountAmount,
      new Date()
    );
  }
}
