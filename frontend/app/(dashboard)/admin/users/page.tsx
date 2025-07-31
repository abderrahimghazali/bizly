'use client';

import { AdminOnly } from '@/components/rbac/admin-only';
import { RoleGuard } from '@/components/rbac/role-guard';
import { PermissionWrapper } from '@/components/rbac/permission-wrapper';
import { UserRoleBadge } from '@/components/rbac/user-role-badge';
import { RoleSelector } from '@/components/rbac/role-selector';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IconShield, IconUserPlus, IconSettings } from '@tabler/icons-react';

export default function AdminUsersPage() {
  const permissions = usePermissions();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <div className="flex items-center space-x-2">
          <UserRoleBadge />
        </div>
      </div>

      {/* Admin-only section */}
      <AdminOnly
        fallback={
          <Alert>
            <IconShield className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page. Admin access required.
            </AlertDescription>
          </Alert>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <IconUserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <IconShield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                No change
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Managers</CardTitle>
              <IconSettings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <IconUserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Permissions Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Current Permissions:</h4>
              <div className="flex flex-wrap gap-2">
                {permissions.user?.permissions.map((permission) => (
                  <Badge key={permission} variant="outline">
                    {permission.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Role-based Actions:</h4>
              <div className="flex flex-wrap gap-2">
                <PermissionWrapper 
                  permission="manage_users"
                  fallback={<Button disabled>Manage Users (No Permission)</Button>}
                >
                  <Button>Manage Users</Button>
                </PermissionWrapper>

                <PermissionWrapper 
                  permission="assign_roles"
                  fallback={<Button disabled>Assign Roles (No Permission)</Button>}
                >
                  <Button>Assign Roles</Button>
                </PermissionWrapper>

                <RoleGuard 
                  roles={['admin', 'manager']}
                  fallback={<Button disabled>Team Settings (Manager+ Only)</Button>}
                >
                  <Button>Team Settings</Button>
                </RoleGuard>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Role Assignment Demo:</h4>
              <RoleSelector
                value="employee"
                onValueChange={(value) => console.log('Role changed to:', value)}
                allowedRoles={['employee', 'manager']} // Only show roles this user can assign
              />
            </div>
          </CardContent>
        </Card>
      </AdminOnly>
    </div>
  );
}