import { FastifyInstance } from 'fastify';
import { PaymentController } from '@/controllers/PaymentController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';
import { CreateOneTimePaymentUseCase } from '@/use-cases/CreateOneTimePaymentUseCase';
import { CreateSubscriptionPaymentUseCase } from '@/use-cases/CreateSubscriptionPaymentUseCase';
import { ProcessStripeWebhookUseCase } from '@/use-cases/ProcessStripeWebhookUseCase';
import { PaymentRepository } from '@/interfaces/PaymentRepository';

export async function paymentRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const authMiddleware = new AuthMiddleware();

  
  const createOneTimePaymentUseCase = container.resolve<CreateOneTimePaymentUseCase>('CreateOneTimePaymentUseCase');
  const createSubscriptionPaymentUseCase = container.resolve<CreateSubscriptionPaymentUseCase>('CreateSubscriptionPaymentUseCase');
  const processStripeWebhookUseCase = container.resolve<ProcessStripeWebhookUseCase>('ProcessStripeWebhookUseCase');
  const paymentRepository = container.resolve<PaymentRepository>('PaymentRepository');

  const paymentController = new PaymentController(
    createOneTimePaymentUseCase,
    createSubscriptionPaymentUseCase,
    processStripeWebhookUseCase,
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
}
