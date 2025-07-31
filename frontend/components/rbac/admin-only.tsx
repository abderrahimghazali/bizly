'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { ReactNode } from 'react';

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}