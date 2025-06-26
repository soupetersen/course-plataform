import { useState, useCallback } from 'react';

interface OrderSummary {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  platformFee: number;
  instructorAmount: number;
  stripeFeeEstimate: number;
  totalWithFees: number; 
  coupon: {
    code: string;
    discountType: string;
    discountValue: number;
    applied: boolean;
  } | null;
}

interface UseOrderSummaryResult {
  summary: OrderSummary | null;
  loading: boolean;
  error: string | null;
  calculateSummary: (courseId: string, coursePrice: number, couponCode?: string) => Promise<void>;
}

export const useOrderSummary = (): UseOrderSummaryResult => {
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateSummary = useCallback(async (
    courseId: string, 
    coursePrice: number, // Manter para compatibilidade, mas não enviar
    couponCode?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/payments/calculate-order-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          courseId,
          couponCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSummary(data.data);
      } else {
        setError(data.error || 'Erro ao calcular resumo do pedido');
      }
    } catch (err) {
      setError('Erro de conexão ao calcular pedido');
      console.error('Order summary error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    summary,
    loading,
    error,
    calculateSummary,
  };
};

