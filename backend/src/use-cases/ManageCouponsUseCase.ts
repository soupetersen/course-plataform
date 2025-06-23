import { CouponRepository } from '../interfaces/CouponRepository';
import { Coupon } from '../models/Coupon';

export interface CreateCouponRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue: number;
  maxUses?: number;
  validUntil?: Date;
  isActive?: boolean;
  courseId?: string;
  createdById: string;
}

export interface UpdateCouponRequest {
  id: string;
  code?: string;
  description?: string;
  discountType?: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue?: number;
  maxUses?: number;
  validUntil?: Date;
  isActive?: boolean;
  courseId?: string;
}

export interface CouponResponse {
  success: boolean;
  coupon?: Coupon;
  error?: string;
}

export interface CouponListResponse {
  success: boolean;
  coupons: Coupon[];
  error?: string;
}

export class ManageCouponsUseCase {
  constructor(private readonly couponRepository: CouponRepository) {}

  async createCoupon(request: CreateCouponRequest): Promise<CouponResponse> {
    try {
      const existingCoupon = await this.couponRepository.findByCode(request.code);
      if (existingCoupon) {
        return {
          success: false,
          error: 'Código do cupom já existe'
        };
      }

      if (request.discountType === 'PERCENTAGE' && (request.discountValue <= 0 || request.discountValue > 100)) {
        return {
          success: false,
          error: 'Desconto percentual deve ser entre 1 e 100'
        };
      }

      if (request.discountType === 'FLAT_RATE' && request.discountValue <= 0) {
        return {
          success: false,
          error: 'Valor do desconto deve ser maior que zero'
        };
      }

      const coupon = Coupon.create(request);
      const createdCoupon = await this.couponRepository.create(coupon);

      return {
        success: true,
        coupon: createdCoupon
      };

    } catch (error) {
      return {
        success: false,
        error: 'Erro interno ao criar cupom'
      };
    }
  }

  async updateCoupon(request: UpdateCouponRequest): Promise<CouponResponse> {
    try {
      const existingCoupon = await this.couponRepository.findById(request.id);
      if (!existingCoupon) {
        return {
          success: false,
          error: 'Cupom não encontrado'
        };
      }

      if (request.code && request.code !== existingCoupon.code) {
        const codeExists = await this.couponRepository.findByCode(request.code);
        if (codeExists) {
          return {
            success: false,
            error: 'Código do cupom já existe'
          };
        }
      }

      if (request.discountType === 'PERCENTAGE' && request.discountValue !== undefined) {
        if (request.discountValue <= 0 || request.discountValue > 100) {
          return {
            success: false,
            error: 'Desconto percentual deve ser entre 1 e 100'
          };
        }
      }

      if (request.discountType === 'FLAT_RATE' && request.discountValue !== undefined) {
        if (request.discountValue <= 0) {
          return {
            success: false,
            error: 'Valor do desconto deve ser maior que zero'
          };
        }
      }

      const updatedCoupon = await this.couponRepository.update(request.id, request);

      return {
        success: true,
        coupon: updatedCoupon
      };

    } catch (error) {
      return {
        success: false,
        error: 'Erro interno ao atualizar cupom'
      };
    }
  }

  async deleteCoupon(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const coupon = await this.couponRepository.findById(id);
      if (!coupon) {
        return {
          success: false,
          error: 'Cupom não encontrado'
        };
      }

      await this.couponRepository.delete(id);

      return {
        success: true
      };

    } catch (error) {
      return {
        success: false,
        error: 'Erro interno ao deletar cupom'
      };
    }
  }

  async getCoupon(id: string): Promise<CouponResponse> {
    try {
      const coupon = await this.couponRepository.findById(id);
      
      if (!coupon) {
        return {
          success: false,
          error: 'Cupom não encontrado'
        };
      }

      return {
        success: true,
        coupon
      };

    } catch (error) {
      return {
        success: false,
        error: 'Erro interno ao buscar cupom'
      };
    }
  }

  async getAllCoupons(): Promise<CouponListResponse> {
    try {
      const coupons = await this.couponRepository.findAll();

      return {
        success: true,
        coupons
      };

    } catch (error) {
      return {
        success: false,
        coupons: [],
        error: 'Erro interno ao buscar cupons'
      };
    }
  }

  async getActiveCoupons(): Promise<CouponListResponse> {
    try {
      const coupons = await this.couponRepository.findActive();

      return {
        success: true,
        coupons
      };

    } catch (error) {
      return {
        success: false,
        coupons: [],
        error: 'Erro interno ao buscar cupons ativos'
      };
    }
  }
}
