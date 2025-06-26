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
    public readonly externalPaymentId: string, 
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: PaymentStatus,
    public readonly paymentType: PaymentType,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly externalOrderId?: string,
    public readonly paymentData?: string, 
    public readonly paymentMethod?: string,
    public readonly platformFeeAmount?: number,
    public readonly instructorAmount?: number,
    public readonly gatewayProvider?: string
  ) {}

  static create(
    id: string,
    userId: string,
    courseId: string,
    externalPaymentId: string,
    amount: number,
    currency: string,
    status: PaymentStatus,
    paymentType: PaymentType,
    options?: {
      externalOrderId?: string;
      paymentData?: string;
      paymentMethod?: string;
      platformFeeAmount?: number;
      instructorAmount?: number;
      gatewayProvider?: string;
    }
  ): Payment {
    const now = new Date();
    return new Payment(
      id,
      userId,
      courseId,
      externalPaymentId,
      amount,
      currency,
      status,
      paymentType,
      now,
      now,
      options?.externalOrderId,
      options?.paymentData,
      options?.paymentMethod,
      options?.platformFeeAmount,
      options?.instructorAmount,
      options?.gatewayProvider
    );
  }

  updateStatus(status: PaymentStatus): Payment {
    return new Payment(
      this.id,
      this.userId,
      this.courseId,
      this.externalPaymentId,
      this.amount,
      this.currency,
      status,
      this.paymentType,
      this.createdAt,
      new Date(),
      this.externalOrderId,
      this.paymentData,
      this.paymentMethod,
      this.platformFeeAmount,
      this.instructorAmount,
      this.gatewayProvider
    );
  }

  isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  isSubscription(): boolean {
    return this.paymentType === PaymentType.SUBSCRIPTION;
  }
}
