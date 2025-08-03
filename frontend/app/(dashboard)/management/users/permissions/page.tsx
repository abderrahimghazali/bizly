'use client';

import { useState, useEffect } from 'react';
import { AdminOnly } from '@/components/rbac/admin-only';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { IconShield, IconAlertCircle, IconCheck, IconDeviceFloppy } from '@tabler/icons-react';
import { toast } from 'sonner';
import { rolesApi, Permission, PermissionsMatrix } from '@/lib/api/roles';

export default function PermissionsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionsData, setPermissionsData] = useState<PermissionsMatrix | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<number, number[]>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await rolesApi.getPermissionsMatrix();
        setPermissionsData(response);
        setRolePermissions(response.matrix);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePermissionChange = (roleId: number, permissionId: number, checked: boolean) => {
    // Don't allow changes to admin role permissions
    const role = permissionsData?.roles.find(r => r.id === roleId);
    if (role?.name === 'admin') {
      return;
    }

    setRolePermissions(prev => ({
      ...prev,
      [roleId]: checked 
        ? [...(prev[roleId] || []), permissionId]
        : (prev[roleId] || []).filter(id => id !== permissionId)
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (!permissionsData) return;
      
      // Update permissions for each role (exclude admin role)
      const updatePromises = permissionsData.roles
        .filter(role => role.name !== 'admin') // Don't update admin permissions
        .map(role => 
          rolesApi.updatePermissions(role.id, rolePermissions[role.id] || [])
        );
      
      await Promise.all(updatePromises);
      toast.success('Permissions updated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <AdminOnly
        fallback={
          <Alert>
            <IconShield className="h-4 w-4" />
            <AlertDescription>
              You don&apos;t have permission to access this page. Admin access required.
            </AlertDescription>
          </Alert>
        }
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <IconShield className="h-5 w-5" />
              <span>Role Permissions Matrix</span>
            </CardTitle>
            <Button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error loading permissions: {error}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-48 font-semibold">Permission</TableHead>
                    {permissionsData?.roles.map((role) => (
                      <TableHead 
                        key={role.id} 
                        className="text-center min-w-32 font-semibold"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <IconShield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{role.label}</span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissionsData?.permissions.map((permission) => (
                    <TableRow key={permission.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <IconShield className="h-4 w-4 text-muted-foreground" />
                          <span>{permission.label}</span>
                        </div>
                      </TableCell>
                      {permissionsData?.roles.map((role) => {
                        const isAdmin = role.name === 'admin';
                        const isChecked = isAdmin ? true : (rolePermissions[role.id] || []).includes(permission.id);
                        
                        return (
                          <TableCell key={role.id} className="text-center">
                            <Checkbox
                              checked={isChecked}
                              disabled={isAdmin}
                              onCheckedChange={(checked) => 
                                handlePermissionChange(role.id, permission.id, !!checked)
                              }
                              aria-label={`${role.label} - ${permission.label}`}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  )) || []}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-start space-x-2">
                <IconCheck className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">How to use this matrix:</p>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    <li>• Each row represents a role in your system</li>
                    <li>• Each column represents a specific permission</li>
                    <li>• Check the boxes to grant permissions to roles</li>
                    <li>• Administrator role has all permissions automatically (cannot be changed)</li>
                    <li>• Click &quot;Save Changes&quot; to apply your updates</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </AdminOnly>
    </div>
  );
}