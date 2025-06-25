import { PlatformSettingRepository } from '../interfaces/PlatformSettingRepository';

export interface CalculateFeesRequest {
  coursePrice: number;
  discountAmount?: number;
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO';
}

export interface CalculateFeesResponse {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number; // Valor que o aluno vai pagar
  platformFee: number; // Taxa da plataforma (sobre valor líquido)
  instructorAmount: number; // Valor que o instrutor recebe
  stripeFee: number; // Taxa do Mercado Pago (cobrada automaticamente na compra)
  mercadoPagoFeeDetails?: { // Detalhes da taxa do Mercado Pago
    percentage: number;
    fixedFee: number;
    total: number;
    method: string;
  };
}

export class CalculateFeesUseCase {
  constructor(
    private readonly platformSettingRepository: PlatformSettingRepository
  ) {}

  async execute(request: CalculateFeesRequest): Promise<CalculateFeesResponse> {
    const { coursePrice, discountAmount = 0, paymentMethod = 'PIX' } = request;

    const platformFeeSetting = await this.platformSettingRepository.findByKey('PLATFORM_FEE_PERCENTAGE');
    const platformFeePercentage = platformFeeSetting ? platformFeeSetting.getValueAsNumber() : 10;

    const originalAmount = coursePrice;
    const finalAmount = Math.max(0, originalAmount - discountAmount); // Valor que o aluno paga
    
    // Calcular taxa do Mercado Pago baseada no método de pagamento
    const mercadoPagoFeeDetails = this.calculateMercadoPagoFee(finalAmount, paymentMethod);
    
    // Valor líquido que chega na sua conta (após Mercado Pago descontar)
    const netAmount = finalAmount - mercadoPagoFeeDetails.total;
    
    // Calcular taxa da plataforma (% do valor líquido)
    const platformFee = Math.round((netAmount * platformFeePercentage) / 100);
    
    // Valor que o instrutor recebe (valor líquido - taxa da plataforma)
    const instructorAmount = netAmount - platformFee;

    return {
      originalAmount,
      discountAmount,
      finalAmount, // Aluno paga este valor
      platformFee, // Plataforma fica com este valor
      instructorAmount, // Instrutor recebe este valor
      stripeFee: mercadoPagoFeeDetails.total, // Taxa Mercado Pago (renomeando para compatibilidade)
      mercadoPagoFeeDetails, // Detalhes da taxa
    };
  }

  /**
   * Calcula a taxa do Mercado Pago baseada no método de pagamento
   */
  private calculateMercadoPagoFee(amount: number, paymentMethod: string) {
    // Taxas do Mercado Pago (atualizado para 2025)
    const fees = {
      PIX: { percentage: 0.99, fixedFee: 0 },
      CREDIT_CARD: { percentage: 2.99, fixedFee: 0.39 },
      DEBIT_CARD: { percentage: 1.99, fixedFee: 0.39 },
      BOLETO: { percentage: 0, fixedFee: 3.49 }
    };

    const feeConfig = fees[paymentMethod as keyof typeof fees] || fees.PIX;
    
    const percentageFee = (amount * feeConfig.percentage) / 100;
    const total = Math.round((percentageFee + feeConfig.fixedFee) * 100) / 100; // Arredondar para 2 casas decimais

    return {
      percentage: feeConfig.percentage,
      fixedFee: feeConfig.fixedFee,
      total,
      method: paymentMethod
    };
  }
}
