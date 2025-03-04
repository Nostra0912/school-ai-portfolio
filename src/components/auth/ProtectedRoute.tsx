import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Temporarily bypass all auth checks
  return <>{children}</>;
}
