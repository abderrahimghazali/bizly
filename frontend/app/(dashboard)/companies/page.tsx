'use client';

import { RoleGuard } from '@/components/rbac/role-guard';
import { PermissionWrapper } from '@/components/rbac/permission-wrapper';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IconBuilding, IconPlus, IconEdit, IconTrash, IconEye } from '@tabler/icons-react';

// Mock company data
const mockCompanies = [
  { id: 1, name: 'Acme Corp', industry: 'Technology', status: 'active' },
  { id: 2, name: 'Global Industries', industry: 'Manufacturing', status: 'active' },
  { id: 3, name: 'StartupXYZ', industry: 'Software', status: 'pending' },
];

export default function CompaniesPage() {
  const permissions = usePermissions();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Companies</h2>
          <p className="text-muted-foreground">
            Manage your business partnerships and client companies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <PermissionWrapper 
            permission="create_company"
            fallback={
              <Button disabled className="bg-gray-100">
                <IconPlus className="mr-2 h-4 w-4" />
                Add Company (No Permission)
              </Button>
            }
          >
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Company
            </Button>
          </PermissionWrapper>
        </div>
      </div>

      {/* Permission-based content */}
      <RoleGuard
        permissions={['view_all_companies', 'view_assigned_companies', 'view_own_companies']}
        fallback={
          <Alert>
            <IconBuilding className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to view companies. Contact your administrator.
            </AlertDescription>
          </Alert>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockCompanies.map((company) => (
            <Card key={company.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <IconBuilding className="h-4 w-4" />
                    <span>{company.name}</span>
                  </div>
                </CardTitle>
                <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                  {company.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Industry: {company.industry}
                  </p>
                  
                  <div className="flex space-x-2">
                    {/* View button - available to all with company permissions */}
                    <Button size="sm" variant="outline">
                      <IconEye className="mr-2 h-3 w-3" />
                      View
                    </Button>

                    {/* Edit button - permission-based */}
                    <PermissionWrapper 
                      permission="edit_company"
                      fallback={
                        <Button size="sm" variant="outline" disabled>
                          <IconEdit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                      }
                    >
                      <Button size="sm" variant="outline">
                        <IconEdit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                    </PermissionWrapper>

                    {/* Delete button - role-based (Admin/Manager only) */}
                    <RoleGuard 
                      roles={['admin', 'manager']}
                      fallback={
                        <Button size="sm" variant="outline" disabled>
                          <IconTrash className="mr-2 h-3 w-3" />
                          Delete
                        </Button>
                      }
                    >
                      <Button size="sm" variant="destructive">
                        <IconTrash className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </RoleGuard>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


      </RoleGuard>
    </div>
  );
}