import { FastifyInstance } from 'fastify';
import { InstructorPayoutController } from '@/controllers/InstructorPayoutController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { DIContainer } from '@/shared/utils/DIContainer';
import { InstructorPayoutService } from '@/services/InstructorPayoutService';
import { CalculateFeesUseCase } from '@/use-cases/CalculateFeesUseCase';

export async function instructorPayoutRoutes(fastify: FastifyInstance) {
  const container = (fastify as any).diContainer as DIContainer;
  const instructorPayoutService = container.resolve<InstructorPayoutService>('InstructorPayoutService');
  const instructorPayoutController = new InstructorPayoutController(instructorPayoutService);
  const authMiddleware = new AuthMiddleware();

  fastify.register(async function(fastify) {
    fastify.addHook('preHandler', authMiddleware.authenticate.bind(authMiddleware));
    fastify.addHook('preHandler', authMiddleware.requireInstructor());

    /**
     * @swagger
     * /instructor/payout/data:
     *   put:
     *     tags: [Instructor Payout]
     *     summary: Atualizar dados de pagamento do instrutor
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - payoutPreference
     *               - documentType
     *               - documentNumber
     *               - fullName
     *             properties:
     *               pixKey:
     *                 type: string
     *                 description: Chave PIX (CPF, email, telefone ou chave aleatória)
     *               bankData:
     *                 type: object
     *                 properties:
     *                   bank:
     *                     type: string
     *                   agency:
     *                     type: string
     *                   account:
     *                     type: string
     *                   accountType:
     *                     type: string
     *                     enum: [CORRENTE, POUPANCA]
     *                   accountHolder:
     *                     type: string
     *               payoutPreference:
     *                 type: string
     *                 enum: [PIX, BANK_TRANSFER]
     *               documentType:
     *                 type: string
     *                 enum: [CPF, CNPJ]
     *               documentNumber:
     *                 type: string
     *               fullName:
     *                 type: string
     *     responses:
     *       200:
     *         description: Dados atualizados com sucesso
     */
    fastify.put('/instructor/payout/data', {
      schema: {
        body: {
          type: 'object',
          required: ['payoutPreference', 'documentType', 'documentNumber', 'fullName'],
          properties: {
            pixKey: { type: 'string' },
            bankData: {
              type: 'object',
              properties: {
                bank: { type: 'string' },
                agency: { type: 'string' },
                account: { type: 'string' },
                accountType: { type: 'string', enum: ['CORRENTE', 'POUPANCA'] },
                accountHolder: { type: 'string' }
              }
            },
            payoutPreference: { type: 'string', enum: ['PIX', 'BANK_TRANSFER'] },
            documentType: { type: 'string', enum: ['CPF', 'CNPJ'] },
            documentNumber: { type: 'string' },
            fullName: { type: 'string' }
          }
        }
      }
    }, instructorPayoutController.updatePayoutData.bind(instructorPayoutController));

    /**
     * @swagger
     * /instructor/payout/balance:
     *   get:
     *     tags: [Instructor Payout]
     *     summary: Obter saldo atual do instrutor
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Saldo do instrutor
     */
    fastify.get('/instructor/payout/balance', instructorPayoutController.getBalance.bind(instructorPayoutController));

    /**
     * @swagger
     * /instructor/payout/request:
     *   post:
     *     tags: [Instructor Payout]
     *     summary: Solicitar saque
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - amount
     *               - method
     *             properties:
     *               amount:
     *                 type: number
     *                 minimum: 50
     *               method:
     *                 type: string
     *                 enum: [PIX, BANK_TRANSFER]
     *     responses:
     *       200:
     *         description: Solicitação criada com sucesso
     */
    fastify.post('/instructor/payout/request', {
      schema: {
        body: {
          type: 'object',
          required: ['amount', 'method'],
          properties: {
            amount: { type: 'number', minimum: 50 },
            method: { type: 'string', enum: ['PIX', 'BANK_TRANSFER'] }
          }
        }
      }
    }, instructorPayoutController.requestPayout.bind(instructorPayoutController));

    /**
     * @swagger
     * /instructor/payout/history:
     *   get:
     *     tags: [Instructor Payout]
     *     summary: Histórico de saques
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Lista de saques do instrutor
     */
    fastify.get('/instructor/payout/history', instructorPayoutController.getPayoutHistory.bind(instructorPayoutController));

    /**
     * @swagger
     * /instructor/payout/transactions:
     *   get:
     *     tags: [Instructor Payout]
     *     summary: Extrato de transações
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - name: page
     *         in: query
     *         schema:
     *           type: integer
     *           default: 1
     *       - name: limit
     *         in: query
     *         schema:
     *           type: integer
     *           default: 20
     *     responses:
     *       200:
     *         description: Extrato de transações
     */
    fastify.get('/instructor/payout/transactions', instructorPayoutController.getTransactionHistory.bind(instructorPayoutController));
  });

  /**
   * @swagger
   * /payment/fees/calculate:
   *   post:
   *     tags: [Payment Fees]
   *     summary: Calcular taxas de pagamento para diferentes métodos
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - amount
   *             properties:
   *               amount:
   *                 type: number
   *                 description: Valor do curso
   *               paymentMethod:
   *                 type: string
   *                 enum: [PIX, CREDIT_CARD, DEBIT_CARD, BOLETO]
   *                 default: PIX
   *               discountAmount:
   *                 type: number
   *                 default: 0
   *     responses:
   *       200:
   *         description: Breakdown detalhado das taxas
   */
  fastify.post('/payment/fees/calculate', {
    schema: {
      body: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'number', minimum: 0.01 },
          paymentMethod: { 
            type: 'string', 
            enum: ['PIX', 'CREDIT_CARD', 'DEBIT_CARD', 'BOLETO'],
            default: 'PIX'
          },
          discountAmount: { type: 'number', default: 0 }
        }
      }
    }
  }, async (request, reply) => {
    const { amount, paymentMethod = 'PIX', discountAmount = 0 } = request.body as any;
    
    try {
      const container = (fastify as any).diContainer as DIContainer;
      const calculateFeesUseCase = container.resolve<CalculateFeesUseCase>('CalculateFeesUseCase');
      
      const feesResult = await calculateFeesUseCase.execute({
        coursePrice: amount,
        discountAmount,
        paymentMethod
      });
      
      const { PaymentFeeService } = await import('@/services/PaymentFeeService');
      const allOptions = PaymentFeeService.getPaymentOptionsWithFees(feesResult.finalAmount);
      const breakdown = PaymentFeeService.calculateFullBreakdown(feesResult.finalAmount, paymentMethod);
      
      reply.send({
        success: true,
        data: {
          selectedMethod: {
            method: paymentMethod,
            breakdown
          },
          allOptions,
          recommendation: {
            cheapest: PaymentFeeService.getCheapestPaymentOption(feesResult.finalAmount),
            savings: (() => {
              const selectedOption = allOptions.find(opt => opt.method === paymentMethod);
              const pixOption = allOptions.find(opt => opt.method === 'PIX');
              if (selectedOption && pixOption) {
                return selectedOption.fee - pixOption.fee;
              }
              return 0;
            })()
          }
        }
      });
    } catch (error: any) {
      console.error('Erro ao calcular taxas:', error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  });

  /**
   * @swagger
   * /payment/fees/options:
   *   get:
   *     tags: [Payment Fees]
   *     summary: Listar opções de pagamento disponíveis com taxas
   *     parameters:
   *       - name: amount
   *         in: query
   *         required: true
   *         schema:
   *           type: number
   *           minimum: 0.01
   *     responses:
   *       200:
   *         description: Lista de métodos de pagamento com taxas
   */
  fastify.get('/payment/fees/options', {
    schema: {
      querystring: {
        type: 'object',
        required: ['amount'],
        properties: {
          amount: { type: 'number', minimum: 0.01 }
        }
      }
    }
  }, async (request, reply) => {
    const { amount } = request.query as any;
    
    try {
      const { PaymentFeeService } = await import('@/services/PaymentFeeService');
      
      const options = PaymentFeeService.getPaymentOptionsWithFees(amount);
      const cheapest = PaymentFeeService.getCheapestPaymentOption(amount);
      
      reply.send({
        success: true,
        data: {
          amount,
          options,
          recommendation: cheapest,
          summary: {
            highestFee: Math.max(...options.map(opt => opt.fee)),
            lowestFee: Math.min(...options.map(opt => opt.fee)),
            potentialSavings: Math.max(...options.map(opt => opt.fee)) - Math.min(...options.map(opt => opt.fee))
          }
        }
      });
    } catch (error: any) {
      console.error('Erro ao buscar opções de pagamento:', error);
      reply.status(500).send({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  });
}
