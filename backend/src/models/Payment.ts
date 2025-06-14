export enum PaymentType {
  ONE_TIME = 'ONE_TIME',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export class Payment {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly stripePaymentId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: PaymentStatus,
    public readonly paymentType: PaymentType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string,
    userId: string,
    courseId: string,
    stripePaymentId: string,
    amount: number,
    currency: string,
    status: PaymentStatus,
    paymentType: PaymentType
  ): Payment {
    const now = new Date();
    return new Payment(
      id,
      userId,
      courseId,
      stripePaymentId,
      amount,
      currency,
      status,
      paymentType,
      now,
      now
    );
  }

  updateStatus(status: PaymentStatus): Payment {
    return new Payment(
      this.id,
      this.userId,
      this.courseId,
      this.stripePaymentId,
      this.amount,
      this.currency,
      status,
      this.paymentType,
      this.createdAt,
      new Date()
    );
  }

  isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  isSubscription(): boolean {
    return this.paymentType === PaymentType.SUBSCRIPTION;
  }
}
