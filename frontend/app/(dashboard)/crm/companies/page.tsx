'use client';

import { useState, useEffect } from 'react';
import { PermissionWrapper } from '@/components/rbac/permission-wrapper';
import { CompaniesDataTable, Company } from '@/components/table';
import { companiesApi } from '@/lib/api/companies';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose 
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconBuilding, IconPlus } from '@tabler/icons-react';
import { toast } from 'sonner';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    status: 'active' as 'active' | 'inactive' | 'prospect',
    email: '',
    phone: '',
    website: '',
    address: '',
    contact_person: ''
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
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await companiesApi.create(formData);
      
      if (response.company) {
        // Add the new company to the list
        setCompanies(prev => [response.company, ...prev]);
        
        // Reset form
        setFormData({
          name: '',
          industry: '',
          status: 'active',
          email: '',
          phone: '',
          website: '',
          address: '',
          contact_person: ''
        });
        
        setIsCreateOpen(false);
        toast.success(response.message || 'Company created successfully!');
      }
    } catch (error: unknown) {
      console.error('Failed to create company:', error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create company');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-end">
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
            <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <SheetTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <IconPlus className="h-4 w-4" />
                  <span>Add Company</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader className="px-6 py-6">
                  <SheetTitle>Add New Company</SheetTitle>
                  <SheetDescription>
                    Create a new company profile to manage business relationships.
                  </SheetDescription>
                </SheetHeader>
                
                <form onSubmit={handleFormSubmit} className="px-6 pb-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter company name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="e.g., Technology, Manufacturing"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value: 'active' | 'inactive' | 'prospect') => setFormData({ ...formData, status: value })}>
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
                        value={formData.contact_person}
                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                        placeholder="Primary contact name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="company@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://company.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Company address..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? 'Creating...' : 'Create Company'}
                    </Button>
                    <SheetClose asChild>
                      <Button variant="outline" className="flex-1">Cancel</Button>
                    </SheetClose>
                  </div>
                </form>
              </SheetContent>
            </Sheet>
          </PermissionWrapper>
        </div>
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
            data={companies} 
            onDataChange={setCompanies} 
          />
        )}
      </PermissionWrapper>
    </div>
  );
}