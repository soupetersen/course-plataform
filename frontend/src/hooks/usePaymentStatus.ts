import { useState, useEffect, useCallback, useRef } from 'react';

interface PaymentStatus {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  amount: number;
  currency: string;
  paymentType: string;
  createdAt: string;
}

interface UsePaymentStatusResult {
  payment: PaymentStatus | null;
  loading: boolean;
  error: string | null;
  isPolling: boolean;
  refetch: () => void;
  startPolling: (
    paymentId: string, 
    onComplete?: (status: PaymentStatus) => void,
    onNotFound?: () => void
  ) => void;
  stopPolling: () => void;
}

export const usePaymentStatus = (paymentId: string | null): UsePaymentStatusResult => {
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef<((status: PaymentStatus) => void) | undefined>(undefined);
  const onNotFoundRef = useRef<(() => void) | undefined>(undefined);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
    onCompleteRef.current = undefined;
    onNotFoundRef.current = undefined;
  }, []);

  const fetchPaymentStatus = useCallback(async (id?: string) => {
    const targetId = id || paymentId;
    if (!targetId) return;

    setLoading(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/payments/${targetId}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const paymentData = data.data;
        setPayment(paymentData);
        
        if (['COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(paymentData.status)) {
          stopPolling();
          if (onCompleteRef.current) {
            onCompleteRef.current(paymentData);
          }
        }
      } else {
        const errorMessage = data.error || 'Erro ao verificar status do pagamento';
        setError(errorMessage);
        
        if (errorMessage.includes('Pagamento não encontrado') || errorMessage.includes('Payment not found')) {
          console.log('Pagamento não encontrado, parando polling...');
          stopPolling();
          if (onNotFoundRef.current) {
            onNotFoundRef.current();
          }
          if (onCompleteRef.current) {
            onCompleteRef.current({ 
              id: targetId, 
              status: 'FAILED', 
              amount: 0, 
              currency: 'BRL', 
              paymentType: 'unknown',
              createdAt: new Date().toISOString()
            });
          }
        }
      }
    } catch (err) {
      const errorMessage = 'Erro de conexão ao verificar pagamento';
      setError(errorMessage);
      console.error('Payment status error:', err);
    } finally {
      setLoading(false);
    }
  }, [paymentId, stopPolling]);

  const startPolling = useCallback((
    id: string, 
    onComplete?: (status: PaymentStatus) => void,
    onNotFound?: () => void
  ) => {
    stopPolling();
    
    setIsPolling(true);
    onCompleteRef.current = onComplete;
    onNotFoundRef.current = onNotFound;
    
    fetchPaymentStatus(id);
    
    intervalRef.current = setInterval(() => {
      fetchPaymentStatus(id);
    }, 3000);
  }, [fetchPaymentStatus, stopPolling]);

  const refetch = useCallback(async () => {
    await fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  useEffect(() => {
    if (paymentId && !isPolling) {
      fetchPaymentStatus();
    }
  }, [paymentId, fetchPaymentStatus, isPolling]);

  return {
    payment,
    loading,
    error,
    isPolling,
    refetch,
    startPolling,
    stopPolling,
  };
};

