'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { ReactNode } from 'react';

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin, user, isLoading, isHydrated } = useAuth();

  // Wait for authentication to be fully loaded
  if (!isHydrated || isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}