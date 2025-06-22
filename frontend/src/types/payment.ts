// Payment related types
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
  course?: {
    id: string;
    title: string;
    description?: string;
  };
}

// Coupon related types
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  validUntil?: string;
  isActive: boolean;
  courseId?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string;
  paymentId: string;
  discountAmount: number;
  usedAt: string;
}

export interface CouponValidationRequest {
  code: string;
  courseId: string;
}

export interface CouponValidationResponse {
  success: boolean;
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  finalPrice?: number;
  message?: string;
  error?: string;
}

// Instructor coupon management types
export interface InstructorCoupon extends Coupon {
  courseName?: string;
  totalDiscountGiven: number;
  usages: CouponUsage[];
}

export interface InstructorCourse {
  id: string;
  title: string;
  price: number;
  isPublished: boolean;
}

// Platform Settings types
export interface PlatformSetting {
  id: string;
  key: string;
  value: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN';
  description?: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettingsResponse {
  success: boolean;
  settings: PlatformSetting[];
  message?: string;
  error?: string;
}

// Refund related types
export interface RefundRequest {
  id: string;
  paymentId: string;
  userId: string;
  reason?: string;
  amount: number;
  status: 'PENDING' | 'PROCESSED' | 'APPROVED' | 'REJECTED' | 'FAILED' | 'CANCELLED';
  gatewayRefundId?: string;
  processedAt?: string;
  processedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  payment?: Payment;
}

export interface CreateRefundRequestData {
  paymentId: string;
  reason?: string;
}

export interface RefundRequestResponse {
  success: boolean;
  refundRequest?: RefundRequest;
  message?: string;
  error?: string;
}

// Fee calculation types
export interface FeeCalculationRequest {
  courseId: string;
  discountAmount?: number;
}

export interface FeeCalculationResponse {
  success: boolean;
  calculation: {
    subtotal: number;
    discount: number;
    platformFee: number;
    processingFee: number;
    total: number;
    instructorAmount: number;
  };
  message?: string;
  error?: string;
}

// Admin coupon management types
export interface CreateCouponRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue: number;
  maxUses?: number;
  validUntil?: string;
  isActive?: boolean;
  courseId?: string;
  createdById: string;
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

export interface UpdateCouponRequest {
  code?: string;
  description?: string;
  discountType?: 'PERCENTAGE' | 'FLAT_RATE';
  discountValue?: number;
  maxUses?: number;
  validUntil?: string;
  isActive?: boolean;
  courseId?: string;
}

export interface CouponResponse {
  success: boolean;
  coupon?: Coupon;
  message?: string;
  error?: string;
}

export interface CouponListResponse {
  success: boolean;
  coupons: Coupon[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

// Payment processing types
export interface CreatePaymentRequest {
  courseId: string;
  amount: number;
  couponCode?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreatePaymentResponse {
  success: boolean;
  paymentId?: string;
  url?: string; // Mercado Pago Checkout URL
  message?: string;
  error?: string;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User payment history
export interface UserPaymentHistoryResponse {
  success: boolean;
  payments: Payment[];
  total?: number;
  message?: string;
  error?: string;
}

// Refund request list
export interface RefundRequestListResponse {
  success: boolean;
  refundRequests: RefundRequest[];
  total?: number;
  message?: string;
  error?: string;
}

// Instructor coupon management types
export interface InstructorCoupon extends Coupon {
  courseName?: string;
  totalDiscountGiven: number;
  usages: CouponUsage[];
}

export interface InstructorCourse {
  id: string;
  title: string;
  price: number;
  isPublished: boolean;
}

export interface InstructorCouponResponse {
  success: boolean;
  data: InstructorCoupon[];
  message?: string;
  error?: string;
}

export interface InstructorCoursesResponse {
  success: boolean;
  data: InstructorCourse[];
  message?: string;
  error?: string;
}

// Student coupon types
export interface AvailableCoupon {
  id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT_RATE";
  discountValue: number;
  minimumAmount?: number;
  maxUsageCount?: number;
  currentUsageCount: number;
  validUntil: string;
  isActive: boolean;
  courseId?: string;
  courseTitle?: string;
  createdBy?: string;
  isGlobal?: boolean;
}

export interface CouponUsageHistory {
  id: string;
  coupon: {
    id: string;
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    courseTitle?: string;
  };
  discountAmount: number;
  usedAt: string;
  payment?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  };
}
