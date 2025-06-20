export class RefundRequest {
  constructor(
    public readonly id: string,
    public readonly paymentId: string,
    public readonly userId: string,
    public readonly reason: string | null,
    public readonly amount: number,
    public readonly status: 'PENDING' | 'PROCESSED' | 'FAILED' | 'CANCELLED' | 'APPROVED' | 'REJECTED',
    public readonly stripeRefundId: string | null,
    public readonly processedAt: Date | null,
    public readonly processedBy: string | null,
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(data: {
    paymentId: string;
    userId: string;
    reason?: string | null;
    amount: number;
  }): RefundRequest {
    return new RefundRequest(
      '',
      data.paymentId,
      data.userId,
      data.reason || null,
      data.amount,
      'PENDING',
      null,
      null,
      null,
      null,
      new Date(),
      new Date()
    );
  }

  process(data: {
    stripeRefundId?: string;
    processedBy: string;
    notes?: string;
  }): RefundRequest {
    if (this.status !== 'PENDING') {
      throw new Error('Only pending refund requests can be processed');
    }

    return new RefundRequest(
      this.id,
      this.paymentId,
      this.userId,
      this.reason,
      this.amount,
      'PROCESSED',
      data.stripeRefundId || null,
      new Date(),
      data.processedBy,
      data.notes || null,
      this.createdAt,
      new Date()
    );
  }

  fail(data: {
    processedBy: string;
    notes: string;
  }): RefundRequest {
    if (this.status !== 'PENDING') {
      throw new Error('Only pending refund requests can be failed');
    }

    return new RefundRequest(
      this.id,
      this.paymentId,
      this.userId,
      this.reason,
      this.amount,
      'FAILED',
      null,
      new Date(),
      data.processedBy,
      data.notes,
      this.createdAt,
      new Date()
    );
  }

  cancel(data: {
    processedBy: string;
    notes?: string;
  }): RefundRequest {
    if (this.status !== 'PENDING') {
      throw new Error('Only pending refund requests can be cancelled');
    }

    return new RefundRequest(
      this.id,
      this.paymentId,
      this.userId,
      this.reason,
      this.amount,
      'CANCELLED',
      null,
      new Date(),
      data.processedBy,
      data.notes || null,
      this.createdAt,
      new Date()
    );
  }

  isPending(): boolean {
    return this.status === 'PENDING';
  }

  isProcessed(): boolean {
    return this.status === 'PROCESSED';
  }

  isFailed(): boolean {
    return this.status === 'FAILED';
  }

  isCancelled(): boolean {
    return this.status === 'CANCELLED';
  }

  canBeProcessed(): boolean {
    return this.status === 'PENDING';
  }
}
