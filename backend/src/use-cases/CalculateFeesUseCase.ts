import { PlatformSettingRepository } from '../domain/repositories/PlatformSettingRepository';

export interface CalculateFeesRequest {
  coursePrice: number;
  discountAmount?: number;
}

export interface CalculateFeesResponse {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number; // Valor que o aluno vai pagar (sem taxas adicionais)
  platformFee: number; // Taxa da plataforma (será debitada via Stripe Connect)
  instructorAmount: number; // Valor que o instrutor recebe
  stripeFee: number; // Taxa do Stripe (estimativa para exibição)
}

export class CalculateFeesUseCase {
  constructor(
    private readonly platformSettingRepository: PlatformSettingRepository
  ) {}

  async execute(request: CalculateFeesRequest): Promise<CalculateFeesResponse> {
    const { coursePrice, discountAmount = 0 } = request;

    const platformFeeSetting = await this.platformSettingRepository.findByKey('PLATFORM_FEE_PERCENTAGE');
    const stripeFeeSetting = await this.platformSettingRepository.findByKey('STRIPE_FEE_PERCENTAGE');

    const platformFeePercentage = platformFeeSetting ? platformFeeSetting.getValueAsNumber() : 10;
    const stripeFeePercentage = stripeFeeSetting ? stripeFeeSetting.getValueAsNumber() : 2.9;

    const originalAmount = coursePrice;
    const finalAmount = Math.max(0, originalAmount - discountAmount); // Valor que o aluno paga
    
    // Calcular taxa da plataforma (10% do valor final)
    const platformFee = Math.round((finalAmount * platformFeePercentage) / 100);
    
    // Valor que o instrutor recebe (valor final - taxa da plataforma)
    const instructorAmount = finalAmount - platformFee;
    
    // Taxa do Stripe (estimativa para exibição - será debitada separadamente)
    const stripeFee = Math.round((finalAmount * stripeFeePercentage) / 100);

    return {
      originalAmount,
      discountAmount,
      finalAmount, // Aluno paga este valor
      platformFee, // Plataforma fica com este valor
      instructorAmount, // Instrutor recebe este valor
      stripeFee, // Taxa Stripe (apenas para exibição)
    };
  }
}
