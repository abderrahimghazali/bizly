'use client';

import { useState, useEffect } from 'react';
import { PermissionWrapper } from '@/components/rbac/permission-wrapper';
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
import { Checkbox } from '@/components/ui/checkbox';
import { IconUser, IconPlus } from '@tabler/icons-react';
import { toast } from 'sonner';
import { contactsApi, Contact, CreateContactData } from '@/lib/api/contacts';
import { companiesApi, CompanyOption } from '@/lib/api/companies';
import { ContactsDataTable } from '@/components/table';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateContactData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    position: '',
    department: '',
    company_id: 0,
    is_primary: false,
    notes: ''
  });

  // Fetch contacts and companies on component mount
  useEffect(() => {
    fetchContacts();
    fetchCompanies();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsApi.getAll();
      setContacts(response.data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companiesApi.getOptions();
      setCompanies(response);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load companies');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await contactsApi.create(formData);
      
      if (response.contact) {
        // Add the new contact to the list
        setContacts(prev => [response.contact, ...prev]);
        
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          mobile: '',
          position: '',
          department: '',
          company_id: 0,
          is_primary: false,
          notes: ''
        });
        
        setIsCreateOpen(false);
        toast.success(response.message || 'Contact created successfully!');
      }
    } catch (error: unknown) {
      console.error('Failed to create contact:', error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create contact');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your business contacts and relationships
          </p>
        </div>
        
        <PermissionWrapper 
          permission="create_contact"
          fallback={
            <Button disabled className="bg-gray-100">
              <IconPlus className="mr-2 h-4 w-4" />
              Add Contact (No Permission)
            </Button>
          }
        >
          <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <SheetTrigger asChild>
              <Button className="flex items-center space-x-2">
                <IconPlus className="h-4 w-4" />
                <span>Add Contact</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
              <SheetHeader className="px-6 py-6">
                <SheetTitle>Add New Contact</SheetTitle>
                <SheetDescription>
                  Create a new contact profile to manage business relationships.
                </SheetDescription>
              </SheetHeader>
              
              <form onSubmit={handleFormSubmit} className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="Enter first name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company_id">Company *</Label>
                    <Select 
                      value={formData.company_id.toString()} 
                      onValueChange={(value) => setFormData({ ...formData, company_id: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id.toString()}>
                            {company.name} {company.industry && `(${company.industry})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="Job title or position"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Department or division"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@example.com"
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                      id="mobile"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="+1 (555) 987-6543"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_primary"
                      checked={formData.is_primary}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_primary: !!checked })}
                    />
                    <Label htmlFor="is_primary" className="text-sm">
                      Set as primary contact for this company
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about this contact..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Creating...' : 'Create Contact'}
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

      {/* Permission-based content */}
      <PermissionWrapper
        permission="view_contacts"
        fallback={
          <div className="flex items-center justify-center h-32 border rounded-lg">
            <div className="text-center">
              <IconUser className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                You don&apos;t have permission to view contacts. Contact your administrator.
              </p>
            </div>
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center h-32 border rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading contacts...</p>
            </div>
          </div>
        ) : (
          <ContactsDataTable 
            data={contacts}
            onDataChange={setContacts}
            companies={companies}
          />
        )}
      </PermissionWrapper>
    </div>
  );
}