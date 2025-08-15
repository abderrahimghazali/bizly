'use client';

import React, { useState, useCallback } from 'react';
import { Quote, quotesApi, UpdateQuoteData, quoteStatuses } from '@/lib/api/quotes';
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
  IconMail, 
  IconClock, 
  IconBuilding,
  IconCurrencyDollar,
  IconUser,
  IconDeviceFloppy,
  IconX,
  IconCalendar,
  IconId,
  IconFileText,
  IconAlertCircle,
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface QuoteDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: number | null;
  onQuoteUpdate?: (quote: Quote) => void;
}

export function QuoteDetailsSheet({ open, onOpenChange, quoteId, onQuoteUpdate }: QuoteDetailsSheetProps) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateQuoteData>({
    title: '',
    description: '',
    quote_date: '',
    expiry_date: '',
    subtotal: 0,
    tax_rate: 0,
    discount_rate: 0,
    currency: 'USD',
    terms_conditions: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchQuoteDetails = useCallback(async () => {
    if (!quoteId) return;
    
    try {
      setLoading(true);
      const quoteData = await quotesApi.getById(quoteId);
      setQuote(quoteData);
      setEditData({
        title: quoteData.title,
        description: quoteData.description || '',
        quote_date: quoteData.quote_date,
        expiry_date: quoteData.expiry_date,
        subtotal: quoteData.subtotal,
        tax_rate: quoteData.tax_rate,
        discount_rate: quoteData.discount_rate,
        currency: quoteData.currency,
        terms_conditions: quoteData.terms_conditions || '',
        notes: quoteData.notes || '',
      });
    } catch (error) {
      console.error('Failed to fetch quote details:', error);
      toast.error('Failed to load quote details');
    } finally {
      setLoading(false);
    }
  }, [quoteId]);

  React.useEffect(() => {
    if (open && quoteId) {
      fetchQuoteDetails();
    } else {
      setQuote(null);
      setIsEditing(false);
    }
  }, [open, quoteId, fetchQuoteDetails]);

  const handleSave = async () => {
    if (!quote) return;
    
    try {
      setSaving(true);
      const response = await quotesApi.update(quote.id, editData);
      
      if (response.success) {
        const updatedQuote = response.quote;
        setQuote(updatedQuote);
        setIsEditing(false);
        onQuoteUpdate?.(updatedQuote);
        toast.success(response.message || 'Quote updated successfully!');
      }
    } catch (error: any) {
      console.error('Failed to update quote:', error);
      toast.error(error.response?.data?.message || 'Failed to update quote');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!quote) return;
    setEditData({
      title: quote.title,
      description: quote.description || '',
      quote_date: quote.quote_date,
      expiry_date: quote.expiry_date,
      subtotal: quote.subtotal,
      tax_rate: quote.tax_rate,
      discount_rate: quote.discount_rate,
      currency: quote.currency,
      terms_conditions: quote.terms_conditions || '',
      notes: quote.notes || '',
    });
    setIsEditing(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (quote: Quote) => {
    return new Date(quote.expiry_date) < new Date() && 
           quote.status !== 'accepted' && 
           quote.status !== 'rejected';
  };

  if (loading) {
    return (
      <BusinessSheet 
        open={open}
        onOpenChange={onOpenChange}
        title="Loading..."
        description="Loading quote details..."
        size="wide"
      >
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </BusinessSheet>
    );
  }

  if (!quote) {
    return null;
  }

  return (
    <BusinessSheet 
      open={open} 
      onOpenChange={onOpenChange}
      size="wide"
    >
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="flex items-center space-x-2">
                <IconFileText className="h-5 w-5" />
                <span>{quote.quote_number}</span>
              </SheetTitle>
              <SheetDescription>
                {isEditing ? 'Edit quote details' : 'View quote information'}
              </SheetDescription>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} size="sm" disabled={saving}>
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="outline">
                    <IconX className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconFileText className="h-4 w-4" />
                <span>Basic Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quote Number</Label>
                  <div className="flex items-center space-x-2">
                    <IconId className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{quote.quote_number}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(quote.status)}>
                      {quoteStatuses[quote.status]}
                    </Badge>
                    {isExpired(quote) && (
                      <Badge className="bg-red-100 text-red-800">
                        <IconAlertCircle className="mr-1 h-3 w-3" />
                        Expired
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Title</Label>
                {isEditing ? (
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    placeholder="Quote title"
                  />
                ) : (
                  <p className="text-sm">{quote.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                {isEditing ? (
                  <Textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    placeholder="Quote description"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {quote.description || 'No description provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Company & Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconBuilding className="h-4 w-4" />
                <span>Company & Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <div className="flex items-center space-x-2">
                    <IconBuilding className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{quote.company?.name || 'No company'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Contact</Label>
                  <div className="flex items-center space-x-2">
                    <IconUser className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{quote.contact?.name || 'No contact'}</span>
                  </div>
                </div>
              </div>
              {quote.contact?.email && (
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <div className="flex items-center space-x-2">
                    <IconMail className="h-4 w-4 text-muted-foreground" />
                    <span>{quote.contact.email}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconCurrencyDollar className="h-4 w-4" />
                <span>Financial Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subtotal</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.subtotal}
                      onChange={(e) => setEditData({ ...editData, subtotal: parseFloat(e.target.value) || 0 })}
                    />
                  ) : (
                    <p className="font-medium">{formatCurrency(quote.subtotal, quote.currency)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.tax_rate}
                      onChange={(e) => setEditData({ ...editData, tax_rate: parseFloat(e.target.value) || 0 })}
                    />
                  ) : (
                    <p>{quote.tax_rate}%</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Rate (%)</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.discount_rate}
                      onChange={(e) => setEditData({ ...editData, discount_rate: parseFloat(e.target.value) || 0 })}
                    />
                  ) : (
                    <p>{quote.discount_rate}%</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  {isEditing ? (
                    <Input
                      value={editData.currency}
                      onChange={(e) => setEditData({ ...editData, currency: e.target.value })}
                    />
                  ) : (
                    <p>{quote.currency}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-semibold">Total Amount</Label>
                  <p className="text-lg font-bold">{formatCurrency(quote.total_amount, quote.currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconCalendar className="h-4 w-4" />
                <span>Dates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quote Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.quote_date}
                      onChange={(e) => setEditData({ ...editData, quote_date: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(quote.quote_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.expiry_date}
                      onChange={(e) => setEditData({ ...editData, expiry_date: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <IconCalendar className="h-4 w-4 text-muted-foreground" />
                      <span className={isExpired(quote) ? 'text-red-600 font-medium' : ''}>
                        {new Date(quote.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isEditing ? (
                  <Textarea
                    value={editData.terms_conditions}
                    onChange={(e) => setEditData({ ...editData, terms_conditions: e.target.value })}
                    placeholder="Terms and conditions"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {quote.terms_conditions || 'No terms and conditions provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isEditing ? (
                  <Textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    placeholder="Additional notes"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {quote.notes || 'No notes provided'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <IconClock className="h-4 w-4" />
                <span>Timestamps</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Created</Label>
                  <div className="flex items-center space-x-2">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(quote.created_at).toLocaleString()}</span>
                  </div>
                </div>
                <div>
                  <Label>Updated</Label>
                  <div className="flex items-center space-x-2">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(quote.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </BusinessSheet>
  );
}