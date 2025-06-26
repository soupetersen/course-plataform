import { PlatformSettingRepository } from '../interfaces/PlatformSettingRepository';

export interface CalculateFeesRequest {
  coursePrice: number;
  discountAmount?: number;
  paymentMethod?: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO';
}

export interface CalculateFeesResponse {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  platformFee: number; 
  instructorAmount: number;
  stripeFee: number; 
  mercadoPagoFeeDetails?: { 
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
    const finalAmount = Math.max(0, originalAmount - discountAmount); 
    
    const mercadoPagoFeeDetails = this.calculateMercadoPagoFee(finalAmount, paymentMethod);
    
    const netAmount = finalAmount - mercadoPagoFeeDetails.total;
    
    const platformFee = Math.round((netAmount * platformFeePercentage) / 100);
    
    const instructorAmount = netAmount - platformFee;

    return {
      originalAmount,
      discountAmount,
      finalAmount,
      platformFee, 
      instructorAmount, 
      stripeFee: mercadoPagoFeeDetails.total,
      mercadoPagoFeeDetails,
    };
  }

  /**
   * Calcula a taxa do Mercado Pago baseada no método de pagamento
   */
  private calculateMercadoPagoFee(amount: number, paymentMethod: string) {
    const fees = {
      PIX: { percentage: 0.99, fixedFee: 0 },
      CREDIT_CARD: { percentage: 2.99, fixedFee: 0.39 },
      DEBIT_CARD: { percentage: 1.99, fixedFee: 0.39 },
      BOLETO: { percentage: 0, fixedFee: 3.49 }
    };

    const feeConfig = fees[paymentMethod as keyof typeof fees] || fees.PIX;
    
    const percentageFee = (amount * feeConfig.percentage) / 100;
    const total = Math.round((percentageFee + feeConfig.fixedFee) * 100) / 100;

    return {
      percentage: feeConfig.percentage,
      fixedFee: feeConfig.fixedFee,
      total,
      method: paymentMethod
    };
  }
}
