import { FastifyRequest, FastifyReply } from 'fastify';
import { PaymentGatewayFactory } from '@/services/PaymentGatewayFactory';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { PaymentStatus } from '@/models/Payment';

export class WebhookController {
  constructor(
    private paymentGatewayFactory: PaymentGatewayFactory,
    private paymentRepository: PaymentRepository,
    private userRepository: UserRepository
  ) {}

  async handleMercadoPagoWebhook(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const gateway = this.paymentGatewayFactory.getGateway('MERCADOPAGO');
      const webhookResult = await gateway.processWebhook!(req.body);

      if (webhookResult.success && webhookResult.paymentId) {
        await this.updatePaymentStatus(webhookResult.paymentId, webhookResult.status!);
      }

      reply.status(200).send({ success: true });
    } catch (error) {
      req.log.error('Erro no webhook Mercado Pago:', error);
      reply.status(500).send({ success: false, error: 'Erro interno' });
    }
  }

  async handleGenericWebhook(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const gatewayType = this.detectGatewayFromWebhook(req);
      
      if (!gatewayType) {
        reply.status(400).send({ success: false, error: 'Gateway não identificado' });
        return;
      }

      const gateway = this.paymentGatewayFactory.getGateway(gatewayType);
      const webhookResult = await gateway.processWebhook!(req.body);

      if (webhookResult.success && webhookResult.paymentId) {
        await this.updatePaymentStatus(webhookResult.paymentId, webhookResult.status!);
      }

      reply.status(200).send({ success: true });
    } catch (error) {
      req.log.error('Erro no webhook genérico:', error);
      reply.status(500).send({ success: false, error: 'Erro interno' });
    }
  }

  private detectGatewayFromWebhook(req: FastifyRequest): 'MERCADOPAGO' | null {
    const body = req.body as any;
    const userAgent = req.headers['user-agent'] || '';

    if (body.type && body.data?.id || userAgent.includes('MercadoPago')) {
      return 'MERCADOPAGO';
    }
    
    return null;
  }

  private async updatePaymentStatus(externalPaymentId: string, status: string): Promise<void> {
    try {
      // Buscar pagamento pelo ID externo
      const payment = await this.paymentRepository.findByExternalPaymentId(externalPaymentId);
      
      if (!payment) {
        console.warn(`Pagamento não encontrado: ${externalPaymentId}`);
        return;
      }

      // Mapear status
      let newStatus: PaymentStatus;
      switch (status) {
        case 'APPROVED':
          newStatus = PaymentStatus.COMPLETED;
          break;
        case 'REJECTED':
        case 'CANCELLED':
          newStatus = PaymentStatus.FAILED;
          break;
        case 'REFUNDED':
          newStatus = PaymentStatus.REFUNDED;
          break;
        default:
          newStatus = PaymentStatus.PENDING;
      }

      // Atualizar status se mudou
      if (payment.status !== newStatus) {
        const updatedPayment = payment.updateStatus(newStatus);
        await this.paymentRepository.update(updatedPayment);

        // Se pagamento foi aprovado, creditar saldo do instrutor
        if (newStatus === PaymentStatus.COMPLETED && payment.instructorAmount) {
          await this.creditInstructorBalance(payment.courseId, payment.instructorAmount);
        }
      }

    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
    }
  }

  private async creditInstructorBalance(courseId: string, amount: number): Promise<void> {
    try {
      // Buscar curso para pegar o instructorId
      // Implementar lógica de crédito de saldo
      console.log(`Creditando R$ ${amount} para instrutor do curso ${courseId}`);
      
      // TODO: Implementar sistema de saldo do instrutor
      // await this.balanceService.creditInstructor(instructorId, amount);
      
    } catch (error) {
      console.error('Erro ao creditar saldo do instrutor:', error);
    }
  }
}
