import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateOneTimePaymentUseCase } from '@/use-cases/CreateOneTimePaymentUseCase';
import { CreateSubscriptionPaymentUseCase } from '@/use-cases/CreateSubscriptionPaymentUseCase';
import { ValidateCouponUseCase } from '@/use-cases/ValidateCouponUseCase';
import { CalculateFeesUseCase } from '@/use-cases/CalculateFeesUseCase';
import { CreateRefundRequestUseCase } from '@/use-cases/CreateRefundRequestUseCase';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { PaymentGatewayFactory } from '@/services/PaymentGatewayFactory';
import { Payment, PaymentStatus } from '@/models/Payment';
import { PaymentGatewayStatus } from '@/interfaces/PaymentGateway';

export class PaymentController {
  constructor(
    private createOneTimePaymentUseCase: CreateOneTimePaymentUseCase,
    private createSubscriptionPaymentUseCase: CreateSubscriptionPaymentUseCase,
    private validateCouponUseCase: ValidateCouponUseCase,
    private calculateFeesUseCase: CalculateFeesUseCase,
    private createRefundRequestUseCase: CreateRefundRequestUseCase,
    private paymentRepository: PaymentRepository,
    private courseRepository: CourseRepository,
    private userRepository: UserRepository,
    private paymentGatewayFactory: PaymentGatewayFactory
  ) {}

  private mapGatewayStatusToDomain(gatewayStatus: PaymentGatewayStatus): PaymentStatus {
    const statusMap: Record<PaymentGatewayStatus, PaymentStatus> = {
      'PENDING': PaymentStatus.PENDING,
      'APPROVED': PaymentStatus.COMPLETED,
      'REJECTED': PaymentStatus.FAILED,
      'CANCELLED': PaymentStatus.CANCELLED,
      'REFUNDED': PaymentStatus.REFUNDED,
    };
    
    return statusMap[gatewayStatus] || PaymentStatus.PENDING;
  }async createOneTimePayment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { courseId, currency, paymentMethod = 'PIX', gatewayType, couponCode, cardData } = req.body as any;
      const userInfo = (req as any).userInfo;
      
      console.log('Received payment request:', { courseId, currency, paymentMethod, gatewayType, couponCode });
      
      if (!userInfo) {
        reply.status(401).send({ 
          success: false, 
          error: 'Você precisa estar logado para realizar um pagamento.' 
        });
        return;
      }      const result = await this.createOneTimePaymentUseCase.execute({
        userId: userInfo.userId,
        courseId,
        currency,
        paymentMethod,
        gatewayType,
        couponCode,
        cardData,
      });

      reply.status(201).send({
        success: true,
        data: {
          paymentId: result.payment.id,
          paymentData: result.paymentData,
          amount: result.payment.amount,
          currency: result.payment.currency,
        },
      });    } catch (error) {
      req.log.error('Error creating one-time payment:', error);
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Não foi possível processar o pagamento.',
      });
    }
  }
  async createSubscriptionPayment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { courseId, frequency = 1, frequencyType = 'months', gatewayType = 'MERCADOPAGO', cardToken } = req.body as any;
      const userInfo = (req as any).userInfo;
      
      if (!userInfo) {
        reply.status(401).send({ 
          success: false, 
          error: 'Você precisa estar logado para realizar uma assinatura.' 
        });
        return;
      }

      const result = await this.createSubscriptionPaymentUseCase.execute({
        userId: userInfo.userId,
        courseId,
        frequency,
        frequencyType,
        gatewayType,
        cardToken,
      });

      reply.status(201).send({
        success: true,
        data: {
          paymentId: result.payment.id,
          subscriptionId: result.subscription.id,
          subscriptionData: result.subscriptionData,
          amount: result.payment.amount,
          currency: result.payment.currency,
        },
      });
    } catch (error) {
      req.log.error('Error creating subscription payment:', error);
      reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Não foi possível processar a assinatura.',
      });
    }
  }  // Webhook genérico para processamento de notificações de pagamento
  async handleWebhook(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Log detalhado do webhook recebido
      console.log('🔔 Webhook recebido:', {
        method: req.method,
        headers: req.headers,
        body: req.body,
        query: req.query,
        url: req.url
      });

      const gatewayType = req.headers['x-gateway-type'] as string || 'MERCADOPAGO';
      const gateway = this.paymentGatewayFactory.getGateway(gatewayType as any);
      
      if (gateway.processWebhook) {
        const result = await gateway.processWebhook(req.body);
          if (result.success && result.paymentId) {
          // Atualizar status do pagamento no banco
          const payment = await this.paymentRepository.findByExternalPaymentId(result.paymentId);
          if (payment && result.status) {
            // Mapear status do gateway para status interno
            let internalStatus;
            switch (result.status) {
              case 'APPROVED':
                internalStatus = 'COMPLETED';
                break;
              case 'REJECTED':
                internalStatus = 'FAILED';
                break;
              case 'CANCELLED':
                internalStatus = 'CANCELLED';
                break;
              default:
                internalStatus = 'PENDING';
            }
            
            const updatedPayment = payment.updateStatus(internalStatus as any);
            await this.paymentRepository.update(updatedPayment);
          }
        }
      }

      reply.status(200).send({ received: true });
    } catch (error) {
      req.log.error('Error processing webhook:', error);
      reply.status(400).send({
        success: false,
        error: 'Erro ao processar notificação de pagamento.',
      });
    }
  }
  async getPaymentHistory(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userInfo = (req as any).userInfo;
      if (!userInfo) {
        reply.status(401).send({
          success: false,
          error: 'Você precisa estar logado para realizar pagamentos.'
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
  }  async getPaymentStatus(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { paymentId } = req.params as any;
      const userInfo = (req as any).userInfo;
      
      if (!userInfo) {
        reply.status(401).send({ 
          success: false, 
          error: 'Você precisa estar logado para consultar status de pagamentos.' 
        });
        return;
      }

      // Buscar pagamento no banco
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        reply.status(404).send({
          success: false,
          error: 'Pagamento não encontrado',
        });
        return;
      }

      // Verificar se o pagamento pertence ao usuário
      if (payment.userId !== userInfo.userId) {
        reply.status(403).send({
          success: false,
          error: 'Acesso negado',
        });
        return;
      }

      console.log(`📋 Consultando status do pagamento ${paymentId} (provider: ${payment.gatewayProvider})`);

      // Se o pagamento já está finalizado (approved/rejected/cancelled), retorna do banco
      if (['COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(payment.status)) {
        console.log(`✅ Pagamento ${paymentId} já finalizado com status: ${payment.status}`);
        reply.status(200).send({
          success: true,
          data: {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            paymentType: payment.paymentType,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
          },
        });
        return;
      }

      // Para pagamentos pendentes, buscar status atualizado na API do gateway
      try {
        if (payment.gatewayProvider === 'MERCADOPAGO' && payment.externalPaymentId) {
          const gateway = this.paymentGatewayFactory.getGateway('MERCADOPAGO');
          const statusResponse = await gateway.getPaymentStatus(payment.externalPaymentId);
          
          if (statusResponse.success) {
            console.log(`🔄 Status do Mercado Pago: ${statusResponse.status} para pagamento ${paymentId}`);
              // Se o status mudou, atualizar no banco
            const domainStatus = this.mapGatewayStatusToDomain(statusResponse.status);
            if (domainStatus !== payment.status) {
              console.log(`🔄 Atualizando status do pagamento ${paymentId}: ${payment.status} -> ${domainStatus}`);
              
              // Criar um novo objeto Payment com o status atualizado
              const updatedPayment = new Payment(
                payment.id,
                payment.userId,
                payment.courseId,
                payment.externalPaymentId,
                payment.amount,
                payment.currency,
                domainStatus,
                payment.paymentType,
                payment.createdAt,
                new Date(), // updatedAt
                payment.externalOrderId,
                payment.paymentData,
                payment.paymentMethod,
                payment.platformFeeAmount,
                payment.instructorAmount,
                payment.gatewayProvider
              );
              
              await this.paymentRepository.update(updatedPayment);
              
              console.log(`✅ Status do pagamento ${paymentId} atualizado no banco para: ${domainStatus}`);
              
              // Retornar o status atualizado
              reply.status(200).send({
                success: true,
                data: {
                  id: updatedPayment.id,
                  status: updatedPayment.status,
                  amount: updatedPayment.amount,
                  currency: updatedPayment.currency,
                  paymentType: updatedPayment.paymentType,
                  createdAt: updatedPayment.createdAt,
                  updatedAt: updatedPayment.updatedAt,
                },
              });
              return;
            }
          } else {
            console.log(`⚠️ Erro ao consultar status no Mercado Pago: ${statusResponse.error}`);
          }
        }
      } catch (gatewayError) {
        console.error(`❌ Erro ao consultar gateway para pagamento ${paymentId}:`, gatewayError);
        // Continua e retorna o status do banco mesmo se houver erro no gateway
      }

      // Retornar status atual do banco (não houve mudança ou erro no gateway)
      reply.status(200).send({
        success: true,
        data: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          paymentType: payment.paymentType,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        },
      });} catch (error) {
      req.log.error('Error fetching payment status:', error);reply.status(500).send({
        success: false,
        error: 'Não foi possível carregar payment status. Tente novamente.',
      });
    }
  }

  async getCoursePendingPayment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { courseId } = req.params as any;
      const userInfo = (req as any).userInfo;
      
      if (!userInfo) {
        reply.status(401).send({ 
          success: false, 
          error: 'Você precisa estar logado para consultar pagamentos.' 
        });
        return;
      }

      // Buscar pagamento pendente para este curso e usuário
      const pendingPayment = await this.paymentRepository.findPendingByCourseAndUser(courseId, userInfo.userId);
      
      if (pendingPayment) {
        reply.status(200).send({
          success: true,
          data: {
            id: pendingPayment.id,
            status: pendingPayment.status,
            amount: pendingPayment.amount,
            currency: pendingPayment.currency,
            paymentType: pendingPayment.paymentType,
            createdAt: pendingPayment.createdAt,
            updatedAt: pendingPayment.updatedAt,
          },
        });
      } else {
        reply.status(200).send({
          success: true,
          data: null,
        });
      }
    } catch (error) {
      req.log.error('Error fetching course pending payment:', error);
      reply.status(500).send({
        success: false,
        error: 'Não foi possível verificar pagamentos pendentes. Tente novamente.',
      });
    }
  }

  async validateCoupon(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { code, courseId } = req.body as { code: string; courseId: string };
      const userInfo = (req as any).userInfo;
      if (!userInfo) {
        reply.status(401).send({ success: false, error: 'Você precisa estar logado para realizar pagamentos.' });
        return;
      }
      const userId = userInfo.userId;

      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        reply.status(404).send({
          success: false,
          error: 'Curso não encontrado'
        });
        return;
      }

      const result = await this.validateCouponUseCase.execute({
        code,
        userId,
        originalAmount: course.price
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
      const { courseId, discountAmount } = req.body as { 
        courseId: string; 
        discountAmount?: number 
      };

      // Buscar o curso para obter o preço
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        reply.status(404).send({
          success: false,
          error: 'Course not found'
        });
        return;
      }

      const result = await this.calculateFeesUseCase.execute({
        coursePrice: course.price,
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

  async calculateOrderSummary(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { courseId, couponCode } = req.body as { 
        courseId: string; 
        couponCode?: string;
      };
      const userInfo = (req as any).userInfo;
      if (!userInfo) {
        reply.status(401).send({ success: false, error: 'Você precisa estar logado para calcular o pedido.' });
        return;
      }
      const userId = userInfo.userId;      // Buscar o curso para obter o preço original SEGURO
      const course = await this.courseRepository.findById(courseId);
      if (!course) {
        reply.status(404).send({ success: false, error: 'Curso não encontrado.' });
        return;
      }
      
      const originalPrice = course.price;
      
      let discountAmount = 0;
      let couponData = null;
      
      // Validar cupom se fornecido
      if (couponCode) {
        const couponResult = await this.validateCouponUseCase.execute({
          code: couponCode,
          userId,
          originalAmount: originalPrice
        });
        
        if (couponResult.isValid) {
          discountAmount = couponResult.discountAmount || 0;
          couponData = couponResult.coupon;
        }
      }
      
      // Calcular taxas
      const finalPrice = Math.max(0, originalPrice - discountAmount);
      const feesResult = await this.calculateFeesUseCase.execute({
        coursePrice: originalPrice,
        discountAmount
      });      const summary = {
        originalPrice,
        discountAmount,
        finalPrice,
        platformFee: feesResult.platformFee,
        instructorAmount: feesResult.instructorAmount,
        stripeFeeEstimate: feesResult.stripeFee, // Apenas para transparência        totalWithFees: finalPrice, // Usuário paga APENAS o valor do curso
        coupon: couponData ? {
          code: couponCode,
          discountType: couponData.discountType,
          discountValue: couponData.discountValue,
          applied: true
        } : null
      };

      reply.status(200).send({
        success: true,
        data: summary
      });
    } catch (error) {
      req.log.error('Error calculating order summary:', error);
      reply.status(500).send({
        success: false,
        error: 'Não foi possível calcular o resumo do pedido. Tente novamente.',
      });
    }
  }
  // Método para obter ganhos do instrutor (simplificado - dados mock por enquanto)
  async getInstructorEarnings(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const userInfo = (req as any).userInfo;
      if (!userInfo) {
        reply.status(401).send({
          success: false,
          error: 'Você precisa estar logado.',
        });
        return;
      }

      const userId = userInfo.userId;
      const user = await this.userRepository.findById(userId);
      
      if (!user || user.role !== 'INSTRUCTOR') {
        reply.status(403).send({
          success: false,
          error: 'Apenas instrutores podem acessar esta informação.',
        });
        return;
      }

      // TODO: Implementar busca real quando os métodos estiverem disponíveis
      // Por enquanto, retornar dados de exemplo
      const totalEarnings = 2450.00;
      const totalSales = 27;
      
      const recentTransactions = [
        {
          id: '1',
          amount: 90.00,
          courseTitle: 'React Avançado',
          date: new Date().toISOString().split('T')[0],
          status: 'completed' as const,
        },
        {
          id: '2',
          amount: 135.00,
          courseTitle: 'Node.js do Zero',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'completed' as const,
        }
      ];

      reply.status(200).send({
        success: true,
        data: {
          totalEarnings,
          totalSales,
          currentBalance: totalEarnings, // Simplificado - todos os ganhos estão disponíveis
          pendingBalance: 0,
          recentTransactions,
        },
      });
    } catch (error) {
      req.log.error('Error fetching instructor earnings:', error);      reply.status(500).send({
        success: false,
        error: 'Erro ao buscar ganhos do instrutor.',
      });
    }
  }

  async getWebhookConfig(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const baseUrl = process.env.NGROK_URL || process.env.API_BASE_URL || 'http://localhost:3000';
      const notificationUrl = `${baseUrl}/api/payments/webhook`;
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      reply.status(200).send({
        success: true,
        data: {
          notificationUrl,
          frontendUrl,
          baseUrl,
          isUsingNgrok: !!process.env.NGROK_URL,
          environment: process.env.NODE_ENV || 'development',
        },
      });    } catch (error) {
      req.log.error('Error fetching webhook config:', error);
      reply.status(500).send({
        success: false,
        error: 'Erro ao buscar configuração de webhook.',      });
    }
  }

  // Método para simular aprovação PIX em ambiente de desenvolvimento
  async simulatePixPayment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { paymentId } = req.params as any;
      const { status = 'approved' } = req.body as any;

      console.log(`🎭 [DEV] Simulando ${status} para PIX ${paymentId}`);

      // Buscar pagamento no banco
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        reply.status(404).send({
          success: false,
          error: 'Pagamento não encontrado',
        });
        return;
      }

      if (payment.paymentMethod !== 'PIX') {
        reply.status(400).send({
          success: false,
          error: 'Simulação só funciona para pagamentos PIX',
        });
        return;
      }

      if (!['PENDING'].includes(payment.status)) {
        reply.status(400).send({
          success: false,
          error: `Pagamento já possui status: ${payment.status}`,
        });
        return;
      }

      // Simular mudança de status
      const newStatus = status === 'approved' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED;
      
      const updatedPayment = new Payment(
        payment.id,
        payment.userId,
        payment.courseId,
        payment.externalPaymentId,
        payment.amount,
        payment.currency,
        newStatus,
        payment.paymentType,
        payment.createdAt,
        new Date(), // updatedAt
        payment.externalOrderId,
        payment.paymentData,
        payment.paymentMethod,
        payment.platformFeeAmount,
        payment.instructorAmount,
        payment.gatewayProvider
      );

      await this.paymentRepository.update(updatedPayment);

      console.log(`✅ [DEV] PIX ${paymentId} simulado como ${newStatus}`);

      reply.status(200).send({
        success: true,
        message: `PIX ${status === 'approved' ? 'aprovado' : 'rejeitado'} com sucesso (simulação)`,
        data: {
          id: updatedPayment.id,
          status: updatedPayment.status,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          paymentType: updatedPayment.paymentType,
          createdAt: updatedPayment.createdAt,
          updatedAt: updatedPayment.updatedAt,
        },
      });
    } catch (error) {
      req.log.error('Error simulating PIX:', error);
      reply.status(500).send({
        success: false,
        error: 'Não foi possível simular o PIX. Tente novamente.',      });
    }
  }

  // === MÉTODOS DE ADMINISTRAÇÃO ===

  async getAllPayments(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { status, page = 1, limit = 20 } = req.query as any;
      const userInfo = (req as any).userInfo;

      if (!userInfo) {
        reply.status(401).send({
          success: false,
          error: 'Você precisa estar logado para acessar pagamentos.',
        });
        return;
      }

      // Verificar se é admin (você pode implementar sua lógica de admin aqui)
      // Por enquanto, qualquer usuário logado pode ver (para desenvolvimento)
      
      console.log(`📋 Listando pagamentos - Status: ${status || 'todos'}, Página: ${page}, Limite: ${limit}`);

      // Buscar todos os pagamentos com filtros
      const payments = await this.paymentRepository.findAll({
        status,
        page: parseInt(page),
        limit: parseInt(limit)
      });      // Buscar informações adicionais dos usuários e cursos
      const enrichedPayments = await Promise.all(
        payments.map(async (payment: Payment) => {
          const user = await this.userRepository.findById(payment.userId);
          const course = await this.courseRepository.findById(payment.courseId);
          
          return {
            id: payment.id,
            userId: payment.userId,
            userName: user?.name || 'Usuário não encontrado',
            userEmail: user?.email || 'Email não encontrado',
            courseId: payment.courseId,
            courseTitle: course?.title || 'Curso não encontrado',
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            paymentType: payment.paymentType,
            paymentMethod: payment.paymentMethod,
            externalPaymentId: payment.externalPaymentId,
            gatewayProvider: payment.gatewayProvider,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
          };
        })
      );

      reply.status(200).send({
        success: true,
        data: {
          payments: enrichedPayments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: enrichedPayments.length
          }
        },
      });
    } catch (error) {
      req.log.error('Error fetching all payments:', error);
      reply.status(500).send({
        success: false,
        error: 'Não foi possível carregar os pagamentos. Tente novamente.',
      });
    }
  }
  async adminApprovePayment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { paymentId } = req.params as any;
      const { reason } = req.body as any;
      const userInfo = (req as any).userInfo;

      if (!userInfo) {
        reply.status(401).send({
          success: false,
          error: 'Você precisa estar logado para aprovar pagamentos.',
        });
        return;
      }

      console.log(`🎭 Admin aprovando pagamento ${paymentId} por ${userInfo.email}`);

      // Buscar pagamento no banco
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        reply.status(404).send({
          success: false,
          error: 'Pagamento não encontrado',
        });
        return;
      }

      // Verificar se o pagamento pode ser alterado
      if (['COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(payment.status)) {
        reply.status(400).send({
          success: false,
          error: `Pagamento já possui status final: ${payment.status}`,
        });
        return;
      }

      // Atualizar status do pagamento para COMPLETED
      const updatedPayment = new Payment(
        payment.id,
        payment.userId,
        payment.courseId,
        payment.externalPaymentId,
        payment.amount,
        payment.currency,
        PaymentStatus.COMPLETED,
        payment.paymentType,
        payment.createdAt,
        new Date(), // updatedAt
        payment.externalOrderId,
        payment.paymentData,
        payment.paymentMethod,
        payment.platformFeeAmount,
        payment.instructorAmount,
        payment.gatewayProvider
      );

      await this.paymentRepository.update(updatedPayment);

      console.log(`✅ Pagamento ${paymentId} aprovado pelo admin`);

      reply.status(200).send({
        success: true,
        message: 'Pagamento aprovado com sucesso',
        data: {
          id: updatedPayment.id,
          status: updatedPayment.status,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          paymentType: updatedPayment.paymentType,
          createdAt: updatedPayment.createdAt,
          updatedAt: updatedPayment.updatedAt,
          adminAction: {
            action: 'approve',
            reason,
            adminUser: userInfo.email,
            timestamp: new Date().toISOString()
          }
        },
      });
    } catch (error) {
      req.log.error('Error in admin payment approval:', error);
      reply.status(500).send({
        success: false,
        error: 'Não foi possível aprovar o pagamento. Tente novamente.',
      });
    }
  }
  async adminRejectPayment(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { paymentId } = req.params as any;
      const { reason } = req.body as any;
      const userInfo = (req as any).userInfo;

      if (!userInfo) {
        reply.status(401).send({
          success: false,
          error: 'Você precisa estar logado para rejeitar pagamentos.',
        });
        return;
      }

      console.log(`🎭 Admin rejeitando pagamento ${paymentId} por ${userInfo.email}`);

      // Buscar pagamento no banco
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        reply.status(404).send({
          success: false,
          error: 'Pagamento não encontrado',
        });
        return;
      }

      // Verificar se o pagamento pode ser alterado
      if (['COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(payment.status)) {
        reply.status(400).send({
          success: false,
          error: `Pagamento já possui status final: ${payment.status}`,
        });
        return;
      }

      // Atualizar status do pagamento para FAILED
      const updatedPayment = new Payment(
        payment.id,
        payment.userId,
        payment.courseId,
        payment.externalPaymentId,
        payment.amount,
        payment.currency,
        PaymentStatus.FAILED,
        payment.paymentType,
        payment.createdAt,
        new Date(), // updatedAt
        payment.externalOrderId,
        payment.paymentData,
        payment.paymentMethod,
        payment.platformFeeAmount,
        payment.instructorAmount,
        payment.gatewayProvider
      );

      await this.paymentRepository.update(updatedPayment);

      console.log(`❌ Pagamento ${paymentId} rejeitado pelo admin`);

      reply.status(200).send({
        success: true,
        message: 'Pagamento rejeitado com sucesso',
        data: {
          id: updatedPayment.id,
          status: updatedPayment.status,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          paymentType: updatedPayment.paymentType,
          createdAt: updatedPayment.createdAt,
          updatedAt: updatedPayment.updatedAt,
          adminAction: {
            action: 'reject',
            reason,
            adminUser: userInfo.email,
            timestamp: new Date().toISOString()
          }
        },
      });
    } catch (error) {
      req.log.error('Error in admin payment rejection:', error);
      reply.status(500).send({
        success: false,
        error: 'Não foi possível rejeitar o pagamento. Tente novamente.',
      });
    }
  }
}
