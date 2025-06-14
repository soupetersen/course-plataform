import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { SubscriptionRepository } from '@/interfaces/SubscriptionRepository';
import { EnrollmentRepository } from '@/interfaces/EnrollmentRepository';
import { StripeService } from '@/services/StripeService';
import { PaymentStatus } from '@/models/Payment';
import { SubscriptionStatus } from '@/models/Subscription';
import { Enrollment } from '@/models/Enrollment';
import { randomUUID } from 'crypto';

export class ProcessStripeWebhookUseCase {
  constructor(
    private paymentRepository: PaymentRepository,
    private subscriptionRepository: SubscriptionRepository,
    private enrollmentRepository: EnrollmentRepository,
    private stripeService: StripeService
  ) {}

  async execute(payload: string | Buffer, signature: string): Promise<void> {
    try {
      const event = await this.stripeService.constructWebhookEvent(payload, signature);

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as any);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as any);
          break;
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object as any);
          break;
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as any);
          break;
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object as any);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as any);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
    const payment = await this.paymentRepository.findByStripePaymentId(paymentIntent.id);
    if (!payment) {
      console.error(`Payment not found for Stripe payment intent: ${paymentIntent.id}`);
      return;
    }

    
    const updatedPayment = payment.updateStatus(PaymentStatus.COMPLETED);
    await this.paymentRepository.update(updatedPayment);

    
    await this.createEnrollment(payment.userId, payment.courseId);
  }

  private async handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
    const payment = await this.paymentRepository.findByStripePaymentId(paymentIntent.id);
    if (!payment) {
      console.error(`Payment not found for Stripe payment intent: ${paymentIntent.id}`);
      return;
    }

    
    const updatedPayment = payment.updateStatus(PaymentStatus.FAILED);
    await this.paymentRepository.update(updatedPayment);
  }

  private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    if (invoice.subscription) {
      const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(invoice.subscription);
      if (subscription) {
        
        const updatedSubscription = subscription.updateStatus(SubscriptionStatus.ACTIVE);
        await this.subscriptionRepository.update(updatedSubscription);

        
        const payment = await this.paymentRepository.findById(subscription.paymentId);
        if (payment) {
          const updatedPayment = payment.updateStatus(PaymentStatus.COMPLETED);
          await this.paymentRepository.update(updatedPayment);

          
          await this.createEnrollment(payment.userId, payment.courseId);
        }
      }
    }
  }

  private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    if (invoice.subscription) {
      const subscription = await this.subscriptionRepository.findByStripeSubscriptionId(invoice.subscription);
      if (subscription) {
        
        let newStatus = SubscriptionStatus.PAST_DUE;
        if (invoice.attempt_count >= 4) {
          newStatus = SubscriptionStatus.UNPAID;
        }

        const updatedSubscription = subscription.updateStatus(newStatus);
        await this.subscriptionRepository.update(updatedSubscription);
      }
    }
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    const existingSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(subscription.id);
    if (!existingSubscription) {
      console.error(`Subscription not found for Stripe subscription: ${subscription.id}`);
      return;
    }

    
    let status: SubscriptionStatus;
    switch (subscription.status) {
      case 'active':
        status = SubscriptionStatus.ACTIVE;
        break;
      case 'past_due':
        status = SubscriptionStatus.PAST_DUE;
        break;
      case 'unpaid':
        status = SubscriptionStatus.UNPAID;
        break;
      case 'canceled':
        status = SubscriptionStatus.CANCELLED;
        break;
      default:
        status = SubscriptionStatus.INCOMPLETE;
    }

    const updatedSubscription = existingSubscription
      .updateStatus(status)
      .updatePeriod(
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000)
      );

    await this.subscriptionRepository.update(updatedSubscription);
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    const existingSubscription = await this.subscriptionRepository.findByStripeSubscriptionId(subscription.id);
    if (!existingSubscription) {
      console.error(`Subscription not found for Stripe subscription: ${subscription.id}`);
      return;
    }

    const cancelledSubscription = existingSubscription.cancel();
    await this.subscriptionRepository.update(cancelledSubscription);
  }

  private async createEnrollment(userId: string, courseId: string): Promise<void> {
    
    const existingEnrollment = await this.enrollmentRepository.findByUserAndCourse(userId, courseId);
    if (existingEnrollment) {
      return; 
    }

    
    const enrollment = Enrollment.create({ userId, courseId });
    await this.enrollmentRepository.create(enrollment);
  }
}
