import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-ink/45">Carregando...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}
