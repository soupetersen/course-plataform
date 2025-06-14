export interface CreatePaymentDto {
  courseId: string;
  paymentType: 'ONE_TIME' | 'SUBSCRIPTION';
  amount: number;
}

export interface PaymentResponseDto {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: string;
  paymentType: 'ONE_TIME' | 'SUBSCRIPTION';
  stripePaymentIntentId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
}

export interface CreateSubscriptionDto {
  courseId: string;
  priceId: string;
}

export interface SubscriptionResponseDto {
  id: string;
  userId: string;
  courseId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  stripeSubscriptionId: string;
  createdAt: Date;
}

export interface StripeWebhookDto {
  type: string;
  data: {
    object: any;
  };
}
