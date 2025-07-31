'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { ReactNode } from 'react';

interface RoleGuardProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles/permissions, if false, user needs ANY
}

export function RoleGuard({ 
  children, 
  roles = [], 
  permissions = [], 
  fallback = null,
  requireAll = false 
}: RoleGuardProps) {
  const { user, hasAnyRole, hasPermission } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  // Check roles
  if (roles.length > 0) {
    const roleCheck = requireAll 
      ? roles.every(role => user.role === role)
      : hasAnyRole(roles);
      
    if (!roleCheck) {
      return <>{fallback}</>;
    }
  }

  // Check permissions
  if (permissions.length > 0) {
    const permissionCheck = requireAll
      ? permissions.every(permission => hasPermission(permission))
      : permissions.some(permission => hasPermission(permission));
      
    if (!permissionCheck) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}