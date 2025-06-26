import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface PurchaseProtectedRouteProps {
  children: ReactNode;
}

export function PurchaseProtectedRoute({
  children,
}: PurchaseProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login?redirect=purchase" replace />;
  }

  return <>{children}</>;
}

