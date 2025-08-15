'use client';

import { useState, useEffect } from 'react';
import { PermissionWrapper } from '@/components/rbac/permission-wrapper';
import { CompaniesDataTable } from '@/components/table';
import { companiesApi, Company, CreateCompanyData } from '@/lib/api/companies';
import { Button } from '@/components/ui/button';
import { FormSheet } from '@/components/ui/business-sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconBuilding, IconPlus } from '@tabler/icons-react';
import { useBusinessForm, validators, combineValidations } from '@/lib/hooks/useBusinessForm';
import { useDataTable } from '@/lib/hooks/useDataTable';

const initialFormData: CreateCompanyData = {
  name: '',
  industry: '',
  status: 'active',
  email: '',
  phone: '',
  website: '',
  address: '',
  contact_person: ''
};

// Form validation
const validateCompanyForm = (data: CreateCompanyData): string | null => {
  return combineValidations(data, [
    (data) => validators.required(data.name, 'Company name'),
    (data) => validators.required(data.industry, 'Industry'),
    (data) => data.email ? validators.email(data.email) : null,
    (data) => validators.minLength(data.name || '', 2, 'Company name'),
    (data) => validators.maxLength(data.name || '', 100, 'Company name'),
  ]);
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Data table hook
  const dataTable = useDataTable({
    initialData: companies,
    config: {
      entityName: 'companies',
      entityNameSingular: 'company',
      filterColumn: 'name',
      searchPlaceholder: 'Search companies...'
    },
    actions: {
      onDelete: async (company: Company) => {
        await companiesApi.delete(company.id);
      }
    },
    onDataChange: setCompanies
  });

  // Form hook
  const form = useBusinessForm<Company, CreateCompanyData>({
    initialData: initialFormData,
    onSubmit: async (data) => {
      const response = await companiesApi.create(data);
      return {
        success: true,
        data: response.company,
        message: response.message
      };
    },
    onSuccess: (newCompany) => {
      dataTable.updateData([newCompany, ...companies]);
      setIsCreateOpen(false);
    },
    validateForm: validateCompanyForm,
    resetOnSuccess: true
  });

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getAll();
      setCompanies(response.data);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = () => {
    form.resetForm();
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage your business relationships and company profiles
          </p>
        </div>
        
        <PermissionWrapper 
          permission="create_company"
          fallback={
            <Button disabled className="bg-gray-100">
              <IconPlus className="mr-2 h-4 w-4" />
              Add Company (No Permission)
            </Button>
          }
        >
          <Button onClick={handleCreateCompany}>
            <IconPlus className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        </PermissionWrapper>
      </div>

      {/* Permission-based content */}
      <PermissionWrapper
        permission="view_companies"
        fallback={
          <div className="flex items-center justify-center h-32 border rounded-lg">
            <div className="text-center">
              <IconBuilding className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                You don&apos;t have permission to view companies. Contact your administrator.
              </p>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center h-32 border rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading companies...</p>
            </div>
          </div>
        ) : (
          <CompaniesDataTable 
            data={dataTable.filteredData} 
            onDataChange={dataTable.updateData} 
          />
        )}
      </PermissionWrapper>

      {/* Create Company Form Sheet */}
      <FormSheet
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) form.resetForm();
        }}
        title="Add New Company"
        description="Create a new company profile to manage business relationships."
        size="wide"
        onSubmit={form.handleSubmit}
        submitLabel="Create Company"
        isSubmitting={form.isSubmitting}
        submitDisabled={form.hasErrors}
      >
        <div className="space-y-4">
          {/* Validation Error Display */}
          {form.validationError && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {form.validationError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={form.formData.name || ''}
              onChange={(e) => form.updateField('name', e.target.value)}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry *</Label>
            <Input
              id="industry"
              value={form.formData.industry || ''}
              onChange={(e) => form.updateField('industry', e.target.value)}
              placeholder="e.g., Technology, Manufacturing"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={form.formData.status} 
              onValueChange={(value: 'active' | 'inactive' | 'prospect') => 
                form.updateField('status', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              value={form.formData.contact_person || ''}
              onChange={(e) => form.updateField('contact_person', e.target.value)}
              placeholder="Primary contact name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.formData.email || ''}
              onChange={(e) => form.updateField('email', e.target.value)}
              placeholder="company@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={form.formData.phone || ''}
              onChange={(e) => form.updateField('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={form.formData.website || ''}
              onChange={(e) => form.updateField('website', e.target.value)}
              placeholder="https://company.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={form.formData.address || ''}
              onChange={(e) => form.updateField('address', e.target.value)}
              placeholder="Company address..."
              rows={3}
            />
          </div>
        </div>
      </FormSheet>
    </div>
  );
}