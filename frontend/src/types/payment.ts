export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  gatewayPaymentId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  paymentType: 'ONE_TIME' | 'SUBSCRIPTION';
  gateway: 'MERCADOPAGO';
  createdAt: string;
  updatedAt: string;
  courseName?: string;
  course?: {
    id: string;
    title: string;
    description?: string;
  };
}

export interface RefundRequestResponse {
  success: boolean;
  refundRequest?: RefundRequest;
  message?: string;
  error?: string;
}

export interface FeeCalculationRequest {
  courseId: string;
  discountAmount?: number;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validUntil?: string;
  instructorId?: string;
  courseId?: string;
  courseIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponFormData {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue: number;
  maxUses?: number;
  validUntil?: string;
  isActive?: boolean;
  courseId?: string;
}

export interface CouponValidationRequest {
  code: string;
  courseId?: string;
  amount: number;
}

export interface CouponValidationResponse {
  success: boolean;
  isValid: boolean;
  coupon?: {
    id: string;
    code: string;
    discountType: 'PERCENTAGE' | 'FLAT_RATE';
    discountValue: number;
    minimumAmount?: number;
  };
  discountAmount?: number;
  finalAmount?: number;
  message?: string;
}

export interface FeeCalculationRequest {
  amount: number;
  paymentMethod: string;
  couponCode?: string;
}

export interface FeeCalculationResponse {
  success: boolean;
  fees: {
    platformFee: number;
    paymentFee: number;
    totalFees: number;
  };
  finalAmount: number;
  breakdown: {
    originalAmount: number;
    discount: number;
    fees: number;
    total: number;
  };
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  usedAt: string;
  discountAmount: number;
  payment?: Payment;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CouponApplication {
  couponId: string;
  discountAmount: number;
  finalAmount: number;
  success: boolean;
  error?: string;
}

export interface InstructorCoupon extends Coupon {
  courseName?: string;
  totalDiscountGiven: number;
  usages: CouponUsage[];
}

export interface InstructorCourse {
  id: string;
  title: string;
}

export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  isEditable: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettingsResponse {
  success: boolean;
  data: PlatformSetting[];
  error?: string;
}

export interface UpdatePlatformSettingRequest {
  value: string;
}

export interface RefundRequest {
  id: string;
  paymentId: string;
  userId: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED';
  adminNotes?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  payment?: Payment;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RefundRequestsResponse {
  success: boolean;
  data: RefundRequest[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
}

export interface CreateRefundRequest {
  paymentId: string;
  reason: string;
}

export interface ProcessRefundRequest {
  status: 'APPROVED' | 'REJECTED';
  adminNotes?: string;
}

export interface FeeCalculation {
  originalAmount: number;
  platformFee: number;
  gatewayFee: number;
  instructorAmount: number;
  finalAmount: number;
}

export interface FeeCalculationResponse {
  success: boolean;
  data: FeeCalculation;
  error?: string;
}

export interface FeeStructure {
  platformFeePercentage: number;
  gatewayFeePercentage: number;
  gatewayFeeFixed: number;
}

export interface AdminCouponWithStats extends Coupon {
  totalUsage: number;
  totalDiscountGiven: number;
  courses?: {
    id: string;
    title: string;
  }[];
  usages?: {
    id: string;
    userId: string;
    usedAt: string;
    discountAmount: number;
    user: {
      id: string;
      name: string;
      email: string;
    };
    payment?: {
      id: string;
      amount: number;
      course?: {
        id: string;
        title: string;
      };
    };
  }[];
}

export interface AdminCouponsResponse {
  success: boolean;
  data: AdminCouponWithStats[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
}

export interface AvailableCoupon {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue: number;
  minimumAmount?: number;
  maxUsageCount?: number;
  currentUsageCount: number;
  validUntil: string;
  courseTitle?: string;
  courseId?: string;
  instructorId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminCouponRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue: number;
  maxUses?: number;
  validFrom: string;
  validUntil?: string;
  courseIds?: string[];
}

export interface UpdateAdminCouponRequest {
  description?: string;
  discountValue?: number;
  maxUses?: number;
  validUntil?: string;
  courseIds?: string[];
  isActive?: boolean;
}

export interface PaymentInitiationRequest {
  courseId: string;
  couponCode?: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  data?: {
    paymentId: string;
    url?: string;
  };
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UserPaymentHistory {
  payments: Payment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RefundRequestList {
  requests: RefundRequest[];
  total: number;
  page: number;
  totalPages: number;
}

export interface InstructorCouponListResponse {
  success: boolean;
  data: InstructorCoupon[];
  total: number;
  page: number;
  totalPages: number;
  error?: string;
}

export interface CreateInstructorCouponRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue: number;
  maxUses?: number;
  validFrom: string;
  validUntil?: string;
  courseIds?: string[];
}

export interface UpdateInstructorCouponRequest {
  description?: string;
  discountValue?: number;
  maxUses?: number;
  validUntil?: string;
  courseIds?: string[];
  isActive?: boolean;
}

export interface StudentCouponResponse {
  success: boolean;
  data: {
    coupon: Coupon;
    discountAmount: number;
    finalAmount: number;
  };
  error?: string;
}

export interface ValidateCouponRequest {
  code: string;
  courseId: string;
}

export interface SavedCard {
  id: string;
  userId: string;
  lastFourDigits: string;
  cardNetwork: string;
  expirationDate: string;
  isDefault: boolean;
  createdAt: string;
}

export interface SavedCardsResponse {
  success: boolean;
  data: SavedCard[];
  error?: string;
}

export interface CreateSavedCardRequest {
  cardToken: string;
  lastFourDigits: string;
  cardNetwork: string;
  expirationDate: string;
  isDefault?: boolean;
}

export interface PaymentProcessingData {
  courseId: string;
  amount: number;
  couponCode?: string;
  paymentMethodId?: string;
  cardToken?: string;
  saveCard?: boolean;
}

export interface CreateRefundRequestData {
  paymentId: string;
  reason: string;
  amount?: number;
}

export interface CreatePaymentRequest {
  courseId: string;
  paymentMethod: string;
  couponCode?: string;
  savedCardId?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  payment?: {
    id: string;
    status: string;
    amount: number;
    paymentUrl?: string;
    qrCode?: string;
    pixCode?: string;
  };
  message?: string;
}

export interface UserPaymentHistoryResponse {
  success: boolean;
  payments: Payment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface RefundRequestListResponse {
  success: boolean;
  refundRequests: RefundRequest[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateCouponRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue: number;
  maxUses?: number;
  validUntil?: string;
  isActive?: boolean;
  courseId?: string;
  courseIds?: string[];
  minimumAmount?: number;
}

export interface UpdateCouponRequest {
  code?: string;
  description?: string;
  discountType?: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue?: number;
  maxUses?: number;
  validUntil?: string;
  isActive?: boolean;
  courseId?: string;
  courseIds?: string[];
  minimumAmount?: number;
}

export interface CouponResponse {
  success: boolean;
  coupon?: Coupon;
  message?: string;
}

export interface CouponListResponse {
  success: boolean;
  coupons: Coupon[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
