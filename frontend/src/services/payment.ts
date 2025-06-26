export interface PaymentGateway {
  name: 'MERCADOPAGO';
  displayName: string;
  supportedMethods: PaymentMethod[];
  supportedCurrencies: string[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO';
  icon?: string;
}

export interface CreatePaymentRequest {
  courseId: string;
  currency: string;
  paymentMethod: string;
  gatewayType: 'MERCADOPAGO';
  couponCode?: string;
}

export interface CreateSubscriptionRequest {
  courseId: string;
  frequency: number;
  frequencyType: 'days' | 'weeks' | 'months' | 'years';
  gatewayType: 'MERCADOPAGO';
  cardToken?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    paymentId: string;
    paymentData?: {
      pixQrCode?: string;
      pixCopiaECola?: string;
      checkoutUrl?: string;
      boletoUrl?: string;
      clientSecret?: string;
    };
    amount: number;
    currency: string;
  };
  error?: string;
}

export interface SubscriptionResponse {
  success: boolean;
  data?: {
    paymentId: string;
    subscriptionId: string;
    subscriptionData?: {
      checkoutUrl?: string;
      clientSecret?: string;
    };
    amount: number;
    currency: string;
  };
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    paymentType: string;
    createdAt: string;
  };
  error?: string;
}

export interface CouponValidationResponse {
  success: boolean;
  data?: {
    couponId: string;
    discountAmount: number;
    finalAmount: number;
    discountType: string;
    discountValue: number;
  };
  error?: string;
}

export interface OrderSummaryResponse {
  success: boolean;
  data?: {
    originalPrice: number;
    discountAmount: number;
    finalPrice: number;
    platformFee: number;
    instructorAmount: number;
    processingFeeEstimate: number;
    totalWithFees: number;
    coupon?: {
      code: string;
      discountType: string;
      discountValue: number;
      applied: boolean;
    } | null;
  };
  error?: string;
}

export const PAYMENT_GATEWAYS: Record<string, PaymentGateway> = {
  MERCADOPAGO: {
    name: 'MERCADOPAGO',
    displayName: 'Mercado Pago',
    supportedMethods: [
      { id: 'PIX', name: 'PIX', type: 'PIX' },
      { id: 'CREDIT_CARD', name: 'Cartão de Crédito', type: 'CREDIT_CARD' },
      { id: 'DEBIT_CARD', name: 'Cartão de Débito', type: 'DEBIT_CARD' },
      { id: 'BOLETO', name: 'Boleto', type: 'BOLETO' },
    ],
    supportedCurrencies: ['BRL'],
  },
};

class PaymentService {
  private baseUrl = '/api/payments';

  async createOneTimePayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseUrl}/one-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<SubscriptionResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseUrl}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseUrl}/${paymentId}/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      return { success: false, error: 'Erro ao buscar status do pagamento' };
    }
  }

  async validateCoupon(code: string, coursePrice: number): Promise<CouponValidationResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseUrl}/validate-coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, coursePrice }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error validating coupon:', error);
      return { success: false, error: 'Erro ao validar cupom' };
    }
  }

  async calculateOrderSummary(courseId: string, couponCode?: string): Promise<OrderSummaryResponse> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${this.baseUrl}/calculate-order-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ courseId, couponCode }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error calculating order summary:', error);
      return { success: false, error: 'Erro ao calcular resumo do pedido' };
    }
  }

  getAvailableGateways(): PaymentGateway[] {
    return Object.values(PAYMENT_GATEWAYS);
  }

  getGateway(gatewayType: string): PaymentGateway | null {
    return PAYMENT_GATEWAYS[gatewayType] || null;
  }

  getDefaultGateway(): PaymentGateway {
    return PAYMENT_GATEWAYS.MERCADOPAGO;
  }
}

export const paymentService = new PaymentService();
export default paymentService;

