import { FastifyRequest, FastifyReply } from 'fastify';
import { PaymentGatewayFactory } from '@/services/PaymentGatewayFactory';
import { PaymentRepository } from '@/interfaces/PaymentRepository';
import { UserRepository } from '@/interfaces/UserRepository';
import { CourseRepository } from '@/interfaces/CourseRepository';
import { PaymentStatus } from '@/models/Payment';
import { AutoEnrollStudentUseCase } from '@/use-cases/AutoEnrollStudentUseCase';
import { ManageEnrollmentStatusUseCase } from '@/use-cases/ManageEnrollmentStatusUseCase';
import { InstructorPayoutService } from '@/services/InstructorPayoutService';

export class WebhookController {
  constructor(
    private paymentGatewayFactory: PaymentGatewayFactory,
    private paymentRepository: PaymentRepository,
    private userRepository: UserRepository,
    private courseRepository: CourseRepository,
    private autoEnrollStudentUseCase: AutoEnrollStudentUseCase,
    private manageEnrollmentStatusUseCase: ManageEnrollmentStatusUseCase,
    private instructorPayoutService: InstructorPayoutService
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

        // Gerenciar status da matrícula baseado no status do pagamento
        const enrollmentResult = await this.manageEnrollmentStatusUseCase.execute({
          paymentId: payment.id,
          newStatus: newStatus
        });

        if (enrollmentResult.success) {
          const actionMessages = {
            'enrolled': `Aluno matriculado automaticamente no curso ${payment.courseId}`,
            'resumed': `Matrícula do aluno reativada no curso ${payment.courseId}`,
            'paused': `Matrícula do aluno pausada no curso ${payment.courseId}`,
            'no_action': `Nenhuma ação necessária para a matrícula`
          };
          
          console.log(`✅ ${actionMessages[enrollmentResult.action || 'no_action']}`);
        } else {
          console.error(`❌ Erro ao gerenciar matrícula: ${enrollmentResult.error}`);
        }

        // Creditar saldo do instrutor se pagamento foi aprovado
        if (newStatus === PaymentStatus.COMPLETED && payment.instructorAmount) {
          await this.creditInstructorBalance(payment.courseId, payment.instructorAmount, payment.id);
        }
      }

    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
    }
  }

  private async creditInstructorBalance(courseId: string, amount: number, paymentId: string): Promise<void> {
    try {
      // Buscar curso para pegar o instructorId
      const course = await this.courseRepository.findById(courseId);
      
      if (!course) {
        console.error(`Curso não encontrado: ${courseId}`);
        return;
      }

      if (!course.instructorId) {
        console.error(`Curso ${courseId} não possui instrutor associado`);
        return;
      }

      // Creditar saldo do instrutor usando o service
      await this.instructorPayoutService.creditInstructorBalance(
        course.instructorId,
        amount,
        paymentId
      );

      console.log(`✅ Saldo creditado com sucesso para instrutor ${course.instructorId}: R$ ${amount}`);
      
    } catch (error) {
      console.error('Erro ao creditar saldo do instrutor:', error);
      // Não relançar o erro para não quebrar o webhook
    }
  }
}
