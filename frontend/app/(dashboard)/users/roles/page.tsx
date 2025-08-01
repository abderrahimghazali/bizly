'use client';

import { useState, useEffect } from 'react';
import { AdminOnly } from '@/components/rbac/admin-only';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  IconShield, 
  IconAlertCircle, 
  IconPlus, 
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconUsers,
  IconUserCog,
  IconX
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { rolesApi, Role } from '@/lib/api/roles';

export default function RolesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    description: ''
  });

  // Auto-generate machine name from display label
  const generateRoleName = (label: string): string => {
    return label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric characters except spaces
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await rolesApi.getAll();
        setRoles(response.roles);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.label.trim()) {
      toast.error('Role label is required');
      return;
    }

    try {
      setSaving(true);
      
      if (editingRole) {
        // Update existing role
        const response = await rolesApi.update(editingRole.id, {
          label: formData.label.trim(),
          description: formData.description.trim() || undefined
        });
        
        setRoles(prev => prev.map(role => 
          role.id === editingRole.id ? response.role : role
        ));
        toast.success(response.message);
      } else {
        // Create new role
        const response = await rolesApi.create({
          label: formData.label.trim(),
          description: formData.description.trim() || undefined
        });
        
        setRoles(prev => [...prev, response.role]);
        toast.success(response.message);
      }
      
      // Reset form
      setFormData({ label: '', description: '' });
      setEditingRole(null);
      
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors?.label) {
        toast.error(err.response.data.errors.label[0]);
      } else {
        toast.error(err.response?.data?.message || `Failed to ${editingRole ? 'update' : 'create'} role`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setFormData({
      label: role.label,
      description: role.description || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    setFormData({ label: '', description: '' });
  };

  const handleDeleteRole = async (role: Role) => {
    try {
      const response = await rolesApi.delete(role.id);
      setRoles(prev => prev.filter(r => r.id !== role.id));
      
      // If we were editing this role, cancel the edit
      if (editingRole?.id === role.id) {
        handleCancelEdit();
      }
      
      toast.success(response.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete role');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
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
              You don't have permission to access this page. Admin access required.
            </AlertDescription>
          </Alert>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Create/Edit Role Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {editingRole ? <IconEdit className="h-5 w-5" /> : <IconPlus className="h-5 w-5" />}
                  <span>{editingRole ? 'Edit Role' : 'Create New Role'}</span>
                </div>
                {editingRole && (
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    <IconX className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roleLabel">Role Name*</Label>
                  <Input
                    id="roleLabel"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Project Manager"
                    disabled={saving}
                  />
                  {formData.label.trim() && !editingRole && (
                    <p className="text-xs text-muted-foreground">
                      Machine name: <code className="bg-muted px-1 rounded">{generateRoleName(formData.label)}</code>
                    </p>
                  )}
                  {editingRole && (
                    <p className="text-xs text-muted-foreground">
                      Machine name: <code className="bg-muted px-1 rounded">{editingRole.name}</code> (cannot be changed)
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="roleDescription">Description</Label>
                  <Input
                    id="roleDescription"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this role"
                    disabled={saving}
                  />
                </div>
                
                <div className="flex space-x-2">
                  {editingRole && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    disabled={saving || !formData.label.trim()}
                    className={editingRole ? "flex-1" : "w-full"}
                  >
                    {saving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        {editingRole ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        {editingRole ? <IconEdit className="mr-2 h-4 w-4" /> : <IconPlus className="mr-2 h-4 w-4" />}
                        {editingRole ? 'Update Role' : 'Create Role'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Existing Roles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconUserCog className="h-5 w-5" />
                <span>Existing Roles</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert className="mb-4">
                  <IconAlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Error loading roles: {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                {roles.map((role) => (
                  <div 
                    key={role.id}
                    className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
                      editingRole?.id === role.id ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{role.label}</h4>
                        {role.isSystemRole && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {role.description || 'No description provided'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <IconUsers className="h-3 w-3" />
                          <span>{role.userCount} users</span>
                        </span>
                        <span>Role: {role.name}</span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          disabled={role.isSystemRole}
                          onClick={() => handleEditRole(role)}
                        >
                          <IconEdit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          disabled={role.isSystemRole || role.userCount > 0}
                          onClick={() => handleDeleteRole(role)}
                        >
                          <IconTrash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
              
              {roles.length === 0 && !error && (
                <div className="text-center py-8 text-muted-foreground">
                  <IconUserCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No roles found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminOnly>
    </div>
  );
}