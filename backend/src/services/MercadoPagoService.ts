import { MercadoPagoConfig, Payment, Preference, PreApproval } from 'mercadopago';
import {
  PaymentGateway,
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentStatusResponse,
  CreateCustomerRequest,
  CreateCustomerResponse,
  WebhookResponse,
  PaymentGatewayStatus,
  StatusMapper,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  SubscriptionStatusResponse,
  CancelSubscriptionResponse,
  SubscriptionGatewayStatus
} from '../interfaces/PaymentGateway';

export class MercadoPagoService implements PaymentGateway, StatusMapper {
  name = 'MERCADOPAGO';
  private client: MercadoPagoConfig;
  private payment: Payment;
  private preference: Preference;
  private preApproval: PreApproval;

  constructor() {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN environment variable is required');
    }

    this.client = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
        idempotencyKey: 'abc'
      }
    });

    this.payment = new Payment(this.client);
    this.preference = new Preference(this.client);
    this.preApproval = new PreApproval(this.client);
  }

  async createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse> {
    try {
      // Para PIX - usar Payment API
      if (request.paymentMethod === 'PIX') {
        const paymentData = {
          transaction_amount: request.amount,
          payment_method_id: 'pix',
          payer: {
            email: request.customerEmail,
            first_name: request.customerName.split(' ')[0],
            last_name: request.customerName.split(' ').slice(1).join(' ') || '',
          },
          description: request.description,
          metadata: request.metadata || {},
          ...(request.notificationUrl && { notification_url: request.notificationUrl }),
        };

        const payment = await this.payment.create({ body: paymentData });

        if (payment.id) {
          return {
            success: true,
            paymentId: payment.id.toString(),
            status: this.mapToStandardStatus(payment.status || 'pending'),
            paymentData: {
              pixQrCode: payment.point_of_interaction?.transaction_data?.qr_code,
              pixCopiaECola: payment.point_of_interaction?.transaction_data?.qr_code_base64,
              ticketUrl: payment.point_of_interaction?.transaction_data?.ticket_url,
            }
          };
        }

        return {
          success: false,
          paymentId: '',
          status: 'REJECTED',
          error: 'Falha ao criar pagamento PIX'
        };
      }

      // Para outros métodos - usar Preference API (checkout pro)
      const preferenceData = {
        items: [
          {
            id: `course_${Date.now()}`,
            title: request.description,
            currency_id: request.currency,
            quantity: 1,
            unit_price: request.amount,
          }
        ],
        payer: {
          email: request.customerEmail,
          name: request.customerName,
        },
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: this.getExcludedPaymentTypes(request.paymentMethod),
          installments: request.paymentMethod === 'CREDIT_CARD' ? 12 : 1,
        },
        back_urls: {
          success: request.returnUrl,
          failure: request.returnUrl,
          pending: request.returnUrl,
        },
        auto_return: 'approved',
        ...(request.notificationUrl && { notification_url: request.notificationUrl }),
        metadata: request.metadata || {},
      };

      const preference = await this.preference.create({ body: preferenceData });

      if (preference.id) {
        return {
          success: true,
          paymentId: preference.id,
          orderId: preference.id,
          status: 'PENDING',
          paymentData: {
            checkoutUrl: preference.init_point,
            sandboxUrl: preference.sandbox_init_point,
          }
        };
      }

      return {
        success: false,
        paymentId: '',
        status: 'REJECTED',
        error: 'Falha ao criar preferência de pagamento'
      };

    } catch (error) {
      console.error('Erro no Mercado Pago:', error);
      return {
        success: false,
        paymentId: '',
        status: 'REJECTED',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const payment = await this.payment.get({ id: paymentId });

      return {
        success: true,
        paymentId: payment.id?.toString() || paymentId,
        status: this.mapToStandardStatus(payment.status || 'pending'),
        amount: payment.transaction_amount || 0,
        paidAmount: payment.transaction_details?.net_received_amount || 0,
        metadata: payment.metadata || {},
      };
    } catch (error) {
      console.error('Erro ao buscar status do pagamento:', error);
      return {
        success: false,
        paymentId,
        status: 'PENDING',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async processWebhook(payload: any): Promise<WebhookResponse> {
    try {
      // Mercado Pago envia diferentes tipos de webhook
      if (payload.type === 'payment') {
        const paymentId = payload.data?.id;
        
        if (paymentId) {
          const paymentStatus = await this.getPaymentStatus(paymentId);
          
          return {
            success: true,
            paymentId: paymentId.toString(),
            status: paymentStatus.status,
            metadata: paymentStatus.metadata,
          };
        }
      }

      return {
        success: false,
        error: 'Tipo de webhook não suportado'
      };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Mapeamento de status do Mercado Pago para status padronizado
  mapToStandardStatus(mercadoPagoStatus: string): PaymentGatewayStatus {
    const statusMap: Record<string, PaymentGatewayStatus> = {
      'pending': 'PENDING',
      'approved': 'APPROVED',
      'authorized': 'APPROVED',
      'in_process': 'PENDING',
      'in_mediation': 'PENDING',
      'rejected': 'REJECTED',
      'cancelled': 'CANCELLED',
      'refunded': 'REFUNDED',
      'charged_back': 'REFUNDED',
    };

    return statusMap[mercadoPagoStatus] || 'PENDING';
  }

  mapFromStandardStatus(standardStatus: PaymentGatewayStatus): string {
    const statusMap: Record<PaymentGatewayStatus, string> = {
      'PENDING': 'pending',
      'APPROVED': 'approved',
      'REJECTED': 'rejected',
      'CANCELLED': 'cancelled',
      'REFUNDED': 'refunded',
    };

    return statusMap[standardStatus] || 'pending';
  }

  // ===============================
  // MÉTODOS PARA ASSINATURAS (PREAPPROVAL)
  // ===============================

  async createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      const preApprovalData = {
        reason: request.description,
        payer_email: request.customerEmail,
        back_url: request.returnUrl,
        ...(request.notificationUrl && { notification_url: request.notificationUrl }),
        auto_recurring: {
          frequency: request.frequency,
          frequency_type: request.frequencyType,
          start_date: request.startDate?.toISOString() || new Date().toISOString(),
          end_date: request.endDate?.toISOString(),
          transaction_amount: request.amount,
          currency_id: request.currency.toUpperCase(),
        },
        status: request.cardToken ? 'authorized' : 'pending',
        ...(request.cardToken && { card_token_id: request.cardToken }),
        metadata: request.metadata || {},
      };

      const preApproval = await this.preApproval.create({ body: preApprovalData });

      if (preApproval.id) {
        return {
          success: true,
          subscriptionId: preApproval.id,
          status: this.mapToStandardSubscriptionStatus(preApproval.status || 'pending'),
          paymentData: {
            checkoutUrl: preApproval.init_point,
            initPoint: preApproval.init_point,
          },
        };
      }

      return {
        success: false,
        subscriptionId: '',
        status: 'CANCELLED',
        error: 'Falha ao criar assinatura no Mercado Pago',
      };
    } catch (error) {
      console.error('Erro ao criar assinatura no Mercado Pago:', error);
      return {
        success: false,
        subscriptionId: '',
        status: 'CANCELLED',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async getSubscriptionStatus(subscriptionId: string): Promise<SubscriptionStatusResponse> {
    try {
      const preApproval = await this.preApproval.get({ id: subscriptionId });

      return {
        success: true,
        subscriptionId: preApproval.id || subscriptionId,
        status: this.mapToStandardSubscriptionStatus(preApproval.status || 'pending'),
        amount: preApproval.auto_recurring?.transaction_amount,
        frequency: preApproval.auto_recurring?.frequency,
        frequencyType: preApproval.auto_recurring?.frequency_type,
        nextPaymentDate: preApproval.next_payment_date ? new Date(preApproval.next_payment_date) : undefined,
        metadata: {},
      };
    } catch (error) {
      console.error('Erro ao buscar status da assinatura:', error);
      return {
        success: false,
        subscriptionId,
        status: 'CANCELLED',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<CancelSubscriptionResponse> {
    try {
      // Para cancelar uma assinatura no Mercado Pago, precisamos atualizar o status para 'cancelled'
      const updateData = {
        status: 'cancelled',
      };

      const updatedPreApproval = await this.preApproval.update({
        id: subscriptionId,
        body: updateData,
      });

      return {
        success: true,
        subscriptionId: updatedPreApproval.id || subscriptionId,
        status: this.mapToStandardSubscriptionStatus(updatedPreApproval.status || 'cancelled'),
      };
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      return {
        success: false,
        subscriptionId,
        status: 'CANCELLED',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Mapeamento de status de assinatura do Mercado Pago para status padronizado
  private mapToStandardSubscriptionStatus(mercadoPagoStatus: string): SubscriptionGatewayStatus {
    const statusMap: Record<string, SubscriptionGatewayStatus> = {
      'pending': 'PENDING',
      'authorized': 'AUTHORIZED',
      'paused': 'PAUSED',
      'cancelled': 'CANCELLED',
      'finished': 'FINISHED',
    };

    return statusMap[mercadoPagoStatus] || 'PENDING';
  }

  private getExcludedPaymentTypes(paymentMethod: string): { id: string }[] {
    // No MercadoPago:
    // - credit_card: Cartões de crédito
    // - debit_card: Cartões de débito  
    // - ticket: Boleto bancário
    // - bank_transfer: PIX e transferências
    
    switch (paymentMethod) {
      case 'PIX':
        // Só permite PIX (bank_transfer), exclui outros
        return [
          { id: 'credit_card' },
          { id: 'debit_card' }, 
          { id: 'ticket' }
        ];
      case 'CREDIT_CARD':
        // Só permite cartão de crédito
        return [
          { id: 'debit_card' },
          { id: 'ticket' },
          { id: 'bank_transfer' }
        ];
      case 'DEBIT_CARD':
        // Só permite cartão de débito
        return [
          { id: 'credit_card' },
          { id: 'ticket' },
          { id: 'bank_transfer' }
        ];
      case 'BOLETO':
        // Só permite boleto (ticket)
        return [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'bank_transfer' }
        ];
      default:
        // Se não especificado, permite todos
        return [];
    }
  }
}
