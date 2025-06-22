import { useState, useEffect, useCallback } from 'react';

interface PaymentStatus {
  id: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  amount: number;
  currency: string;
  paymentType: string;
  createdAt: string;
}

interface UsePaymentStatusResult {
  payment: PaymentStatus | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePaymentStatus = (paymentId: string | null): UsePaymentStatusResult => {
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentStatus = useCallback(async () => {
    if (!paymentId) return;

    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/payments/${paymentId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setPayment(data.data);
      } else {
        setError(data.error || 'Erro ao verificar status do pagamento');
      }
    } catch (err) {
      setError('Erro de conexão ao verificar pagamento');
      console.error('Payment status error:', err);
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  return {
    payment,
    loading,
    error,
    refetch: fetchPaymentStatus,
  };
};
