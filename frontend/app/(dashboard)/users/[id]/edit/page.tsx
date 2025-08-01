'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminOnly } from '@/components/rbac/admin-only';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import { 
  IconArrowLeft, 
  IconUser, 
  IconMail, 
  IconShield, 
  IconCalendar,
  IconAlertCircle,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { UserRoleBadge } from '@/components/rbac/user-role-badge';
import { usersApi, User } from '@/lib/api/users';
import { rolesApi, Role } from '@/lib/api/roles';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

interface EditUserFormData {
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'suspended';
}

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = parseInt(params.id as string);
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditUserFormData>({
    name: '',
    email: '',
    role: 'employee',
    status: 'pending'
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setRolesLoading(true);
        const response = await rolesApi.getAll();
        setRoles(response.roles);
      } catch (err) {
        console.error('Failed to fetch roles:', err);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await usersApi.getById(userId);
        
        setUser(response.user);
        setFormData({
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          status: response.user.status
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleInputChange = (field: keyof EditUserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      setSaving(true);
      
      await usersApi.update(user.id, formData);
      
      toast.success('User updated successfully');
      router.push('/users/list');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/users/list');
  };

  if (loading || rolesLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <Alert>
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'The requested user could not be found.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AdminOnly>
      <div className="flex-1 space-y-4 p-4 pt-6">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IconUser className="h-5 w-5" />
                    <span>User Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter full name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleInputChange('role', value)}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.name}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      {currentUser?.id === user?.id ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted">
                            <span className="text-sm text-muted-foreground">
                              {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            You cannot change your own status to prevent losing access.
                          </p>
                        </div>
                      ) : (
                        <Select
                          value={formData.status}
                          onValueChange={(value: 'active' | 'pending' | 'suspended') => 
                            handleInputChange('status', value)
                          }
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <IconX className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <IconCheck className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Details Sidebar */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <IconShield className="h-5 w-5" />
                    <span>User Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        User ID
                      </Label>
                      <p className="font-medium">{user.id}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Current Role
                      </Label>
                      <div className="mt-1">
                        <UserRoleBadge role={user.role} label={user.role_label} />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Account Status
                      </Label>
                      <div className="mt-1">
                        <Badge 
                          variant={
                            user.status === 'active' ? 'default' : 
                            user.status === 'suspended' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Member Since
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(user.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                        Last Updated
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <IconCalendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(user.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-2 block">
                      Permissions
                    </Label>
                    <div className="flex flex-wrap gap-1">
                      {user.permissions.slice(0, 6).map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                      {user.permissions.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{user.permissions.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AdminOnly>
  );
}