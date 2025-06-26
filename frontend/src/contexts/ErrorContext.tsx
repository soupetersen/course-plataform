import React, { createContext, ReactNode } from "react";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface ErrorContextType {
  handleError: (
    error: Error | string | unknown,
    options?: { title?: string; description?: string; duration?: number }
  ) => void;
  handleSuccess: (message: string, title?: string) => void;
  handleWarning: (message: string, title?: string) => void;
  handleInfo: (message: string, title?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export { ErrorContext };

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const errorHandler = useErrorHandler();

  return (
    <ErrorContext.Provider value={errorHandler}>
      {children}
    </ErrorContext.Provider>
  );
}

