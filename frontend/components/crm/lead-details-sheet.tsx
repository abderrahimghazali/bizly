'use client';

import React, { useState, useCallback } from 'react';
import { Lead, leadsApi, UpdateLeadData } from '@/lib/api/leads';
import { AssignableUser, dealsApi } from '@/lib/api/deals';
import { ActivityTimeline } from './activity-timeline';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  IconTargetArrow,
  IconCircleCheck,
  IconCircleX,
  IconTrendingUp,
  IconUser,
  IconNotes,
  IconDeviceFloppy,
  IconX,
  IconBuilding,
  IconCalendar
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface LeadDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: number | null;
  onLeadUpdate?: (lead: Lead) => void;
}

export function LeadDetailsSheet({ open, onOpenChange, leadId, onLeadUpdate }: LeadDetailsSheetProps) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateLeadData>({});
  const [saving, setSaving] = useState(false);

  const fetchAssignableUsers = useCallback(async () => {
    try {
      const response = await dealsApi.getAssignableUsers();
      if (response.success) {
        setAssignableUsers(response.users);
      }
    } catch (error) {
      console.error('Failed to fetch assignable users:', error);
    }
  }, []);

  const fetchLeadDetails = useCallback(async () => {
    if (!leadId) return;
    
    try {
      setLoading(true);
      const response = await leadsApi.get(leadId);
      setLead(response.lead);
      setEditData({
        name: response.lead.name,
        email: response.lead.email,
        phone: response.lead.phone,
        company: response.lead.company,
        status: response.lead.status,
        source: response.lead.source,
        value: response.lead.value,
        notes: response.lead.notes,
        assigned_to: response.lead.assigned_to?.id,
      });
    } catch (error) {
      console.error('Failed to fetch lead details:', error);
      toast.error('Failed to load lead details');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [leadId, onOpenChange]);

  React.useEffect(() => {
    if (open && leadId) {
      fetchLeadDetails();
      fetchAssignableUsers();
    }
  }, [open, leadId, fetchLeadDetails, fetchAssignableUsers]);

  const handleSave = async () => {
    if (!lead) return;

    try {
      setSaving(true);
      const response = await leadsApi.update(lead.id, editData);
      setLead(response.lead);
      setIsEditing(false);
      toast.success('Lead updated successfully');
      onLeadUpdate?.(response.lead);
    } catch (error) {
      console.error('Failed to update lead:', error);
      toast.error('Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (lead) {
      setEditData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        status: lead.status,
        source: lead.source,
        value: lead.value,
        notes: lead.notes,
        assigned_to: lead.assigned_to?.id,
      });
    }
    setIsEditing(false);
  };

  const handleCall = () => {
    if (lead?.phone) {
      window.open(`tel:${lead.phone}`);
    } else {
      toast.error('No phone number available');
    }
  };

  const handleEmail = () => {
    if (lead?.email) {
      window.open(`mailto:${lead.email}`);
    } else {
      toast.error('No email address available');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      contacted: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      qualified: "bg-green-100 text-green-800 hover:bg-green-200",
      proposal: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      negotiation: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      converted: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
      lost: "bg-red-100 text-red-800 hover:bg-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <IconTargetArrow className="h-3 w-3" />;
      case 'contacted':
        return <IconPhone className="h-3 w-3" />;
      case 'qualified':
        return <IconCircleCheck className="h-3 w-3" />;
      case 'proposal':
        return <IconEdit className="h-3 w-3" />;
      case 'negotiation':
        return <IconTrendingUp className="h-3 w-3" />;
      case 'converted':
        return <IconCircleCheck className="h-3 w-3" />;
      case 'lost':
        return <IconCircleX className="h-3 w-3" />;
      default:
        return <IconTargetArrow className="h-3 w-3" />;
    }
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:!w-[50vw] sm:!max-w-[50vw] overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6 px-6">
          <SheetTitle className="text-2xl">
            {loading ? 'Loading...' : !lead ? 'Lead Not Found' : lead.name}
          </SheetTitle>
          <SheetDescription>
            {loading ? 'Loading lead details...' : !lead ? 'The requested lead could not be found' : 'Lead Details & Activity'}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading lead details...</p>
            </div>
          </div>
        ) : !lead ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">Lead not found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-end space-x-2 pb-6 px-6">
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleCall}
                        disabled={!lead.phone}
                      >
                        <IconPhone className="mr-2 h-4 w-4" />
                        Call
                      </Button>
                      <Button 
                        size="sm"
                        onClick={handleEmail}
                        disabled={!lead.email}
                      >
                        <IconMail className="mr-2 h-4 w-4" />
                        Email
                      </Button>
                    </>
                  )}
            </div>

            <div className="space-y-6 px-6">
              {/* Lead Information */}
              <div className="grid gap-6 md:grid-cols-2">
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
                          <Label htmlFor="edit-name">Name</Label>
                          <Input
                            id="edit-name"
                            value={editData.name || ''}
                            onChange={(e) => setEditData({...editData, name: e.target.value})}
                          />
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
                        <div>
                          <Label htmlFor="edit-phone">Phone</Label>
                          <Input
                            id="edit-phone"
                            value={editData.phone || ''}
                            onChange={(e) => setEditData({...editData, phone: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-company">Company</Label>
                          <Input
                            id="edit-company"
                            value={editData.company || ''}
                            onChange={(e) => setEditData({...editData, company: e.target.value})}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Name</label>
                          <p className="text-sm">{lead.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{lead.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Phone</label>
                          <p className="text-sm">{lead.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Company</label>
                          <p className="text-sm flex items-center">
                            <IconBuilding className="mr-1 h-3 w-3" />
                            {lead.company || 'Not provided'}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconTargetArrow className="mr-2 h-5 w-5" />
                      Lead Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <Label htmlFor="edit-status">Status</Label>
                          <Select 
                            value={editData.status} 
                            onValueChange={(value) => setEditData({...editData, status: value})}
                          >
                            <SelectTrigger id="edit-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="qualified">Qualified</SelectItem>
                              <SelectItem value="proposal">Proposal</SelectItem>
                              <SelectItem value="negotiation">Negotiation</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-value">Potential Value ($)</Label>
                          <Input
                            id="edit-value"
                            type="number"
                            min="0"
                            step="0.01"
                            value={editData.value || 0}
                            onChange={(e) => setEditData({...editData, value: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-source">Source</Label>
                          <Select 
                            value={editData.source} 
                            onValueChange={(value) => setEditData({...editData, source: value})}
                          >
                            <SelectTrigger id="edit-source">
                              <SelectValue placeholder="Select source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="website">Website</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                              <SelectItem value="social_media">Social Media</SelectItem>
                              <SelectItem value="email_campaign">Email Campaign</SelectItem>
                              <SelectItem value="cold_call">Cold Call</SelectItem>
                              <SelectItem value="trade_show">Trade Show</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-assigned-to">Assigned To</Label>
                          <Select 
                            value={editData.assigned_to?.toString() || 'unassigned'} 
                            onValueChange={(value) => setEditData({...editData, assigned_to: value === 'unassigned' ? undefined : parseInt(value)})}
                          >
                            <SelectTrigger id="edit-assigned-to">
                              <SelectValue placeholder="Select assignee">
                                {editData.assigned_to ? 
                                  assignableUsers.find(u => u.id === editData.assigned_to)?.name || 'Unknown User'
                                  : 'Unassigned'
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {assignableUsers.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  <div className="flex items-center justify-between w-full gap-2">
                                    <span>{user.name}</span>
                                    <span className="text-xs text-muted-foreground">{user.role}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <div className="mt-1">
                            <Badge className={`${getStatusColor(lead.status)} flex items-center space-x-1 w-fit`}>
                              {getStatusIcon(lead.status)}
                              <span className="capitalize">{lead.status}</span>
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Potential Value</label>
                          <p className="text-sm font-medium">{formatCurrency(lead.value)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Source</label>
                          <p className="text-sm">{lead.source || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                          <p className="text-sm flex items-center">
                            <IconUser className="mr-1 h-3 w-3" />
                            {lead.assigned_to?.name || 'Unassigned'}
                          </p>
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
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm flex items-center">
                      <IconCalendar className="mr-1 h-3 w-3" />
                      {formatDate(lead.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm flex items-center">
                      <IconClock className="mr-1 h-3 w-3" />
                      {formatDate(lead.updated_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Contact</label>
                    <p className="text-sm flex items-center">
                      <IconPhone className="mr-1 h-3 w-3" />
                      {lead.last_contact ? formatDate(lead.last_contact) : 'Never'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {(lead.notes || isEditing) && (
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
                        placeholder="Add notes about this lead..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Activity Timeline */}
              <ActivityTimeline activities={lead.activities || []} />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}