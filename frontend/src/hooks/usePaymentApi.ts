import { useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import {
  CouponValidationRequest,
  CouponValidationResponse,
  FeeCalculationRequest,
  FeeCalculationResponse,
  CreateRefundRequestData,
  RefundRequestResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  UserPaymentHistoryResponse,
  RefundRequestListResponse,
  CreateCouponRequest,
  CreateCouponFormData,
  UpdateCouponRequest,
  CouponResponse,
  CouponListResponse,
  PlatformSettingsResponse,
  PlatformSetting,
  InstructorCoupon,
  InstructorCourse,
  AvailableCoupon,
  CouponUsage,
} from '@/types/payment';

interface PaymentApprovalResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    paymentType: string;
    createdAt: string;
    updatedAt: string;
    adminAction: {
      action: string;
      reason?: string;
      adminUser: string;
      timestamp: string;
    };
  };
}

interface PaymentListItem {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: string;
  paymentType: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
  };
}

interface PaymentListData {
  payments: PaymentListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

interface PaymentListResponse {
  success: boolean;
  data: PaymentListData;
}

export function usePaymentApi() {
  const validateCoupon = useCallback(
    async (request: CouponValidationRequest): Promise<CouponValidationResponse | null> => {
      try {
        const response = await apiRequest<ApiResponse<CouponValidationResponse>>({
          method: 'POST',
          url: '/api/payments/validate-coupon',
          data: request,
        });
        return response.data;
      } catch (error) {
        console.error('Validate coupon error:', error);
        return null;
      }
    },
    []
  );

  const calculateFees = useCallback(
    async (request: FeeCalculationRequest): Promise<FeeCalculationResponse | null> => {
      try {
        const response = await apiRequest<ApiResponse<FeeCalculationResponse>>({
          method: 'POST',
          url: '/api/payments/calculate-fees',
          data: request,
        });
        return response.data;
      } catch (error) {
        console.error('Calculate fees error:', error);
        return null;
      }
    },
    []
  );

  const createPayment = useCallback(
    async (request: CreatePaymentRequest): Promise<CreatePaymentResponse | null> => {
      try {
        const response = await apiRequest<ApiResponse<CreatePaymentResponse>>({
          method: 'POST',
          url: '/api/payments/one-time',
          data: request,
        });
        return response.data;
      } catch (error) {
        console.error('Create payment error:', error);
        return null;
      }
    },
    []
  );

  const requestRefund = useCallback(
    async (request: CreateRefundRequestData): Promise<RefundRequestResponse | null> => {
      try {
        const response = await apiRequest<ApiResponse<RefundRequestResponse>>({
          method: 'POST',
          url: '/api/payments/request-refund',
          data: request,
        });
        return response.data;
      } catch (error) {
        console.error('Request refund error:', error);
        return null;
      }
    },
    []
  );

  const getUserPayments = useCallback(
    async (): Promise<UserPaymentHistoryResponse | null> => {
      try {
        const response = await apiRequest<ApiResponse<UserPaymentHistoryResponse>>({
          method: 'GET',
          url: '/api/payments/my-payments',
        });
        return response.data;
      } catch (error) {
        console.error('Get user payments error:', error);
        return null;
      }
    },
    []
  );

  const getUserRefundRequests = useCallback(
    async (): Promise<RefundRequestListResponse | null> => {
      try {
        const response = await apiRequest<ApiResponse<RefundRequestListResponse>>({
          method: 'GET',
          url: '/api/payments/refund-requests',
        });
        return response.data;
      } catch (error) {
        console.error('Get user refund requests error:', error);
        return null;
      }
    },
    []
  );

  // Admin payment functions
  const approvePayment = useCallback(
    async (paymentId: string, reason?: string): Promise<PaymentApprovalResponse | null> => {
      try {
        const response = await apiRequest<PaymentApprovalResponse>({
          method: 'POST',
          url: `/api/payments/admin/${paymentId}/approve`,
          data: { reason: reason || '' },
        });
        return response;
      } catch (error) {
        console.error('Approve payment error:', error);
        return null;
      }
    },
    []
  );

  const rejectPayment = useCallback(
    async (paymentId: string, reason?: string): Promise<PaymentApprovalResponse | null> => {
      try {
        const response = await apiRequest<PaymentApprovalResponse>({
          method: 'POST',
          url: `/api/payments/admin/${paymentId}/reject`,
          data: { reason: reason || '' },
        });
        return response;
      } catch (error) {
        console.error('Reject payment error:', error);
        return null;
      }
    },
    []
  );

  const getAllPayments = useCallback(
    async (filters?: {
      status?: string;
      page?: number;
      limit?: number;
    }): Promise<PaymentListResponse | null> => {
      try {
        console.log("🔍 Iniciando getAllPayments com filtros:", filters);
        
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        
        const url = `/api/payments/admin/all${params.toString() ? '?' + params.toString() : ''}`;
        console.log("📡 URL da requisição:", url);
        
        const response = await apiRequest<PaymentListResponse>({
          method: 'GET',
          url,
        });
        
        console.log("✅ Resposta bruta do apiRequest:", response);
        return response;
      } catch (error) {
        console.error('❌ Erro em getAllPayments:', error);
        return null;
      }
    },
    []
  );

  return {
    validateCoupon,
    calculateFees,
    createPayment,
    requestRefund,
    getUserPayments,
    getUserRefundRequests,
    // Admin functions
    approvePayment,
    rejectPayment,
    getAllPayments,
  };
}

export function useAdminCouponApi() {
  const getCoupons = useCallback(
    async (): Promise<CouponListResponse | null> => {
      try {
        const response = await apiRequest<ApiResponse<CouponListResponse>>({
          method: 'GET',
          url: '/api/admin/coupons',
        });
        return response.data;
      } catch (error) {
        console.error('Get coupons error:', error);
        return null;
      }
    },
    []
  );

  const createCoupon = useCallback(
    async (request: CreateCouponRequest): Promise<CouponResponse | null> => {
      try {
        const response = await apiRequest<ApiResponse<CouponResponse>>({
          method: 'POST',
          url: '/api/admin/coupons',
          data: request,
        });
        return response.data;
      } catch (error) {
        console.error('Create coupon error:', error);
        return null;
      }
    },
    []
  );

  const updateCoupon = useCallback(
    async (id: string, request: UpdateCouponRequest): Promise<CouponResponse | null> => {
      try {
        const response = await apiRequest<ApiResponse<CouponResponse>>({
          method: 'PUT',
          url: `/api/admin/coupons/${id}`,
          data: request,
        });
        return response.data;
      } catch (error) {
        console.error('Update coupon error:', error);
        return null;
      }
    },
    []
  );

  const deleteCoupon = useCallback(
    async (id: string): Promise<{ success: boolean; message?: string } | null> => {
      try {
        const response = await apiRequest<ApiResponse<{ success: boolean; message?: string }>>({
          method: 'DELETE',
          url: `/api/admin/coupons/${id}`,
        });
        return response.data;
      } catch (error) {
        console.error('Delete coupon error:', error);
        return null;
      }
    },
    []
  );

  const getCouponById = useCallback(
    async (id: string): Promise<CouponResponse | null> => {
      try {
        const response = await apiRequest<ApiResponse<CouponResponse>>({
          method: 'GET',
          url: `/api/admin/coupons/${id}`,
        });
        return response.data;
      } catch (error) {
        console.error('Get coupon by id error:', error);
        return null;
      }
    },
    []
  );

  return {
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    getCouponById,
  };
}

export function useAdminSettingsApi() {
  const getSettings = useCallback(
    async (): Promise<PlatformSettingsResponse | null> => {
      try {
        const response = await apiRequest<ApiResponse<PlatformSettingsResponse>>({
          method: 'GET',
          url: '/api/admin/settings',
        });
        return response.data;
      } catch (error) {
        console.error('Get settings error:', error);
        return null;
      }
    },
    []
  );

  const updateSetting = useCallback(
    async (key: string, value: string): Promise<{ success: boolean; setting?: PlatformSetting; message?: string } | null> => {
      try {
        const response = await apiRequest<ApiResponse<{ success: boolean; setting?: PlatformSetting; message?: string }>>({
          method: 'PUT',
          url: `/api/admin/settings/${key}`,
          data: { value },
        });
        return response.data;
      } catch (error) {
        console.error('Update setting error:', error);
        return null;
      }
    },
    []
  );

  const getSetting = useCallback(
    async (key: string): Promise<{ success: boolean; setting?: PlatformSetting; message?: string } | null> => {
      try {
        const response = await apiRequest<ApiResponse<{ success: boolean; setting?: PlatformSetting; message?: string }>>({
          method: 'GET',
          url: `/api/admin/settings/${key}`,
        });
        return response.data;
      } catch (error) {
        console.error('Get setting error:', error);
        return null;
      }
    },
    []
  );

  const createSetting = useCallback(
    async (setting: Omit<PlatformSetting, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>): Promise<{ success: boolean; setting?: PlatformSetting; message?: string } | null> => {
      try {
        const response = await apiRequest<ApiResponse<{ success: boolean; setting?: PlatformSetting; message?: string }>>({
          method: 'POST',
          url: '/api/admin/settings',
          data: setting,
        });
        return response.data;
      } catch (error) {
        console.error('Create setting error:', error);
        return null;
      }
    },
    []
  );

  return {
    getSettings,
    updateSetting,
    getSetting,
    createSetting,
  };
}

export function useAdminApi() {
  const getPlatformSettings = useCallback(
    async () => {
      try {
        const response = await apiRequest<ApiResponse<PlatformSettingsResponse>>({
          method: 'GET',
          url: '/api/admin/settings',
        });
        return response.data;
      } catch (error) {
        console.error('Get platform settings error:', error);
        return null;
      }
    },
    []
  );

  const updatePlatformSetting = useCallback(
    async (key: string, value: string) => {
      try {
        const response = await apiRequest<ApiResponse<{ success: boolean; setting: PlatformSetting; message?: string }>>({
          method: 'POST',
          url: '/api/admin/settings',
          data: { key, value },
        });
        return response.data;
      } catch (error) {
        console.error('Update platform setting error:', error);
        return null;
      }
    },
    []
  );

  const createCoupon = useCallback(
    async (request: CreateCouponRequest) => {
      try {
        const response = await apiRequest<ApiResponse<CouponResponse>>({
          method: 'POST',
          url: '/api/admin/coupons',
          data: request,
        });
        return response.data;
      } catch (error) {
        console.error('Create coupon error:', error);
        return null;
      }
    },
    []
  );

  const getCoupons = useCallback(
    async () => {
      try {
        const response = await apiRequest<ApiResponse<CouponListResponse>>({
          method: 'GET',
          url: '/api/admin/coupons',
        });
        return response.data;
      } catch (error) {
        console.error('Get coupons error:', error);
        return null;
      }
    },
    []
  );

  const updateCoupon = useCallback(
    async (id: string, request: UpdateCouponRequest) => {
      try {
        const response = await apiRequest<ApiResponse<CouponResponse>>({
          method: 'PUT',
          url: `/api/admin/coupons/${id}`,
          data: request,
        });
        return response.data;
      } catch (error) {
        console.error('Update coupon error:', error);
        return null;
      }
    },
    []
  );

  const deleteCoupon = useCallback(
    async (id: string) => {
      try {
        const response = await apiRequest<ApiResponse<{ success: boolean; message: string }>>({
          method: 'DELETE',
          url: `/api/admin/coupons/${id}`,
        });
        return response.data;
      } catch (error) {
        console.error('Delete coupon error:', error);
        return null;
      }
    },
    []
  );

  const approvePayment = useCallback(
    async (paymentId: string, reason?: string) => {
      try {
        const response = await apiRequest<ApiResponse<PaymentApprovalResponse>>({
          method: 'POST',
          url: `/api/payments/admin/${paymentId}/approve`,
          data: { reason: reason || '' },
        });
        return response.data;
      } catch (error) {
        console.error('Approve payment error:', error);
        return null;
      }
    },
    []
  );

  const rejectPayment = useCallback(
    async (paymentId: string, reason?: string) => {
      try {
        const response = await apiRequest<ApiResponse<PaymentApprovalResponse>>({
          method: 'POST',
          url: `/api/payments/admin/${paymentId}/reject`,
          data: { reason: reason || '' },
        });
        return response.data;
      } catch (error) {
        console.error('Reject payment error:', error);
        return null;
      }
    },
    []
  );

  const getAllPayments = useCallback(
    async (filters?: {
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      try {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());
        
        const response = await apiRequest<ApiResponse<PaymentListResponse>>({
          method: 'GET',
          url: `/api/payments/admin/all${params.toString() ? '?' + params.toString() : ''}`,
        });
        return response.data;
      } catch (error) {
        console.error('Get all payments error:', error);
        return null;
      }
    },
    []
  );

  return {
    getPlatformSettings,
    updatePlatformSetting,
    createCoupon,
    getCoupons,
    updateCoupon,
    deleteCoupon,
    approvePayment,
    rejectPayment,
    getAllPayments,
  };
}

export function useInstructorCouponApi() {
  const getInstructorCourses = useCallback(
    async () => {
      try {
        const response = await apiRequest<ApiResponse<{ success: boolean; data: InstructorCourse[] }>>({
          method: 'GET',
          url: '/api/instructor/courses',
        });
        return response.data;
      } catch (error) {
        console.error('Get instructor courses error:', error);
        return null;
      }
    },
    []
  );

  const getInstructorCoupons = useCallback(
    async () => {
      try {
        const response = await apiRequest<ApiResponse<{ success: boolean; data: InstructorCoupon[] }>>({
          method: 'GET',
          url: '/api/instructor/coupons',
        });
        return response.data;
      } catch (error) {
        console.error('Get instructor coupons error:', error);
        return null;
      }
    },
    []
  );

  const createInstructorCoupon = useCallback(
    async (request: CreateCouponFormData) => {
      try {
        const response = await apiRequest<ApiResponse<CouponResponse>>({
          method: 'POST',
          url: '/api/instructor/coupons',
          data: request,
        });
        return response.data;
      } catch (error) {
        console.error('Create instructor coupon error:', error);
        return null;
      }
    },
    []
  );

  const updateInstructorCoupon = useCallback(
    async (id: string, request: UpdateCouponRequest) => {
      try {
        const response = await apiRequest<ApiResponse<CouponResponse>>({
          method: 'PUT',
          url: `/api/instructor/coupons/${id}`,
          data: request,
        });
        return response.data;
      } catch (error) {
        console.error('Update instructor coupon error:', error);
        return null;
      }
    },
    []
  );

  const deleteInstructorCoupon = useCallback(
    async (id: string) => {
      try {
        const response = await apiRequest<ApiResponse<{ success: boolean; message: string }>>({
          method: 'DELETE',
          url: `/api/instructor/coupons/${id}`,
        });
        return response.data;
      } catch (error) {
        console.error('Delete instructor coupon error:', error);
        return null;
      }
    },
    []
  );

  return {
    getInstructorCourses,
    getInstructorCoupons,
    createInstructorCoupon,
    updateInstructorCoupon,
    deleteInstructorCoupon,
  };
}

export function useStudentCouponApi() {
  const getAvailableCoupons = useCallback(
    async () => {
      try {
        const response = await apiRequest<ApiResponse<AvailableCoupon[]>>({
          method: 'GET',
          url: '/api/coupons/available',
        });
        return response;
      } catch (error) {
        console.error('Get available coupons error:', error);
        return null;
      }
    },
    []
  );

  const getMyCoupons = useCallback(
    async () => {
      try {
        const response = await apiRequest<ApiResponse<CouponUsage[]>>({
          method: 'GET',
          url: '/api/coupons/my-coupons',
        });
        return response;
      } catch (error) {
        console.error('Get my coupons error:', error);
        return null;
      }
    },
    []
  );

  return {
    getAvailableCoupons,
    getMyCoupons,
  };
}

export function useInstructorPayoutApi() {
  const getBalance = useCallback(
    async () => {
      try {
        const response = await apiRequest<ApiResponse<{
          availableBalance: number;
          pendingBalance: number;
          totalEarnings: number;
          totalWithdrawn: number;
          nextPayoutDate?: string;
        }>>({
          method: 'GET',
          url: '/api/instructor/payout/balance',
        });
        return response.data;
      } catch (error) {
        console.error('Get instructor balance error:', error);
        return null;
      }
    },
    []
  );

  const requestPayout = useCallback(
    async (data: { amount: number; method: 'PIX' | 'BANK_TRANSFER' }) => {
      try {
        const response = await apiRequest<ApiResponse<{
          id: string;
          amount: number;
          method: string;
          status: string;
          requestedAt: string;
        }>>({
          method: 'POST',
          url: '/api/instructor/payout/request',
          data,
        });
        return response.data;
      } catch (error) {
        console.error('Request payout error:', error);
        return null;
      }
    },
    []
  );

  const getPayoutHistory = useCallback(
    async () => {
      try {
        const response = await apiRequest<ApiResponse<Array<{
          id: string;
          amount: number;
          method: string;
          status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
          requestedAt: string;
          processedAt?: string;
          estimatedProcessingTime?: string;
        }>>>({
          method: 'GET',
          url: '/api/instructor/payout/history',
        });
        return response.data;
      } catch (error) {
        console.error('Get payout history error:', error);
        return null;
      }
    },
    []
  );

  const getTransactionHistory = useCallback(
    async (params?: { page?: number; limit?: number }) => {
      try {
        const searchParams = new URLSearchParams();
        if (params?.page) searchParams.append('page', params.page.toString());
        if (params?.limit) searchParams.append('limit', params.limit.toString());
        
        const response = await apiRequest<ApiResponse<{
          transactions: Array<{
            id: string;
            type: 'CREDIT' | 'DEBIT';
            amount: number;
            description: string;
            createdAt: string;
            course?: { title: string };
          }>;
          pagination?: {
            page: number;
            limit: number;
            total: number;
          };
        }>>({
          method: 'GET',
          url: `/api/instructor/payout/transactions${searchParams.toString() ? '?' + searchParams.toString() : ''}`,
        });
        return response.data;
      } catch (error) {
        console.error('Get transaction history error:', error);
        return null;
      }
    },
    []
  );

  const updatePayoutData = useCallback(
    async (data: {
      pixKey?: string;
      bankData?: {
        bank: string;
        agency: string;
        account: string;
        accountType: 'CORRENTE' | 'POUPANCA';
        accountHolder: string;
      };
      payoutPreference: 'PIX' | 'BANK_TRANSFER';
      documentType: 'CPF' | 'CNPJ';
      documentNumber: string;
      fullName: string;
    }) => {
      try {
        const response = await apiRequest<ApiResponse<{
          success: boolean;
          message?: string;
        }>>({
          method: 'PUT',
          url: '/api/instructor/payout/data',
          data,
        });
        return response.data;
      } catch (error) {
        console.error('Update payout data error:', error);
        return null;
      }
    },
    []
  );

  return {
    getBalance,
    requestPayout,
    getPayoutHistory,
    getTransactionHistory,
    updatePayoutData,
  };
}

export const paymentUtils = {
  formatCurrency: (amount: number, currency: string = 'BRL'): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  formatDiscount: (type: 'PERCENTAGE' | 'FLAT_RATE', value: number): string => {
    return type === 'PERCENTAGE' ? `${value}%` : paymentUtils.formatCurrency(value);
  },

  calculateDiscountAmount: (
    originalAmount: number,
    discountType: 'PERCENTAGE' | 'FLAT_RATE',
    discountValue: number
  ): number => {
    if (discountType === 'PERCENTAGE') {
      return (originalAmount * discountValue) / 100;
    } else {
      return Math.min(discountValue, originalAmount);
    }
  },

  isRefundEligible: (paymentDate: string, refundWindowDays: number = 7): boolean => {
    const paymentDateTime = new Date(paymentDate);
    const now = new Date();
    const daysDifference = Math.floor(
      (now.getTime() - paymentDateTime.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDifference <= refundWindowDays;
  },

  getStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      PENDING: 'text-yellow-600',
      COMPLETED: 'text-green-600',
      FAILED: 'text-red-600',
      CANCELLED: 'text-gray-600',
      REFUNDED: 'text-blue-600',
      PROCESSED: 'text-green-600',
      APPROVED: 'text-green-600',
      REJECTED: 'text-red-600',
    };
    return colors[status] || 'text-gray-600';
  },

  getStatusText: (status: string): string => {
    const texts: Record<string, string> = {
      PENDING: 'Pendente',
      COMPLETED: 'Concluído',
      FAILED: 'Falhou',
      CANCELLED: 'Cancelado',
      REFUNDED: 'Reembolsado',
      PROCESSED: 'Processado',
      APPROVED: 'Aprovado',
      REJECTED: 'Rejeitado',
    };
    return texts[status] || status;
  },
};
