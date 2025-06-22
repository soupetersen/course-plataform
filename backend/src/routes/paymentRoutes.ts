import { FastifyInstance } from 'fastify';
import { PaymentController } from '@/controllers/PaymentController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';
import { CreateOneTimePaymentUseCase } from '@/use-cases/CreateOneTimePaymentUseCase';
import { CreateSubscriptionPaymentUseCase } from '@/use-cases/CreateSubscriptionPaymentUseCase';
import { ValidateCouponUseCase } from '@/use-cases/ValidateCouponUseCase';
import { CalculateFeesUseCase } from '@/use-cases/CalculateFeesUseCase';
import { CreateRefundRequestUseCase } from '@/use-cases/CreateRefundRequestUseCase';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { PaymentGatewayFactory } from '@/services/PaymentGatewayFactory';

export async function paymentRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const authMiddleware = new AuthMiddleware();    const createOneTimePaymentUseCase = container.resolve<CreateOneTimePaymentUseCase>('CreateOneTimePaymentUseCase');
  const createSubscriptionPaymentUseCase = container.resolve<CreateSubscriptionPaymentUseCase>('CreateSubscriptionPaymentUseCase');
  const validateCouponUseCase = container.resolve<ValidateCouponUseCase>('ValidateCouponUseCase');
  const calculateFeesUseCase = container.resolve<CalculateFeesUseCase>('CalculateFeesUseCase');  const createRefundRequestUseCase = container.resolve<CreateRefundRequestUseCase>('CreateRefundRequestUseCase');const paymentRepository = container.resolve<PaymentRepository>('PaymentRepository');
  const courseRepository = container.resolve<CourseRepository>('CourseRepository');
  const userRepository = container.resolve<UserRepository>('UserRepository');
  const paymentGatewayFactory = container.resolve<PaymentGatewayFactory>('PaymentGatewayFactory');  const paymentController = new PaymentController(
    createOneTimePaymentUseCase,
    createSubscriptionPaymentUseCase,
    validateCouponUseCase,
    calculateFeesUseCase,
    createRefundRequestUseCase,
    paymentRepository,
    courseRepository,
    userRepository,
    paymentGatewayFactory
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
          currency: { type: 'string', default: 'BRL' },
          paymentMethod: { type: 'string', default: 'PIX' },
          gatewayType: { type: 'string', enum: ['MERCADOPAGO'], default: 'MERCADOPAGO' },
          couponCode: { type: 'string' }
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
          courseId: { type: 'string' },
          frequency: { type: 'number', default: 1 },
          frequencyType: { type: 'string', enum: ['days', 'weeks', 'months', 'years'], default: 'months' },
          gatewayType: { type: 'string', enum: ['MERCADOPAGO'], default: 'MERCADOPAGO' },
          cardToken: { type: 'string' }
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
        required: ['code', 'courseId'],
        properties: {
          code: { type: 'string' },
          courseId: { type: 'string' }
        }
      }
    }
  }, paymentController.validateCoupon.bind(paymentController));
  fastify.post('/calculate-fees', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      body: {
        type: 'object',
        required: ['courseId'],
        properties: {
          courseId: { type: 'string' },
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
  }, paymentController.getRefundRequests.bind(paymentController));  fastify.post('/calculate-order-summary', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware),
    schema: {
      body: {
        type: 'object',
        required: ['courseId'],
        properties: {
          courseId: { type: 'string' },
          couponCode: { type: 'string' }
        }      }
    }
  }, paymentController.calculateOrderSummary.bind(paymentController));
  // Rota para ganhos do instrutor
  fastify.get('/instructor/earnings', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, paymentController.getInstructorEarnings.bind(paymentController));

  // Rota para configuração do webhook (desenvolvimento)
  fastify.get('/webhook-config', {
    preHandler: authMiddleware.authenticate.bind(authMiddleware)
  }, paymentController.getWebhookConfig.bind(paymentController));
}
