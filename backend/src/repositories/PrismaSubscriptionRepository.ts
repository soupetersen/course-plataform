import { PrismaClient } from '@prisma/client';
import { Subscription, SubscriptionStatus } from '@/models/Subscription';
import { SubscriptionRepository } from '@/interfaces/SubscriptionRepository';

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private prisma: PrismaClient) {}

  async create(subscription: Subscription): Promise<Subscription> {
    const result = await this.prisma.subscription.create({
      data: {
        id: subscription.id,
        paymentId: subscription.paymentId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        stripeCustomerId: subscription.stripeCustomerId,
        status: subscription.status as any,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        cancelledAt: subscription.cancelledAt,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
    });

    return this.toDomain(result);
  }

  async findById(id: string): Promise<Subscription | null> {
    const result = await this.prisma.subscription.findUnique({
      where: { id },
    });

    return result ? this.toDomain(result) : null;
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null> {
    const result = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });

    return result ? this.toDomain(result) : null;
  }

  async findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription[]> {
    const results = await this.prisma.subscription.findMany({
      where: { stripeCustomerId },
      orderBy: { createdAt: 'desc' },
    });

    return results.map(this.toDomain);
  }

  async findByPaymentId(paymentId: string): Promise<Subscription | null> {
    const result = await this.prisma.subscription.findUnique({
      where: { paymentId },
    });

    return result ? this.toDomain(result) : null;
  }

  async update(subscription: Subscription): Promise<Subscription> {
    const result = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: subscription.status as any,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        cancelledAt: subscription.cancelledAt,
        updatedAt: subscription.updatedAt,
      },
    });

    return this.toDomain(result);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.subscription.delete({
      where: { id },
    });
  }

  private toDomain(subscription: any): Subscription {
    return new Subscription(
      subscription.id,
      subscription.paymentId,
      subscription.stripeSubscriptionId,
      subscription.stripeCustomerId,
      subscription.status as SubscriptionStatus,
      subscription.currentPeriodStart,
      subscription.currentPeriodEnd,
      subscription.cancelAtPeriodEnd,
      subscription.cancelledAt,
      subscription.createdAt,
      subscription.updatedAt
    );
  }
}
