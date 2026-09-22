import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@ta/shared';
import { useAuth } from './AuthContext';

export function RoleRoute({ roles }: { roles: UserRole[] }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
