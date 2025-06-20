import { RefundRequestRepository } from '../domain/repositories/RefundRequestRepository';
import { PaymentRepository } from '../interfaces/PaymentRepository';
import { PlatformSettingRepository } from '../domain/repositories/PlatformSettingRepository';
import { RefundRequest } from '../domain/models/RefundRequest';

export interface CreateRefundRequestRequest {
  paymentId: string;
  userId: string;
  reason: string;
}

export interface CreateRefundRequestResponse {
  success: boolean;
  refundRequest?: RefundRequest;
  error?: string;
}

export class CreateRefundRequestUseCase {
  constructor(
    private readonly refundRequestRepository: RefundRequestRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly platformSettingRepository: PlatformSettingRepository
  ) {}

  async execute(request: CreateRefundRequestRequest): Promise<CreateRefundRequestResponse> {
    const { paymentId, userId, reason } = request;

    try {
      const payment = await this.paymentRepository.findById(paymentId);
      
      if (!payment) {
        return {
          success: false,
          error: 'Pagamento não encontrado'
        };
      }

      if (payment.userId !== userId) {
        return {
          success: false,
          error: 'Pagamento não pertence ao usuário'
        };
      }

      if (payment.status !== 'COMPLETED') {
        return {
          success: false,
          error: 'Apenas pagamentos concluídos podem ser reembolsados'
        };
      }

      const refundLimitSetting = await this.platformSettingRepository.findByKey('REFUND_DAYS_LIMIT');
      const refundDaysLimit = refundLimitSetting ? refundLimitSetting.getValueAsNumber() : 7;
      
      const daysSincePayment = Math.floor(
        (Date.now() - payment.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSincePayment > refundDaysLimit) {
        return {
          success: false,
          error: `Prazo para reembolso expirado. Limite: ${refundDaysLimit} dias`
        };
      }

      const existingRefunds = await this.refundRequestRepository.findByPaymentId(paymentId);
      const hasActiveRefund = existingRefunds.some(refund => 
        refund.status === 'PENDING' || refund.status === 'APPROVED'
      );

      if (hasActiveRefund) {
        return {
          success: false,
          error: 'Já existe uma solicitação de reembolso ativa para este pagamento'
        };
      }

      const refundRequest = RefundRequest.create({
        paymentId,
        userId,
        reason,
        amount: payment.amount
      });

      const createdRefund = await this.refundRequestRepository.create(refundRequest);

      return {
        success: true,
        refundRequest: createdRefund
      };

    } catch (error) {
      return {
        success: false,
        error: 'Erro interno ao criar solicitação de reembolso'
      };
    }
  }
}
