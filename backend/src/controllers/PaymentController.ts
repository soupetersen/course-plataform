import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateOneTimePaymentUseCase } from '@/use-cases/CreateOneTimePaymentUseCase';
import { CreateSubscriptionPaymentUseCase } from '@/use-cases/CreateSubscriptionPaymentUseCase';
import { ProcessStripeWebhookUseCase } from '@/use-cases/ProcessStripeWebhookUseCase';
import { PaymentRepository } from '@/interfaces/PaymentRepository';

export class PaymentController {
  constructor(
    private createOneTimePaymentUseCase: CreateOneTimePaymentUseCase,
    private createSubscriptionPaymentUseCase: CreateSubscriptionPaymentUseCase,
    private processStripeWebhookUseCase: ProcessStripeWebhookUseCase,
    private paymentRepository: PaymentRepository
  ) {}

  async createOneTimePayment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { courseId, currency } = req.body as any;
      const userId = (req as any).user.id; 

      const result = await this.createOneTimePaymentUseCase.execute({
        userId,
        courseId,
        currency,
      });

      reply.status(201).send({
        success: true,
        data: {
          paymentId: result.payment.id,
          clientSecret: result.clientSecret,
          amount: result.payment.amount,
          currency: result.payment.currency,
        },
      });
    } catch (error) {
      req.log.error('Error creating one-time payment:', error);
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment',
      });
    }
  }

  async createSubscriptionPayment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { courseId } = req.body as any;
      const userId = (req as any).user.id; 

      const result = await this.createSubscriptionPaymentUseCase.execute({
        userId,
        courseId,
      });

      reply.status(201).send({
        success: true,
        data: {
          paymentId: result.payment.id,
          subscriptionId: result.subscription.id,
          clientSecret: result.clientSecret,
          amount: result.payment.amount,
          currency: result.payment.currency,
        },
      });
    } catch (error) {
      req.log.error('Error creating subscription payment:', error);
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subscription',
      });
    }
  }

  async handleWebhook(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body as string | Buffer;

      await this.processStripeWebhookUseCase.execute(payload, signature);

      reply.status(200).send({ received: true });
    } catch (error) {
      req.log.error('Error processing webhook:', error);
      reply.status(400).send({
        success: false,
        error: 'Webhook processing failed',
      });
    }
  }

  async getPaymentHistory(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userId = (req as any).user.id; 
      const payments = await this.paymentRepository.findByUserId(userId);

      reply.status(200).send({
        success: true,
        data: payments.map(payment => ({
          id: payment.id,
          courseId: payment.courseId,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentType: payment.paymentType,
          createdAt: payment.createdAt,
        })),
      });
    } catch (error) {
      req.log.error('Error fetching payment history:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch payment history',
      });
    }
  }

  async getPaymentStatus(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { paymentId } = req.params as any;
      const userId = (req as any).user.id; 

      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        reply.status(404).send({
          success: false,
          error: 'Payment not found',
        });
        return;
      }

      
      if (payment.userId !== userId) {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
        });
        return;
      }

      reply.status(200).send({
        success: true,
        data: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          paymentType: payment.paymentType,
          createdAt: payment.createdAt,
        },
      });
    } catch (error) {
      req.log.error('Error fetching payment status:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to fetch payment status',
      });
    }
  }
}
