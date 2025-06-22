import { PaymentGateway } from '../interfaces/PaymentGateway';
import { MercadoPagoService } from './MercadoPagoService';

export type PaymentGatewayType = 'MERCADOPAGO' | 'STRIPE';

export class PaymentGatewayFactory {
  private static instance: PaymentGatewayFactory;
  private gateways: Map<PaymentGatewayType, PaymentGateway> = new Map();

  constructor() {
    this.initializeGateways();
  }

  static getInstance(): PaymentGatewayFactory {
    if (!PaymentGatewayFactory.instance) {
      PaymentGatewayFactory.instance = new PaymentGatewayFactory();
    }
    return PaymentGatewayFactory.instance;
  }

  private initializeGateways(): void {
    // Inicializar apenas o Mercado Pago
    try {
      if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
        this.gateways.set('MERCADOPAGO', new MercadoPagoService());
        console.log('Mercado Pago inicializado com sucesso');
      } else {
        console.warn('MERCADOPAGO_ACCESS_TOKEN não configurado');
      }
    } catch (error) {
      console.error('Erro ao inicializar Mercado Pago:', error);
    }
  }

  getGateway(type?: PaymentGatewayType): PaymentGateway {
    // Se tipo não especificado, usar o padrão das variáveis de ambiente
    if (!type) {
      type = this.getDefaultGateway();
    }

    const gateway = this.gateways.get(type);
    if (!gateway) {
      throw new Error(`Gateway de pagamento ${type} não está configurado ou disponível`);
    }

    return gateway;
  }

  private getDefaultGateway(): PaymentGatewayType {
    // Prioridade baseada nas variáveis de ambiente configuradas
    if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
      return 'MERCADOPAGO';
    }
    if (process.env.STRIPE_SECRET_KEY) {
      return 'STRIPE';
    }
    
    throw new Error('Nenhum gateway de pagamento configurado. Configure MERCADOPAGO_ACCESS_TOKEN ou STRIPE_SECRET_KEY');
  }

  getAvailableGateways(): PaymentGatewayType[] {
    return Array.from(this.gateways.keys());
  }

  isGatewayAvailable(type: PaymentGatewayType): boolean {
    return this.gateways.has(type);
  }
}
