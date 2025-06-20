import { PlatformSettingRepository } from '../domain/repositories/PlatformSettingRepository';

export interface CalculateFeesRequest {
  coursePrice: number;
  discountAmount?: number;
}

export interface CalculateFeesResponse {
  originalAmount: number;
  discountAmount: number;
  subtotal: number;
  platformFee: number;
  stripeFee: number;
  totalFees: number;
  finalAmount: number;
  instructorAmount: number;
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
    const subtotal = Math.max(0, originalAmount - discountAmount);
    
    const platformFee = Math.round((subtotal * platformFeePercentage) / 100);
    const stripeFee = Math.round((subtotal * stripeFeePercentage) / 100);
    const totalFees = platformFee + stripeFee;
    
    const finalAmount = subtotal;
    
    const instructorAmount = subtotal - platformFee;

    return {
      originalAmount,
      discountAmount,
      subtotal,
      platformFee,
      stripeFee,
      totalFees,
      finalAmount,
      instructorAmount
    };
  }
}
