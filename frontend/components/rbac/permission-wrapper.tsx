'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { ReactNode } from 'react';

interface PermissionWrapperProps {
  children: ReactNode;
  permission: string;
  fallback?: ReactNode;
}

export function PermissionWrapper({ children, permission, fallback = null }: PermissionWrapperProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}