import { MercadoPagoConfig, Payment, Preference, PreApproval } from 'mercadopago';
import {
  PaymentGateway,
  CreatePaymentRequest,
  CreatePaymentResponse,
  CreateCustomerRequest,
  CreateCustomerResponse,
  WebhookResponse,
  PaymentGatewayStatus,
  StatusMapper,
  CreateSubscriptionRequest,
  CreateSubscriptionResponse,
  SubscriptionStatusResponse,
  CancelSubscriptionResponse,
  SubscriptionGatewayStatus,
  PaymentStatusResponse
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
        // Definir tempo de expiração baseado no valor
        const getPixExpirationMinutes = (amount: number): number => {
          if (amount <= 100) return 10;   // 15 min para valores baixos
          if (amount <= 500) return 20;   // 30 min para valores médios  
          return 30;                      // 1 hora para valores altos
        };

        const expirationMinutes = getPixExpirationMinutes(request.amount);
        const expirationDate = new Date(Date.now() + expirationMinutes * 60 * 1000);

        console.log(`🕐 PIX expirará em ${expirationMinutes} minutos`);
        console.log(`📅 Data atual: ${new Date().toISOString()}`);
        console.log(`📅 Data de expiração: ${expirationDate.toISOString()}`);
        console.log(`📅 Data de expiração local: ${expirationDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);

        const paymentData = {
          transaction_amount: request.amount,
          payment_method_id: 'pix',
          payer: {
            email: request.customerEmail,
            first_name: request.customerName.split(' ')[0],
            last_name: request.customerName.split(' ').slice(1).join(' ') || '',
          },
          description: request.description,
          date_of_expiration: expirationDate.toISOString(), // Sempre UTC para evitar problemas de fuso
          metadata: request.metadata || {},
          // notification_url removida para usar apenas configuração do painel
        };

        const payment = await this.payment.create({ body: paymentData });

        if (payment.id) {
          console.log(`✅ PIX criado: ${payment.id}, expira em: ${payment.date_of_expiration}`);
          
          // Debug: verificar dados do QR Code
          console.log('🔍 Dados do QR Code recebidos do Mercado Pago:', {
            qr_code: payment.point_of_interaction?.transaction_data?.qr_code ? 'Presente' : 'Ausente',
            qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64 ? 'Presente' : 'Ausente',
            ticket_url: payment.point_of_interaction?.transaction_data?.ticket_url ? 'Presente' : 'Ausente'
          });
          
          return {
            success: true,
            paymentId: payment.id.toString(),
            status: this.mapToStandardStatus(payment.status || 'pending'),
            paymentData: {
              pixQrCodeText: payment.point_of_interaction?.transaction_data?.qr_code, // String para "Copia e Cola"
              pixQrCodeImage: payment.point_of_interaction?.transaction_data?.qr_code_base64, // Imagem PNG base64
              ticketUrl: payment.point_of_interaction?.transaction_data?.ticket_url,
              expirationDate: payment.date_of_expiration, // Data de expiração para o frontend
              expirationMinutes: expirationMinutes, // Minutos restantes
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

      if (request.paymentMethod === 'CREDIT_CARD') {
        // Usar Payment API direta para cartão (melhor UX + status imediato)
        const paymentData = {
          transaction_amount: request.amount,
          token: request.cardData?.token, // Token do cartão processado pelo frontend
          description: request.description,
          installments: request.cardData?.installments || 1,
          payment_method_id: request.cardData?.paymentMethodId || 'visa', // ex: visa, master, etc
          issuer_id: request.cardData?.issuerId ? parseInt(request.cardData.issuerId) : undefined,
          payer: {
            email: request.customerEmail,
            first_name: request.customerName.split(' ')[0],
            last_name: request.customerName.split(' ').slice(1).join(' ') || '',
            identification: {
              type: request.cardData?.identificationType || 'CPF',
              number: request.cardData?.identificationNumber || '',
            },
          },
          metadata: request.metadata || {},
          // notification_url removida para usar apenas configuração do painel
        };

        console.log('🔄 Criando pagamento via Payment API para cartão:', {
          amount: paymentData.transaction_amount,
          installments: paymentData.installments,
          method: paymentData.payment_method_id
        });

        const payment = await this.payment.create({ body: paymentData });

        if (payment.id) {
          const status = this.mapToStandardStatus(payment.status || 'pending');
          
          console.log(`✅ Pagamento criado: ${payment.id}, status: ${payment.status} -> ${status}`);
          
          return {
            success: true,
            paymentId: payment.id.toString(),
            status,
            paymentData: {
              // Para cartão aprovado, não precisa de dados extras
              transactionId: payment.id.toString(),
              authorizationCode: payment.authorization_code,
              lastFourDigits: payment.card?.last_four_digits,
            }
          };
        }

        return {
          success: false,
          paymentId: '',
          status: 'REJECTED',
          error: 'Falha ao criar pagamento via cartão'
        };
      }

      // Para outros métodos (boleto) - usar Preference API (checkout pro)
      if (request.paymentMethod === 'BOLETO') {
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
            excluded_payment_types: [
              { id: 'credit_card' }, // Excluir cartão de crédito
              { id: 'debit_card' }, // Excluir cartão de débito
              { id: 'bank_transfer' }, // Excluir transferência
            ],
            installments: 1,
          },
          back_urls: {
            success: request.returnUrl,
            failure: request.returnUrl,
            pending: request.returnUrl,
          },
          // notification_url removida para usar apenas configuração do painel
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
          error: 'Falha ao criar preferência de pagamento para boleto'
        };
      }

      return {
        success: false,
        paymentId: '',
        status: 'REJECTED',
        error: `Método de pagamento ${request.paymentMethod} não suportado`
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
      console.log(`🔍 Buscando status do pagamento ${paymentId} na API do Mercado Pago`);
      
      // Com Payment API, todos os IDs são Payment IDs diretos (PIX e Cartão)
      // Apenas Boleto ainda usa Preference
      const isPreferenceId = paymentId.includes('-');
      
      if (isPreferenceId) {
        console.log(`📋 ID identificado como Preference (Boleto): ${paymentId}`);
        
        // Para Boleto (Preference), buscar pagamentos associados
        try {
          const searchResponse = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${paymentId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
          });

          if (searchResponse.ok) {
            const searchData = await searchResponse.json();
            
            if (searchData.results && searchData.results.length > 0) {
              const latestPayment = searchData.results[0];
              const status = this.mapToStandardStatus(latestPayment.status || 'pending');
              
              console.log(`✅ Pagamento encontrado via search: ${latestPayment.id}, status: ${latestPayment.status} -> ${status}`);
              
              return {
                success: true,
                status,
                paymentId: latestPayment.id?.toString() || paymentId,
                amount: latestPayment.transaction_amount || 0,
                metadata: latestPayment.metadata || {},
              };
            } else {
              console.log(`📋 Nenhum pagamento encontrado para Preference: ${paymentId} (aguardando)`);
              
              // Preference existe mas ainda não foi paga
              return {
                success: true,
                status: 'PENDING',
                paymentId: paymentId,
                amount: 0,
                metadata: {},
              };
            }
          } else {
            throw new Error(`Search API returned ${searchResponse.status}`);
          }
        } catch (searchError) {
          console.error(`❌ Erro ao buscar pagamentos da Preference ${paymentId}:`, searchError);
          throw searchError;
        }
      } else {
        console.log(`💳 ID identificado como Payment (PIX/Cartão): ${paymentId}`);
        
        // Para Payment IDs diretos (PIX e Cartão)
        const payment = await this.payment.get({ id: paymentId });
        
        if (payment) {
          const status = this.mapToStandardStatus(payment.status || 'pending');
          
          console.log(`✅ Status encontrado: ${payment.status} -> ${status}`);
          
          return {
            success: true,
            status,
            paymentId: payment.id?.toString() || paymentId,
            amount: payment.transaction_amount || 0,
            metadata: payment.metadata || {},
          };
        }
      }

      return {
        success: false,
        error: 'Payment not found',
        status: 'REJECTED',
        paymentId,
        amount: 0,
      };
    } catch (error) {
      console.error('❌ Erro ao buscar status do pagamento:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'REJECTED',
        paymentId,
        amount: 0,
      };
    }
  }

  async processWebhook(payload: any): Promise<WebhookResponse> {
    try {
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

  async createSubscription(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse> {
    try {
      const preApprovalData = {
        reason: request.description,
        payer_email: request.customerEmail,
        back_url: request.returnUrl,
        // notification_url removida para usar apenas configuração do painel
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
}
