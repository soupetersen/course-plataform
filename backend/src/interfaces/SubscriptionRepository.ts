import { Subscription } from '@/models/Subscription';

export interface SubscriptionRepository {
  create(subscription: Subscription): Promise<Subscription>;
  findById(id: string): Promise<Subscription | null>;
  findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null>;
  findByStripeCustomerId(stripeCustomerId: string): Promise<Subscription[]>;
  findByPaymentId(paymentId: string): Promise<Subscription | null>;
  update(subscription: Subscription): Promise<Subscription>;
  delete(id: string): Promise<void>;
}
