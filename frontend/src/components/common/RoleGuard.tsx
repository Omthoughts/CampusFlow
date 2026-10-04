import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../lib/auth';

interface RoleGuardProps {
  allowedRoles: ('ADMIN' | 'FACULTY' | 'STUDENT')[];
  fallbackPath?: string;
  children?: ReactNode;
}

export default function RoleGuard({ 
  allowedRoles, 
  fallbackPath = '/dashboard', 
  children 
}: RoleGuardProps) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!allowedRoles.includes(user.role as any)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
