'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface RoleSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  allowedRoles?: string[];
}

const ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'employee', label: 'Employee' },
  { value: 'client', label: 'Client' },
];

export function RoleSelector({ 
  value, 
  onValueChange, 
  disabled = false,
  allowedRoles 
}: RoleSelectorProps) {
  const availableRoles = allowedRoles 
    ? ROLES.filter(role => allowedRoles.includes(role.value))
    : ROLES;

  return (
    <div className="space-y-2">
      <Label htmlFor="role">Role</Label>
      <Select 
        value={value} 
        onValueChange={onValueChange} 
        disabled={disabled}
      >
        <SelectTrigger id="role">
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          {availableRoles.map((role) => (
            <SelectItem key={role.value} value={role.value}>
              {role.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}