import { FastifyInstance } from 'fastify';
import { PaymentController } from '@/controllers/PaymentController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';
import { CreateOneTimePaymentUseCase } from '@/use-cases/CreateOneTimePaymentUseCase';
import { CreateSubscriptionPaymentUseCase } from '@/use-cases/CreateSubscriptionPaymentUseCase';
import { ProcessStripeWebhookUseCase } from '@/use-cases/ProcessStripeWebhookUseCase';
import { ValidateCouponUseCase } from '@/use-cases/ValidateCouponUseCase';
import { CalculateFeesUseCase } from '@/use-cases/CalculateFeesUseCase';
import { CreateRefundRequestUseCase } from '@/use-cases/CreateRefundRequestUseCase';
import { PaymentRepository } from '@/interfaces/PaymentRepository';

export async function paymentRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const authMiddleware = new AuthMiddleware();

    const createOneTimePaymentUseCase = container.resolve<CreateOneTimePaymentUseCase>('CreateOneTimePaymentUseCase');
  const createSubscriptionPaymentUseCase = container.resolve<CreateSubscriptionPaymentUseCase>('CreateSubscriptionPaymentUseCase');
  const processStripeWebhookUseCase = container.resolve<ProcessStripeWebhookUseCase>('ProcessStripeWebhookUseCase');
  const validateCouponUseCase = container.resolve<ValidateCouponUseCase>('ValidateCouponUseCase');
  const calculateFeesUseCase = container.resolve<CalculateFeesUseCase>('CalculateFeesUseCase');
  const createRefundRequestUseCase = container.resolve<CreateRefundRequestUseCase>('CreateRefundRequestUseCase');
  const paymentRepository = container.resolve<PaymentRepository>('PaymentRepository');

  const paymentController = new PaymentController(
    createOneTimePaymentUseCase,
    createSubscriptionPaymentUseCase,
    processStripeWebhookUseCase,
    validateCouponUseCase,
    calculateFeesUseCase,
    createRefundRequestUseCase,
    paymentRepository
  );

  
  fastify.post('/webhook', {
    config: {
      
      skipAuth: true
    },
    preValidation: async (request, reply) => {
      
      request.raw.setEncoding('utf8');
    }
  }, paymentController.handleWebhook.bind(paymentController));

  
  fastify.post('/one-time', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      body: {
        type: 'object',
        required: ['courseId'],
        properties: {
          courseId: { type: 'string' },
          currency: { type: 'string', default: 'usd' }
        }
      }
    }
  }, paymentController.createOneTimePayment.bind(paymentController));

  fastify.post('/subscription', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      body: {
        type: 'object',
        required: ['courseId'],
        properties: {
          courseId: { type: 'string' }
        }
      }
    }
  }, paymentController.createSubscriptionPayment.bind(paymentController));
  fastify.get('/history', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, paymentController.getPaymentHistory.bind(paymentController));

  fastify.get('/my-payments', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, paymentController.getPaymentHistory.bind(paymentController));
  fastify.get('/:paymentId/status', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      params: {
        type: 'object',
        properties: {
          paymentId: { type: 'string' }
        }
      }
    }
  }, paymentController.getPaymentStatus.bind(paymentController));

  fastify.post('/validate-coupon', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      body: {
        type: 'object',
        required: ['code', 'coursePrice'],
        properties: {
          code: { type: 'string' },
          coursePrice: { type: 'number' }
        }
      }
    }
  }, paymentController.validateCoupon.bind(paymentController));

  fastify.post('/calculate-fees', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      body: {
        type: 'object',
        required: ['coursePrice'],
        properties: {
          coursePrice: { type: 'number' },
          discountAmount: { type: 'number' }
        }
      }
    }
  }, paymentController.calculateFees.bind(paymentController));
  fastify.post('/refund-request', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      body: {
        type: 'object',
        required: ['paymentId', 'reason'],
        properties: {
          paymentId: { type: 'string' },
          reason: { type: 'string' }
        }
      }
    }
  }, paymentController.createRefundRequest.bind(paymentController));

  fastify.post('/request-refund', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      body: {
        type: 'object',
        required: ['paymentId', 'reason'],
        properties: {
          paymentId: { type: 'string' },
          reason: { type: 'string' }
        }
      }
    }
  }, paymentController.requestRefund.bind(paymentController));

  fastify.get('/refund-requests', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, paymentController.getRefundRequests.bind(paymentController));
}
