import Stripe from 'stripe';

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionRequest {
  customerId: string;
  priceId: string;
  metadata?: Record<string, string>;
}

export interface CreateCustomerRequest {
  email: string;
  name: string;
}

export class StripeService {
  private stripe: Stripe;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-05-28.basil',
    });
  }

  async createCustomer(request: CreateCustomerRequest): Promise<Stripe.Customer> {
    return await this.stripe.customers.create({
      email: request.email,
      name: request.name,
    });
  }

  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100), 
      currency: request.currency,
      customer: request.customerId,
      metadata: request.metadata || {},
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.create({
      customer: request.customerId,
      items: [
        {
          price: request.priceId,
        },
      ],
      metadata: request.metadata || {},
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    return await this.stripe.subscriptions.retrieve(subscriptionId);
  }

  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = false): Promise<Stripe.Subscription> {
    if (cancelAtPeriodEnd) {
      return await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } else {
      return await this.stripe.subscriptions.cancel(subscriptionId);
    }
  }

  async createProduct(name: string, description?: string): Promise<Stripe.Product> {
    return await this.stripe.products.create({
      name,
      description,
    });
  }

  async createPrice(
    productId: string,
    unitAmount: number,
    currency: string,
    recurring?: { interval: 'month' | 'year' }
  ): Promise<Stripe.Price> {
    return await this.stripe.prices.create({
      product: productId,
      unit_amount: Math.round(unitAmount * 100), 
      currency,
      recurring,
    });
  }

  async constructWebhookEvent(payload: string | Buffer, signature: string): Promise<Stripe.Event> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is required');
    }

    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<Stripe.Refund> {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }
}
