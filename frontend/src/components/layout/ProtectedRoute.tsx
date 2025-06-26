import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?:
    | "ADMIN"
    | "INSTRUCTOR"
    | "STUDENT"
    | ("ADMIN" | "INSTRUCTOR" | "STUDENT")[];
}

export const ProtectedRoute = ({
  children,
  requiredRole,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(user?.role as any)) {
        return <Navigate to="/dashboard" replace />;
      }
    } else {
      if (user?.role !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
};

