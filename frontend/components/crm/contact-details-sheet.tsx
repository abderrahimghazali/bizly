'use client';

import React, { useState, useCallback } from 'react';
import { Contact, contactsApi, UpdateContactData } from '@/lib/api/contacts';
import { CompanyOption, companiesApi } from '@/lib/api/companies';
import { BusinessSheet } from '@/components/ui/business-sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  IconUser,
  IconDeviceFloppy,
  IconX,
  IconCalendar,
  IconStarFilled,
  IconBriefcase,
  IconNotes,
  IconDeviceMobile
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface ContactDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: number | null;
  onContactUpdate?: (contact: Contact) => void;
  companies?: CompanyOption[];
}

export function ContactDetailsSheet({ open, onOpenChange, contactId, onContactUpdate, companies: companiesProp = [] }: ContactDetailsSheetProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [companies, setCompanies] = useState<CompanyOption[]>(companiesProp);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateContactData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    position: '',
    department: '',
    company_id: 0,
    is_primary: false,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      console.log('Fetching companies...');
      const companiesData = await companiesApi.getOptions();
      console.log('Companies fetched:', companiesData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  }, []);

  const fetchContactDetails = useCallback(async () => {
    if (!contactId) return;
    
    try {
      setLoading(true);
      const contactData = await contactsApi.getById(contactId);
      setContact(contactData);
      setEditData({
        first_name: contactData.first_name,
        last_name: contactData.last_name,
        email: contactData.email,
        phone: contactData.phone,
        mobile: contactData.mobile,
        position: contactData.position,
        department: contactData.department,
        company_id: contactData.company_id,
        is_primary: contactData.is_primary,
        notes: contactData.notes,
      });
    } catch (error) {
      console.error('Failed to fetch contact details:', error);
      toast.error('Failed to load contact details');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [contactId, onOpenChange]);

  React.useEffect(() => {
    if (open && contactId) {
      fetchContactDetails();
      // Always fetch companies to ensure we have fresh data
      fetchCompanies();
    }
  }, [open, contactId, fetchContactDetails, fetchCompanies]);

  // Update companies prop when it changes
  React.useEffect(() => {
    if (companiesProp.length > 0) {
      setCompanies(companiesProp);
    }
  }, [companiesProp]);

  const handleSave = async () => {
    if (!contact) return;

    try {
      setSaving(true);
      const response = await contactsApi.update(contact.id, editData);
      setContact(response.contact);
      setIsEditing(false);
      toast.success('Contact updated successfully');
      onContactUpdate?.(response.contact);
    } catch (error) {
      console.error('Failed to update contact:', error);
      toast.error('Failed to update contact');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (contact) {
      setEditData({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        mobile: contact.mobile,
        position: contact.position,
        department: contact.department,
        company_id: contact.company_id,
        is_primary: contact.is_primary,
        notes: contact.notes,
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!open) return null;

  return (
    <BusinessSheet 
      open={open} 
      onOpenChange={onOpenChange}
      size="wide"
    >
        <div className="space-y-4 pb-6">
          <div>
            <h2 className="text-2xl font-semibold">
              {loading ? 'Loading...' : !contact ? 'Contact Not Found' : contact.full_name}
            </h2>
            <p className="text-muted-foreground text-sm">
              {loading ? 'Loading contact details...' : !contact ? 'The requested contact could not be found' : 'Contact Details & Information'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading contact details...</p>
            </div>
          </div>
        ) : !contact ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">Contact not found</p>
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
              {/* Contact Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconUser className="mr-2 h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-first-name">First Name</Label>
                            <Input
                              id="edit-first-name"
                              value={editData.first_name || ''}
                              onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-last-name">Last Name</Label>
                            <Input
                              id="edit-last-name"
                              value={editData.last_name || ''}
                              onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="edit-email">Email</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            value={editData.email || ''}
                            onChange={(e) => setEditData({...editData, email: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-phone">Phone</Label>
                            <Input
                              id="edit-phone"
                              value={editData.phone || ''}
                              onChange={(e) => setEditData({...editData, phone: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-mobile">Mobile</Label>
                            <Input
                              id="edit-mobile"
                              value={editData.mobile || ''}
                              onChange={(e) => setEditData({...editData, mobile: e.target.value})}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                          <p className="text-sm font-medium">{contact.full_name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm flex items-center">
                            <IconMail className="mr-1 h-3 w-3" />
                            {contact.email || 'Not specified'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                            <p className="text-sm flex items-center">
                              <IconPhone className="mr-1 h-3 w-3" />
                              {contact.phone || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                            <p className="text-sm flex items-center">
                              <IconDeviceMobile className="mr-1 h-3 w-3" />
                              {contact.mobile || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconBriefcase className="mr-2 h-5 w-5" />
                      Professional Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <Label htmlFor="edit-company">Company</Label>
                          <Select 
                            value={editData.company_id?.toString() || ''} 
                            onValueChange={(value) => setEditData({...editData, company_id: parseInt(value)})}
                          >
                            <SelectTrigger id="edit-company">
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-position">Position</Label>
                          <Input
                            id="edit-position"
                            value={editData.position || ''}
                            onChange={(e) => setEditData({...editData, position: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-department">Department</Label>
                          <Input
                            id="edit-department"
                            value={editData.department || ''}
                            onChange={(e) => setEditData({...editData, department: e.target.value})}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="edit-is-primary"
                            checked={editData.is_primary}
                            onCheckedChange={(checked) => setEditData({...editData, is_primary: !!checked})}
                          />
                          <Label htmlFor="edit-is-primary">Primary Contact</Label>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Company</label>
                          <p className="text-sm flex items-center">
                            <IconBuilding className="mr-1 h-3 w-3" />
                            {contact.company?.name || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Position</label>
                          <p className="text-sm">{contact.position || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Department</label>
                          <p className="text-sm">{contact.department || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Primary Contact</label>
                          <div className="mt-1">
                            {contact.is_primary ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center space-x-1 w-fit">
                                <IconStarFilled className="h-3 w-3" />
                                <span>Primary</span>
                              </Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">No</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <IconClock className="mr-2 h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm flex items-center">
                      <IconCalendar className="mr-1 h-3 w-3" />
                      {formatDate(contact.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm flex items-center">
                      <IconClock className="mr-1 h-3 w-3" />
                      {formatDate(contact.updated_at)}
                    </p>
                  </div>
                  {contact.user && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">Created By</label>
                      <p className="text-sm flex items-center">
                        <IconUser className="mr-1 h-3 w-3" />
                        {contact.user.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {(contact.notes || isEditing) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconNotes className="mr-2 h-5 w-5" />
                      Notes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={editData.notes || ''}
                        onChange={(e) => setEditData({...editData, notes: e.target.value})}
                        placeholder="Add notes about this contact..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Related Deals */}
              {contact.deals && contact.deals.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconBriefcase className="mr-2 h-5 w-5" />
                      Related Deals ({contact.deals.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {contact.deals.slice(0, 5).map((deal) => (
                      <div key={deal.id} className="text-sm border-l-2 border-blue-200 pl-3">
                        <p className="font-medium">{deal.title}</p>
                        <p className="text-xs text-muted-foreground">
                          ${deal.amount} - {deal.stage}
                        </p>
                      </div>
                    ))}
                    {contact.deals.length > 5 && (
                      <p className="text-xs text-muted-foreground">
                        +{contact.deals.length - 5} more deals
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
    </BusinessSheet>
  );
}