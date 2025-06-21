import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateOneTimePaymentUseCase } from '@/use-cases/CreateOneTimePaymentUseCase';
import { CreateSubscriptionPaymentUseCase } from '@/use-cases/CreateSubscriptionPaymentUseCase';
import { ProcessStripeWebhookUseCase } from '@/use-cases/ProcessStripeWebhookUseCase';
import { ValidateCouponUseCase } from '@/use-cases/ValidateCouponUseCase';
import { CalculateFeesUseCase } from '@/use-cases/CalculateFeesUseCase';
import { CreateRefundRequestUseCase } from '@/use-cases/CreateRefundRequestUseCase';
import { PaymentRepository } from '@/interfaces/PaymentRepository';

export class PaymentController {
  constructor(
    private createOneTimePaymentUseCase: CreateOneTimePaymentUseCase,
    private createSubscriptionPaymentUseCase: CreateSubscriptionPaymentUseCase,
    private processStripeWebhookUseCase: ProcessStripeWebhookUseCase,
    private validateCouponUseCase: ValidateCouponUseCase,
    private calculateFeesUseCase: CalculateFeesUseCase,
    private createRefundRequestUseCase: CreateRefundRequestUseCase,
    private paymentRepository: PaymentRepository
  ) {}  async createOneTimePayment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { courseId, currency } = req.body as any;
      const userInfo = (req as any).userInfo;
      if (!userInfo) {
        reply.status(401).send({ success: false, error: 'Voc� precisa estar logado para realizar um pagamento.' });
        return;
      }
      const userId = userInfo.userId;

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
      });    } catch (error) {
      req.log.error('Error creating one-time payment:', error);
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'N�o foi poss�vel processar o pagamento. Tente novamente.',
      });
    }
  }  async createSubscriptionPayment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { courseId } = req.body as any;
      const userInfo = (req as any).userInfo;
      if (!userInfo) {
        reply.status(401).send({ success: false, error: 'Voc� precisa estar logado para criar uma assinatura.' });
        return;
      }
      const userId = userInfo.userId;

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
      });    } catch (error) {
      req.log.error('Error creating subscription payment:', error);
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'N�o foi poss�vel criar a assinatura. Tente novamente.',
      });
    }
  }

  async handleWebhook(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const signature = req.headers['stripe-signature'] as string;
      const payload = req.body as string | Buffer;

      await this.processStripeWebhookUseCase.execute(payload, signature);

      reply.status(200).send({ received: true });    } catch (error) {
      req.log.error('Error processing webhook:', error);
      reply.status(400).send({
        success: false,
        error: 'Erro ao processar notifica��o de pagamento.',
      });
    }
  }
  async getPaymentHistory(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userInfo = (req as any).userInfo;
      if (!userInfo) {
        reply.status(401).send({
          success: false,
          error: 'Você precisa estar logado para realizar pagamentos.',
        });
        return;
      }

      const userId = userInfo.userId; 
      const payments = await this.paymentRepository.findByUserId(userId);reply.status(200).send({
        success: true,
        data: { 
          payments: payments.map(payment => ({
            id: payment.id,
            courseId: payment.courseId,
            courseName: `Course ${payment.courseId}`,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paymentType: payment.paymentType,
            createdAt: payment.createdAt.toISOString(),
            refundRequests: [] 
          }))
        }
      });    } catch (error) {
      req.log.error('Error fetching payment history:', error);
      console.error('Payment history error details:', error);
      reply.status(500).send({
        success: false,
        error: 'Não foi possível carregar payment history. Tente novamente.',
      });
    }
  }
  async getPaymentStatus(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { paymentId } = req.params as any;
      const userInfo = (req as any).userInfo;
      if (!userInfo) {
        reply.status(401).send({ success: false, error: 'Você precisa estar logado para realizar pagamentos.' });
        return;
      }
      const userId = userInfo.userId;

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
      req.log.error('Error fetching payment status:', error);      reply.status(500).send({
        success: false,
        error: 'Não foi possível carregar payment status. Tente novamente.',
      });
    }
  }
  async validateCoupon(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { code, coursePrice } = req.body as { code: string; coursePrice: number };
      const userInfo = (req as any).userInfo;
      if (!userInfo) {
        reply.status(401).send({ success: false, error: 'Você precisa estar logado para realizar pagamentos.' });
        return;
      }
      const userId = userInfo.userId;

      const result = await this.validateCouponUseCase.execute({
        code,
        userId,
        originalAmount: coursePrice
      });

      if (!result.isValid) {
        reply.status(400).send({
          success: false,
          error: result.error
        });
        return;
      }

      reply.status(200).send({
        success: true,
        data: {
          couponId: result.coupon?.id,
          discountAmount: result.discountAmount,
          finalAmount: result.finalAmount,
          discountType: result.coupon?.discountType,
          discountValue: result.coupon?.discountValue
        }
      });
    } catch (error) {
      req.log.error('Error validating coupon:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to validate coupon'
      });
    }
  }

  async calculateFees(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { coursePrice, discountAmount } = req.body as { 
        coursePrice: number; 
        discountAmount?: number 
      };

      const result = await this.calculateFeesUseCase.execute({
        coursePrice,
        discountAmount
      });

      reply.status(200).send({
        success: true,
        data: result
      });
    } catch (error) {
      req.log.error('Error calculating fees:', error);
      reply.status(500).send({
        success: false,
        error: 'Failed to calculate fees'
      });
    }
  }

  async createRefundRequest(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {      const { paymentId, reason } = req.body as { 
        paymentId: string; 
        reason: string 
      };
      const userInfo = (req as any).userInfo;
      if (!userInfo) {
        reply.status(401).send({ success: false, error: 'Você precisa estar logado para realizar pagamentos.' });
        return;
      }
      const userId = userInfo.userId;

      const result = await this.createRefundRequestUseCase.execute({
        paymentId,
        userId,
        reason
      });

      if (!result.success) {
        reply.status(400).send({
          success: false,
          error: result.error
        });
        return;
      }

      reply.status(201).send({
        success: true,
        data: {
          refundRequestId: result.refundRequest?.id,
          status: result.refundRequest?.status,
          amount: result.refundRequest?.amount
        }
      });
    } catch (error) {
      req.log.error('Error creating refund request:', error);
      reply.status(500).send({
        success: false,
        error: 'Não foi possível criar refund request. Tente novamente.'
      });
    }
  }

  async requestRefund(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    return this.createRefundRequest(req, reply);
  }
  async getRefundRequests(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userInfo = (req as any).userInfo;
      if (!userInfo) {
        reply.status(401).send({ success: false, error: 'Você precisa estar logado para realizar pagamentos.' });
        return;
      }
      const userId = userInfo.userId;
      
      const payments = await this.paymentRepository.findByUserId(userId);
      
      const refundRequests = payments
        .filter(payment => payment.status === 'REFUNDED')
        .map(payment => ({
          id: `refund_${payment.id}`,
          paymentId: payment.id,
          amount: payment.amount,
          status: 'PROCESSED',
          reason: 'Customer request',
          createdAt: payment.updatedAt,
          courseName: `Course ${payment.courseId}` 
        }));

      reply.status(200).send({
        success: true,
        data: { refundRequests }
      });
    } catch (error) {
      req.log.error('Error fetching refund requests:', error);
      reply.status(500).send({
        success: false,
        error: 'Não foi possível carregar refund requests. Tente novamente.'
      });
    }
  }
}
