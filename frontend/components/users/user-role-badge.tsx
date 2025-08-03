'use client';

import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';

interface UserRoleBadgeProps {
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  role?: string;
  label?: string;
}

const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800 hover:bg-red-200',
  manager: 'bg-blue-100 text-blue-800 hover:bg-blue-200', 
  employee: 'bg-green-100 text-green-800 hover:bg-green-200',
  client: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
};

export function UserRoleBadge({ className, variant = 'outline', role, label }: UserRoleBadgeProps) {
  const { user } = useAuth();

  // Use provided props or fall back to current user
  const displayRole = role || user?.role;
  const displayLabel = label || user?.role_label;

  if (!displayRole || !displayLabel) return null;

  const colorClass = ROLE_COLORS[displayRole as keyof typeof ROLE_COLORS];

  return (
    <Badge 
      variant={variant}
      className={cn(
        variant === 'outline' && colorClass,
        className
      )}
    >
      {displayLabel}
    </Badge>
  );
}