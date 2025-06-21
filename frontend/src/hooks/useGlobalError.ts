import { useContext } from 'react';
import { ErrorContext } from '@/contexts/ErrorContext';

export function useGlobalError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useGlobalError must be used within an ErrorProvider');
  }
  return context;
}
