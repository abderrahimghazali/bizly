'use client';

import { useState, useEffect } from 'react';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IconUser, IconBuilding, IconBriefcase, IconLoader } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Lead, leadsApi, ConvertLeadData } from '@/lib/api/leads';
import { companiesApi, CompanyOption } from '@/lib/api/companies';

interface LeadConversionModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversionComplete: (result: unknown) => void;
}

export function LeadConversionModal({ 
  lead, 
  open, 
  onOpenChange, 
  onConversionComplete 
}: LeadConversionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [formData, setFormData] = useState<ConvertLeadData>({
    company_action: 'create',
    company_name: '',
    company_industry: '',
    company_website: '',
    company_phone: '',
    company_email: '',
    company_address: '',
    contact_first_name: '',
    contact_last_name: '',
    contact_position: '',
    contact_department: '',
    contact_phone: '',
    contact_mobile: '',
    contact_is_primary: true,
    create_deal: true,
    deal_title: '',
    deal_amount: 0,
    deal_probability: 75,
    deal_expected_close_date: '',
    deal_notes: '',
  });

  // Load companies when modal opens
  useEffect(() => {
    if (open) {
      fetchCompanies();
    }
  }, [open]);

  // Pre-populate form when lead changes
  useEffect(() => {
    if (lead) {
      const nameParts = lead.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData({
        company_action: 'create',
        company_name: lead.company || 'Unknown Company',
        company_industry: '',
        company_website: '',
        company_phone: lead.phone || '',
        company_email: lead.email || '',
        company_address: '',
        contact_first_name: firstName,
        contact_last_name: lastName,
        contact_position: '',
        contact_department: '',
        contact_phone: lead.phone || '',
        contact_mobile: '',
        contact_is_primary: true,
        create_deal: true,
        deal_title: `${lead.company || 'New'} Opportunity`,
        deal_amount: lead.value || 0,
        deal_probability: 75,
        deal_expected_close_date: '',
        deal_notes: lead.notes || '',
      });
    }
  }, [lead]);

  const fetchCompanies = async () => {
    try {
      const response = await companiesApi.getOptions();
      setCompanies(response);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load companies');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    setSubmitting(true);

    try {
      const response = await leadsApi.convert(lead.id, formData);
      
      toast.success(response.message || 'Lead converted successfully!');
      onConversionComplete(response);
      onOpenChange(false);
      
    } catch (error: unknown) {
      console.error('Failed to convert lead:', error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to convert lead');
    } finally {
      setSubmitting(false);
    }
  };

  const updateFormData = (field: keyof ConvertLeadData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-[50vw] overflow-y-auto" 
        style={{ 
          maxWidth: 'none',
          width: '50vw',
          minWidth: '600px'
        }}
      >
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800">
              Convert Lead
            </Badge>
            <span>Convert &quot;{lead.name}&quot; to Customer</span>
          </SheetTitle>
          <SheetDescription>
            Create company, contact, and optionally a deal from this qualified lead.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
          {/* Lead Summary */}
          <Card className="bg-muted/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <IconUser className="h-4 w-4" />
                <span>Lead Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Name:</strong> {lead.name}</div>
                <div><strong>Email:</strong> {lead.email}</div>
                <div><strong>Phone:</strong> {lead.phone || 'N/A'}</div>
                <div><strong>Company:</strong> {lead.company || 'N/A'}</div>
                <div><strong>Value:</strong> ${lead.value?.toLocaleString()}</div>
                <div><strong>Source:</strong> {lead.source || 'N/A'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Company Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <IconBuilding className="h-4 w-4" />
                <span>Company</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="create-company"
                    name="company-action"
                    checked={formData.company_action === 'create'}
                    onChange={() => updateFormData('company_action', 'create')}
                  />
                  <Label htmlFor="create-company">Create new company</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="existing-company"
                    name="company-action"
                    checked={formData.company_action === 'existing'}
                    onChange={() => updateFormData('company_action', 'existing')}
                  />
                  <Label htmlFor="existing-company">Link to existing</Label>
                </div>
              </div>

              {formData.company_action === 'create' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => updateFormData('company_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_industry">Industry</Label>
                    <Input
                      id="company_industry"
                      value={formData.company_industry}
                      onChange={(e) => updateFormData('company_industry', e.target.value)}
                      placeholder="e.g., Technology, Manufacturing"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_website">Website</Label>
                    <Input
                      id="company_website"
                      value={formData.company_website}
                      onChange={(e) => updateFormData('company_website', e.target.value)}
                      placeholder="https://company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_phone">Phone</Label>
                    <Input
                      id="company_phone"
                      value={formData.company_phone}
                      onChange={(e) => updateFormData('company_phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="company_address">Address</Label>
                    <Textarea
                      id="company_address"
                      value={formData.company_address}
                      onChange={(e) => updateFormData('company_address', e.target.value)}
                      placeholder="Company address..."
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="company_id">Select Existing Company</Label>
                  <Select 
                    value={formData.company_id?.toString() || ''} 
                    onValueChange={(value) => updateFormData('company_id', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose company..." />
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
              )}
            </CardContent>
          </Card>

          {/* Contact Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <IconUser className="h-4 w-4" />
                <span>Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_first_name">First Name *</Label>
                  <Input
                    id="contact_first_name"
                    value={formData.contact_first_name}
                    onChange={(e) => updateFormData('contact_first_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_last_name">Last Name *</Label>
                  <Input
                    id="contact_last_name"
                    value={formData.contact_last_name}
                    onChange={(e) => updateFormData('contact_last_name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_position">Position</Label>
                  <Input
                    id="contact_position"
                    value={formData.contact_position}
                    onChange={(e) => updateFormData('contact_position', e.target.value)}
                    placeholder="Job title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_department">Department</Label>
                  <Input
                    id="contact_department"
                    value={formData.contact_department}
                    onChange={(e) => updateFormData('contact_department', e.target.value)}
                    placeholder="Department"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => updateFormData('contact_phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_mobile">Mobile</Label>
                  <Input
                    id="contact_mobile"
                    value={formData.contact_mobile}
                    onChange={(e) => updateFormData('contact_mobile', e.target.value)}
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="contact_is_primary"
                  checked={formData.contact_is_primary}
                  onCheckedChange={(checked) => updateFormData('contact_is_primary', !!checked)}
                />
                <Label htmlFor="contact_is_primary" className="text-sm">
                  Set as primary contact for this company
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Deal Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center space-x-2">
                <IconBriefcase className="h-4 w-4" />
                <span>Deal (Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="create_deal"
                  checked={formData.create_deal}
                  onCheckedChange={(checked) => updateFormData('create_deal', !!checked)}
                />
                <Label htmlFor="create_deal" className="text-sm">
                  Create a deal from this lead
                </Label>
              </div>

              {formData.create_deal && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="deal_title">Deal Title *</Label>
                    <Input
                      id="deal_title"
                      value={formData.deal_title}
                      onChange={(e) => updateFormData('deal_title', e.target.value)}
                      required={formData.create_deal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deal_amount">Amount *</Label>
                    <Input
                      id="deal_amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.deal_amount}
                      onChange={(e) => updateFormData('deal_amount', parseFloat(e.target.value) || 0)}
                      required={formData.create_deal}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deal_probability">Probability (%)</Label>
                    <Input
                      id="deal_probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.deal_probability}
                      onChange={(e) => updateFormData('deal_probability', parseInt(e.target.value) || 75)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deal_expected_close_date">Expected Close Date *</Label>
                    <Input
                      id="deal_expected_close_date"
                      type="date"
                      value={formData.deal_expected_close_date}
                      onChange={(e) => updateFormData('deal_expected_close_date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required={formData.create_deal}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="deal_notes">Deal Notes</Label>
                    <Textarea
                      id="deal_notes"
                      value={formData.deal_notes}
                      onChange={(e) => updateFormData('deal_notes', e.target.value)}
                      placeholder="Additional notes about this deal..."
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <IconLoader className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? 'Converting...' : 'Convert Lead'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}