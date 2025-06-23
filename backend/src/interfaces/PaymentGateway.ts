// Interfaces genéricas para gateway de pagamento
export interface PaymentGateway {
  name: string;
  createPayment(request: CreatePaymentRequest): Promise<CreatePaymentResponse>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse>;
  createCustomer?(request: CreateCustomerRequest): Promise<CreateCustomerResponse>;
  processWebhook?(payload: any, signature?: string): Promise<WebhookResponse>;
  
  // Métodos para assinaturas recorrentes
  createSubscription?(request: CreateSubscriptionRequest): Promise<CreateSubscriptionResponse>;
  getSubscriptionStatus?(subscriptionId: string): Promise<SubscriptionStatusResponse>;
  cancelSubscription?(subscriptionId: string): Promise<CancelSubscriptionResponse>;
}

export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  description: string;
  metadata?: Record<string, any>;
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO';
  returnUrl?: string;
  notificationUrl?: string;
  
  cardData?: {
    cardNumber: string;
    cardHolderName: string;
    expirationMonth: string;
    expirationYear: string;
    securityCode: string;
    installments?: number;
    identificationType?: string;
    identificationNumber?: string;
    // Campos para Payment API direta
    token?: string; // Token gerado pelo MercadoPago.js no frontend
    paymentMethodId?: string; // visa, mastercard, etc
    issuerId?: string; // ID do banco emissor
  };
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentId: string;
  orderId?: string;
  status: PaymentGatewayStatus;
  paymentData?: {
    pixQrCode?: string;
    pixCopiaECola?: string;
    checkoutUrl?: string;
    boletoUrl?: string;
    [key: string]: any;
  };
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  paymentId: string;
  status: PaymentGatewayStatus;
  amount?: number;
  paidAmount?: number;
  metadata?: Record<string, any>;
  error?: string;
}

export interface CreateCustomerRequest {
  email: string;
  name: string;
  document?: string; // CPF/CNPJ
  phone?: string;
}

export interface CreateCustomerResponse {
  success: boolean;
  customerId: string;
  error?: string;
}

// Interfaces para assinaturas recorrentes
export interface CreateSubscriptionRequest {
  customerId?: string;
  customerEmail: string;
  customerName: string;
  customerDocument?: string;
  amount: number;
  currency: string;
  frequency: number; // 1 para mensal, 2 para bimestral, etc.
  frequencyType: 'days' | 'weeks' | 'months' | 'years';
  startDate?: Date;
  endDate?: Date;
  description: string;
  metadata?: Record<string, any>;
  cardToken?: string;
  returnUrl?: string;
  notificationUrl?: string;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  subscriptionId: string;
  status: SubscriptionGatewayStatus;
  paymentData?: {
    checkoutUrl?: string;
    initPoint?: string;
    [key: string]: any;
  };
  error?: string;
}

export interface SubscriptionStatusResponse {
  success: boolean;
  subscriptionId: string;
  status: SubscriptionGatewayStatus;
  amount?: number;
  frequency?: number;
  frequencyType?: string;
  nextPaymentDate?: Date;
  metadata?: Record<string, any>;
  error?: string;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  subscriptionId: string;
  status: SubscriptionGatewayStatus;
  error?: string;
}

export interface WebhookResponse {
  success: boolean;
  paymentId?: string;
  status?: string;
  metadata?: Record<string, any>;
  error?: string;
}

// Tipos de status padronizados
export type PaymentGatewayStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED';
export type SubscriptionGatewayStatus = 'PENDING' | 'AUTHORIZED' | 'PAUSED' | 'CANCELLED' | 'FINISHED';

// Mapeamento de status específicos do gateway para status padronizado
export interface StatusMapper {
  mapToStandardStatus(gatewayStatus: string): PaymentGatewayStatus;
  mapFromStandardStatus(standardStatus: PaymentGatewayStatus): string;
}
