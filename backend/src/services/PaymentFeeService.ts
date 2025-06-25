/**
 * Service para gerenciar taxas dos gateways de pagamento
 * 
 * IMPORTANTE: As taxas do Mercado Pago são FIXAS e não podem ser alteradas
 * via configuração. Estas são as taxas oficiais do gateway de pagamento.
 */
export class PaymentFeeService {
  /**
   * Retorna as taxas FIXAS do Mercado Pago (não configuráveis)
   * Estas taxas são definidas pelo próprio Mercado Pago
   */
  static getMercadoPagoFees() {
    return {
      PIX: {
        percentage: 0.99,
        fixedFee: 0,
        description: 'PIX - Taxa mais baixa'
      },
      CREDIT_CARD: {
        percentage: 2.99,
        fixedFee: 0.39,
        description: 'Cartão de Crédito - À vista'
      },
      DEBIT_CARD: {
        percentage: 1.99,
        fixedFee: 0.39,
        description: 'Cartão de Débito'
      },
      BOLETO: {
        percentage: 0,
        fixedFee: 3.49,
        description: 'Boleto Bancário - Taxa fixa'
      }
    };
  }

  /**
   * Calcula a taxa do Mercado Pago para um valor e método específico
   */
  static calculateMercadoPagoFee(amount: number, paymentMethod: string) {
    const fees = this.getMercadoPagoFees();
    const feeConfig = fees[paymentMethod as keyof typeof fees] || fees.PIX;
    
    const percentageFee = (amount * feeConfig.percentage) / 100;
    const total = Math.round((percentageFee + feeConfig.fixedFee) * 100) / 100;

    return {
      percentage: feeConfig.percentage,
      fixedFee: feeConfig.fixedFee,
      percentageFee: Math.round(percentageFee * 100) / 100,
      total,
      method: paymentMethod,
      description: feeConfig.description
    };
  }

  /**
   * Retorna todas as opções de pagamento com suas respectivas taxas para um valor
   */
  static getPaymentOptionsWithFees(amount: number) {
    const fees = this.getMercadoPagoFees();
    
    return Object.keys(fees).map(method => {
      const fee = this.calculateMercadoPagoFee(amount, method);
      const netAmount = amount - fee.total;
      
      return {
        method,
        description: fee.description,
        fee: fee.total,
        feeDetails: `${fee.percentage}%${fee.fixedFee > 0 ? ` + R$ ${fee.fixedFee}` : ''}`,
        netAmount,
        recommended: method === 'PIX' // PIX é sempre o mais econômico
      };
    });
  }

  /**
   * Retorna a opção de pagamento mais econômica
   */
  static getCheapestPaymentOption(amount: number) {
    const options = this.getPaymentOptionsWithFees(amount);
    return options.reduce((cheapest, current) => 
      current.fee < cheapest.fee ? current : cheapest
    );
  }

  /**
   * Calcula breakdown completo de valores
   */
  static calculateFullBreakdown(amount: number, paymentMethod: string, platformFeePercentage = 10) {
    const mercadoPagoFee = this.calculateMercadoPagoFee(amount, paymentMethod);
    const netAmount = amount - mercadoPagoFee.total;
    const platformFee = Math.round((netAmount * platformFeePercentage) / 100);
    const instructorAmount = netAmount - platformFee;

    return {
      studentPays: amount,
      mercadoPago: {
        fee: mercadoPagoFee.total,
        details: mercadoPagoFee
      },
      platform: {
        fee: platformFee,
        percentage: platformFeePercentage
      },
      instructor: {
        amount: instructorAmount,
        percentage: Math.round((instructorAmount / amount) * 100)
      },
      totals: {
        netReceived: netAmount,
        totalFees: mercadoPagoFee.total + platformFee
      }
    };
  }
}
