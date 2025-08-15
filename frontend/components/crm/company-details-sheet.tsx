'use client';

import React, { useState, useCallback } from 'react';
import { Company, companiesApi, UpdateCompanyData, companyStatuses } from '@/lib/api/companies';
import { BusinessSheet } from '@/components/ui/business-sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  IconEdit, 
  IconPhone, 
  IconMail, 
  IconClock, 
  IconBuilding,
  IconCurrencyDollar,
  IconUser,
  IconDeviceFloppy,
  IconX,
  IconCalendar,
  IconUsers,
  IconGlobe,
  IconMapPin,
  IconId,
  IconBriefcase,
  IconTrendingUp
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface CompanyDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: number | null;
  onCompanyUpdate?: (company: Company) => void;
}

export function CompanyDetailsSheet({ open, onOpenChange, companyId, onCompanyUpdate }: CompanyDetailsSheetProps) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateCompanyData>({
    name: '',
    registration_number: '',
    vat_number: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
    country: '',
    status: 'active',
    revenue: 0,
    employees_count: 0,
    founded_date: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchCompanyDetails = useCallback(async () => {
    if (!companyId) return;
    
    try {
      setLoading(true);
      const companyData = await companiesApi.getById(companyId);
      setCompany(companyData);
      setEditData({
        name: companyData.name,
        registration_number: companyData.registration_number,
        vat_number: companyData.vat_number,
        industry: companyData.industry,
        website: companyData.website,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        city: companyData.city,
        postal_code: companyData.postal_code,
        country: companyData.country,
        status: companyData.status,
        revenue: companyData.revenue,
        employees_count: companyData.employees_count,
        founded_date: companyData.founded_date,
      });
    } catch (error) {
      console.error('Failed to fetch company details:', error);
      toast.error('Failed to load company details');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [companyId, onOpenChange]);

  React.useEffect(() => {
    if (open && companyId) {
      fetchCompanyDetails();
    }
  }, [open, companyId, fetchCompanyDetails]);

  const handleSave = async () => {
    if (!company) return;

    try {
      setSaving(true);
      const response = await companiesApi.update(company.id, editData);
      setCompany(response.company);
      setIsEditing(false);
      toast.success('Company updated successfully');
      onCompanyUpdate?.(response.company);
    } catch (error) {
      console.error('Failed to update company:', error);
      toast.error('Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (company) {
      setEditData({
        name: company.name,
        registration_number: company.registration_number,
        vat_number: company.vat_number,
        industry: company.industry,
        website: company.website,
        email: company.email,
        phone: company.phone,
        address: company.address,
        city: company.city,
        postal_code: company.postal_code,
        country: company.country,
        status: company.status,
        revenue: company.revenue,
        employees_count: company.employees_count,
        founded_date: company.founded_date,
      });
    }
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800 hover:bg-green-200",
      inactive: "bg-red-100 text-red-800 hover:bg-red-200",
      prospect: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!open) return null;

  return (
    <BusinessSheet 
      open={open} 
      onOpenChange={onOpenChange}
      title={loading ? 'Loading...' : !company ? 'Company Not Found' : company.name}
      description={loading ? 'Loading company details...' : !company ? 'The requested company could not be found' : 'Company Details & Information'}
      size="wide"
    >

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading company details...</p>
            </div>
          </div>
        ) : !company ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">Company not found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end space-x-2 pb-6">
                  {isEditing ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <IconX className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSave}
                        disabled={saving}
                      >
                        <IconDeviceFloppy className="mr-2 h-4 w-4" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <IconEdit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </>
                  )}
            </div>

            <div className="space-y-6">
              {/* Company Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconBuilding className="mr-2 h-5 w-5" />
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <Label htmlFor="edit-name">Company Name</Label>
                          <Input
                            id="edit-name"
                            value={editData.name || ''}
                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-registration">Registration Number</Label>
                            <Input
                              id="edit-registration"
                              value={editData.registration_number || ''}
                              onChange={(e) => setEditData({...editData, registration_number: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-vat">VAT Number</Label>
                            <Input
                              id="edit-vat"
                              value={editData.vat_number || ''}
                              onChange={(e) => setEditData({...editData, vat_number: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="edit-industry">Industry</Label>
                          <Input
                            id="edit-industry"
                            value={editData.industry || ''}
                            onChange={(e) => setEditData({...editData, industry: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-website">Website</Label>
                          <Input
                            id="edit-website"
                            type="url"
                            value={editData.website || ''}
                            onChange={(e) => setEditData({...editData, website: e.target.value})}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                          <p className="text-sm">{company.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Registration</label>
                            <p className="text-sm flex items-center">
                              <IconId className="mr-1 h-3 w-3" />
                              {company.registration_number || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">VAT Number</label>
                            <p className="text-sm flex items-center">
                              <IconId className="mr-1 h-3 w-3" />
                              {company.vat_number || 'Not specified'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Industry</label>
                          <p className="text-sm flex items-center">
                            <IconBriefcase className="mr-1 h-3 w-3" />
                            {company.industry || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Website</label>
                          <p className="text-sm flex items-center">
                            <IconGlobe className="mr-1 h-3 w-3" />
                            {company.website ? (
                              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {company.website}
                              </a>
                            ) : (
                              'Not specified'
                            )}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconUser className="mr-2 h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <Label htmlFor="edit-email">Email</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={editData.email || ''}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-phone">Phone</Label>
                          <Input
                            id="edit-phone"
                            value={editData.phone || ''}
                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-status">Status</Label>
                          <Select 
                            value={editData.status} 
                            onValueChange={(value) => setEditData({...editData, status: value as Company['status']})}
                          >
                            <SelectTrigger id="edit-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(companyStatuses).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm flex items-center">
                            <IconMail className="mr-1 h-3 w-3" />
                            {company.email || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="text-sm flex items-center">
                            <IconPhone className="mr-1 h-3 w-3" />
                            {company.phone || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <div className="mt-1">
                            <Badge className={`${getStatusColor(company.status)} flex items-center space-x-1 w-fit`}>
                              <span className="capitalize">{company.status_label || company.status}</span>
                            </Badge>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <IconMapPin className="mr-2 h-5 w-5" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="edit-address">Address</Label>
                        <Input
                          id="edit-address"
                          value={editData.address || ''}
                          onChange={(e) => setEditData({...editData, address: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="edit-city">City</Label>
                          <Input
                            id="edit-city"
                            value={editData.city || ''}
                            onChange={(e) => setEditData({...editData, city: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-postal-code">Postal Code</Label>
                          <Input
                            id="edit-postal-code"
                            value={editData.postal_code || ''}
                            onChange={(e) => setEditData({...editData, postal_code: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="edit-country">Country</Label>
                        <Input
                          id="edit-country"
                          value={editData.country || ''}
                          onChange={(e) => setEditData({...editData, country: e.target.value})}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="text-sm">{company.address || 'Not specified'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">City</label>
                          <p className="text-sm">{company.city || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Postal Code</label>
                          <p className="text-sm">{company.postal_code || 'Not specified'}</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Country</label>
                        <p className="text-sm">{company.country || 'Not specified'}</p>
                      </div>
                      {company.full_address && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Full Address</label>
                          <p className="text-sm">{company.full_address}</p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Business Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconTrendingUp className="mr-2 h-5 w-5" />
                      Business Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <Label htmlFor="edit-revenue">Annual Revenue ($)</Label>
                          <Input
                            id="edit-revenue"
                            type="number"
                            min="0"
                            value={editData.revenue || 0}
                            onChange={(e) => setEditData({...editData, revenue: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-employees">Number of Employees</Label>
                          <Input
                            id="edit-employees"
                            type="number"
                            min="0"
                            value={editData.employees_count || 0}
                            onChange={(e) => setEditData({...editData, employees_count: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-founded">Founded Date</Label>
                          <Input
                            id="edit-founded"
                            type="date"
                            value={editData.founded_date ? new Date(editData.founded_date).toISOString().split('T')[0] : ''}
                            onChange={(e) => setEditData({...editData, founded_date: e.target.value})}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Annual Revenue</label>
                          <p className="text-sm font-medium flex items-center">
                            <IconCurrencyDollar className="mr-1 h-3 w-3" />
                            {company.revenue ? formatCurrency(company.revenue) : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Number of Employees</label>
                          <p className="text-sm flex items-center">
                            <IconUsers className="mr-1 h-3 w-3" />
                            {company.employees_count || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Founded</label>
                          <p className="text-sm flex items-center">
                            <IconCalendar className="mr-1 h-3 w-3" />
                            {company.founded_date ? formatDate(company.founded_date) : 'Not specified'}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconClock className="mr-2 h-5 w-5" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Created</label>
                      <p className="text-sm flex items-center">
                        <IconCalendar className="mr-1 h-3 w-3" />
                        {formatDate(company.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-sm flex items-center">
                        <IconClock className="mr-1 h-3 w-3" />
                        {formatDate(company.updated_at)}
                      </p>
                    </div>
                    {company.user && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Created By</label>
                        <p className="text-sm flex items-center">
                          <IconUser className="mr-1 h-3 w-3" />
                          {company.user.name}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Primary Contact */}
              {company.primary_contact && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconUser className="mr-2 h-5 w-5" />
                      Primary Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-sm font-medium">{company.primary_contact.full_name}</p>
                    </div>
                    {company.primary_contact.email && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm flex items-center">
                          <IconMail className="mr-1 h-3 w-3" />
                          {company.primary_contact.email}
                        </p>
                      </div>
                    )}
                    {company.primary_contact.phone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-sm flex items-center">
                          <IconPhone className="mr-1 h-3 w-3" />
                          {company.primary_contact.phone}
                        </p>
                      </div>
                    )}
                    {company.primary_contact.position && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Position</label>
                        <p className="text-sm">{company.primary_contact.position}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Related Information */}
              {(company.leads?.length || company.deals?.length || company.contacts?.length) && (
                <div className="grid gap-6 md:grid-cols-3">
                  {company.contacts && company.contacts.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <IconUser className="mr-2 h-5 w-5" />
                          All Contacts ({company.contacts.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {company.contacts.slice(0, 3).map((contact) => (
                          <div key={contact.id} className="text-sm">
                            <p className="font-medium">
                              {contact.full_name}
                              {contact.is_primary && (
                                <Badge variant="secondary" className="ml-2 text-xs">Primary</Badge>
                              )}
                            </p>
                            {contact.position && (
                              <p className="text-xs text-muted-foreground">{contact.position}</p>
                            )}
                            {contact.email && (
                              <p className="text-xs text-muted-foreground">{contact.email}</p>
                            )}
                          </div>
                        ))}
                        {company.contacts.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{company.contacts.length - 3} more contacts
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {company.leads && company.leads.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <IconUser className="mr-2 h-5 w-5" />
                          Leads ({company.leads.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {company.leads.slice(0, 3).map((lead) => (
                          <div key={lead.id} className="text-sm">
                            <p className="font-medium">{lead.name}</p>
                            <p className="text-xs text-muted-foreground">{lead.status}</p>
                          </div>
                        ))}
                        {company.leads.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{company.leads.length - 3} more leads
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {company.deals && company.deals.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <IconBriefcase className="mr-2 h-5 w-5" />
                          Deals ({company.deals.length})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {company.deals.slice(0, 3).map((deal) => (
                          <div key={deal.id} className="text-sm">
                            <p className="font-medium">{deal.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(deal.amount)} - {deal.stage}
                            </p>
                          </div>
                        ))}
                        {company.deals.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{company.deals.length - 3} more deals
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </>
        )}
    </BusinessSheet>
  );
}