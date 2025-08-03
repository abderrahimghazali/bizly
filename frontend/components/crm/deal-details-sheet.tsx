'use client';

import React, { useState, useCallback } from 'react';
import { Deal, dealsApi, UpdateDealData, AssignableUser, dealStages } from '@/lib/api/deals';
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
  IconBriefcase,
  IconCurrencyDollar,
  IconTrendingUp,
  IconUser,
  IconNotes,
  IconDeviceFloppy,
  IconX,
  IconBuilding,
  IconCalendar,
  IconPercentage,
  IconTarget
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface DealDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId: number | null;
  assignableUsers: AssignableUser[];
  onDealUpdate?: (deal: Deal) => void;
}

export function DealDetailsSheet({ open, onOpenChange, dealId, assignableUsers, onDealUpdate }: DealDetailsSheetProps) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateDealData>({});
  const [saving, setSaving] = useState(false);

  const fetchDealDetails = useCallback(async () => {
    if (!dealId) return;
    
    try {
      setLoading(true);
      const response = await dealsApi.getById(dealId);
      setDeal(response.deal);
      setEditData({
        title: response.deal.title,
        description: response.deal.description,
        amount: response.deal.amount,
        probability: response.deal.probability,
        stage: response.deal.stage,
        expected_close_date: response.deal.expected_close_date,
        source: response.deal.source,
        notes: response.deal.notes,
        assigned_to: response.deal.assigned_to,
      });
    } catch (error) {
      console.error('Failed to fetch deal details:', error);
      toast.error('Failed to load deal details');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }, [dealId, onOpenChange]);

  React.useEffect(() => {
    if (open && dealId) {
      fetchDealDetails();
    }
  }, [open, dealId, fetchDealDetails]);

  const handleSave = async () => {
    if (!deal) return;

    try {
      setSaving(true);
      const response = await dealsApi.update(deal.id, editData);
      setDeal(response.deal);
      setIsEditing(false);
      toast.success('Deal updated successfully');
      onDealUpdate?.(response.deal);
    } catch (error) {
      console.error('Failed to update deal:', error);
      toast.error('Failed to update deal');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (deal) {
      setEditData({
        title: deal.title,
        description: deal.description,
        amount: deal.amount,
        probability: deal.probability,
        stage: deal.stage,
        expected_close_date: deal.expected_close_date,
        source: deal.source,
        notes: deal.notes,
        assigned_to: deal.assigned_to,
      });
    }
    setIsEditing(false);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      qualified: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      proposal: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      negotiation: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      closed_won: "bg-green-100 text-green-800 hover:bg-green-200",
      closed_lost: "bg-red-100 text-red-800 hover:bg-red-200",
    };
    return colors[stage] || "bg-gray-100 text-gray-800 hover:bg-gray-200";
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'qualified':
        return <IconTarget className="h-3 w-3" />;
      case 'proposal':
        return <IconEdit className="h-3 w-3" />;
      case 'negotiation':
        return <IconTrendingUp className="h-3 w-3" />;
      case 'closed_won':
        return <IconBriefcase className="h-3 w-3" />;
      case 'closed_lost':
        return <IconX className="h-3 w-3" />;
      default:
        return <IconTarget className="h-3 w-3" />;
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
            {loading ? 'Loading...' : !deal ? 'Deal Not Found' : deal.title}
          </SheetTitle>
          <SheetDescription>
            {loading ? 'Loading deal details...' : !deal ? 'The requested deal could not be found' : 'Deal Details & Information'}
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading deal details...</p>
            </div>
          </div>
        ) : !deal ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground">Deal not found</p>
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
                    </>
                  )}
            </div>

            <div className="space-y-6 px-6">
              {/* Deal Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconBriefcase className="mr-2 h-5 w-5" />
                      Deal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <Label htmlFor="edit-title">Title</Label>
                          <Input
                            id="edit-title"
                            value={editData.title || ''}
                            onChange={(e) => setEditData({...editData, title: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={editData.description || ''}
                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-amount">Amount ($)</Label>
                            <Input
                              id="edit-amount"
                              type="number"
                              min="0"
                              step="0.01"
                              value={editData.amount || 0}
                              onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-probability">Probability (%)</Label>
                            <Input
                              id="edit-probability"
                              type="number"
                              min="0"
                              max="100"
                              value={editData.probability || 0}
                              onChange={(e) => setEditData({...editData, probability: parseFloat(e.target.value) || 0})}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Title</label>
                          <p className="text-sm">{deal.title}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Description</label>
                          <p className="text-sm">{deal.description || 'No description'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Amount</label>
                          <p className="text-sm font-medium flex items-center">
                            <IconCurrencyDollar className="mr-1 h-3 w-3" />
                            {formatCurrency(deal.amount)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Probability</label>
                          <p className="text-sm flex items-center">
                            <IconPercentage className="mr-1 h-3 w-3" />
                            {deal.probability}%
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconTarget className="mr-2 h-5 w-5" />
                      Deal Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <>
                        <div>
                          <Label htmlFor="edit-stage">Stage</Label>
                          <Select 
                            value={editData.stage} 
                            onValueChange={(value) => setEditData({...editData, stage: value as Deal['stage']})}
                          >
                            <SelectTrigger id="edit-stage">
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(dealStages).map(([key, label]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="edit-expected-close">Expected Close Date</Label>
                          <Input
                            id="edit-expected-close"
                            type="date"
                            value={editData.expected_close_date ? new Date(editData.expected_close_date).toISOString().split('T')[0] : ''}
                            onChange={(e) => setEditData({...editData, expected_close_date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-assigned-to">Assigned To</Label>
                          <Select 
                            value={editData.assigned_to?.toString() || 'unassigned'} 
                            onValueChange={(value) => setEditData({...editData, assigned_to: value === 'unassigned' ? undefined : parseInt(value)})}
                          >
                            <SelectTrigger id="edit-assigned-to">
                              <SelectValue placeholder="Select assignee" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Unassigned</SelectItem>
                              {assignableUsers.map((user) => (
                                <SelectItem key={user.id} value={user.id.toString()}>
                                  {user.name} ({user.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Stage</label>
                          <div className="mt-1">
                            <Badge className={`${getStageColor(deal.stage)} flex items-center space-x-1 w-fit`}>
                              {getStageIcon(deal.stage)}
                              <span className="capitalize">{deal.stage_label}</span>
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Expected Close Date</label>
                          <p className="text-sm flex items-center">
                            <IconCalendar className="mr-1 h-3 w-3" />
                            {formatDate(deal.expected_close_date)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                          <p className="text-sm flex items-center">
                            <IconUser className="mr-1 h-3 w-3" />
                            {deal.assigned_user?.name || 'Unassigned'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Source</label>
                          <p className="text-sm">{deal.source || 'Not specified'}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Related Information */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconBuilding className="mr-2 h-5 w-5" />
                      Company
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{deal.company?.name || 'No company'}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconUser className="mr-2 h-5 w-5" />
                      Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{deal.contact?.name || 'No contact'}</p>
                    {deal.contact?.email && (
                      <p className="text-xs text-muted-foreground">{deal.contact.email}</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <IconTarget className="mr-2 h-5 w-5" />
                      Lead Source
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{deal.lead?.name || 'No associated lead'}</p>
                    {deal.lead?.email && (
                      <p className="text-xs text-muted-foreground">{deal.lead.email}</p>
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
                      {formatDate(deal.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="text-sm flex items-center">
                      <IconClock className="mr-1 h-3 w-3" />
                      {formatDate(deal.updated_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              {(deal.notes || isEditing) && (
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
                        placeholder="Add notes about this deal..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{deal.notes}</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}