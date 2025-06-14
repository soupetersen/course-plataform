export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  PAST_DUE = 'PAST_DUE',
  UNPAID = 'UNPAID',
  INCOMPLETE = 'INCOMPLETE'
}

export class Subscription {
  constructor(
    public readonly id: string,
    public readonly paymentId: string,
    public readonly stripeSubscriptionId: string,
    public readonly stripeCustomerId: string,
    public readonly status: SubscriptionStatus,
    public readonly currentPeriodStart: Date,
    public readonly currentPeriodEnd: Date,
    public readonly cancelAtPeriodEnd: boolean,
    public readonly cancelledAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(
    id: string,
    paymentId: string,
    stripeSubscriptionId: string,
    stripeCustomerId: string,
    status: SubscriptionStatus,
    currentPeriodStart: Date,
    currentPeriodEnd: Date
  ): Subscription {
    const now = new Date();
    return new Subscription(
      id,
      paymentId,
      stripeSubscriptionId,
      stripeCustomerId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      false,
      null,
      now,
      now
    );
  }

  updateStatus(status: SubscriptionStatus): Subscription {
    return new Subscription(
      this.id,
      this.paymentId,
      this.stripeSubscriptionId,
      this.stripeCustomerId,
      status,
      this.currentPeriodStart,
      this.currentPeriodEnd,
      this.cancelAtPeriodEnd,
      this.cancelledAt,
      this.createdAt,
      new Date()
    );
  }

  cancel(): Subscription {
    return new Subscription(
      this.id,
      this.paymentId,
      this.stripeSubscriptionId,
      this.stripeCustomerId,
      SubscriptionStatus.CANCELLED,
      this.currentPeriodStart,
      this.currentPeriodEnd,
      this.cancelAtPeriodEnd,
      new Date(),
      this.createdAt,
      new Date()
    );
  }

  scheduleCancel(): Subscription {
    return new Subscription(
      this.id,
      this.paymentId,
      this.stripeSubscriptionId,
      this.stripeCustomerId,
      this.status,
      this.currentPeriodStart,
      this.currentPeriodEnd,
      true,
      this.cancelledAt,
      this.createdAt,
      new Date()
    );
  }

  isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE;
  }

  isCancelled(): boolean {
    return this.status === SubscriptionStatus.CANCELLED;
  }

  updatePeriod(start: Date, end: Date): Subscription {
    return new Subscription(
      this.id,
      this.paymentId,
      this.stripeSubscriptionId,
      this.stripeCustomerId,
      this.status,
      start,
      end,
      this.cancelAtPeriodEnd,
      this.cancelledAt,
      this.createdAt,
      new Date()
    );
  }
}
