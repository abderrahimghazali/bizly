'use client';

import React, { useState, useCallback } from 'react';
import { Invoice, invoicesApi, UpdateInvoiceData, invoiceStatuses } from '@/lib/api/invoices';
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
  IconMapPin,
  IconId,
  IconFileText,
  IconAlertCircle,
  IconCreditCard,
} from '@tabler/icons-react';
import { toast } from 'sonner';

interface InvoiceDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: number | null;
  onInvoiceUpdate?: (invoice: Invoice) => void;
}

export function InvoiceDetailsSheet({ open, onOpenChange, invoiceId, onInvoiceUpdate }: InvoiceDetailsSheetProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateInvoiceData>({
    title: '',
    description: '',
    invoice_date: '',
    due_date: '',
    subtotal: 0,
    tax_rate: 0,
    discount_rate: 0,
    currency: 'USD',
    payment_terms: '',
    notes: '',
    status: 'draft'
  });

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;
    
    try {
      setLoading(true);
      const response = await invoicesApi.getById(invoiceId);
      // Handle different possible response structures
      const invoiceData = response.invoice || response.data || response;
      
      if (!invoiceData) {
        throw new Error('No invoice data found in response');
      }
      
      setInvoice(invoiceData);
      setEditData({
        title: invoiceData.title || '',
        description: invoiceData.description || '',
        invoice_date: formatDateForInput(invoiceData.invoice_date || ''),
        due_date: formatDateForInput(invoiceData.due_date || ''),
        subtotal: invoiceData.subtotal || 0,
        tax_rate: invoiceData.tax_rate || 0,
        discount_rate: invoiceData.discount_rate || 0,
        currency: invoiceData.currency || 'USD',
        payment_terms: invoiceData.payment_terms || '',
        notes: invoiceData.notes || '',
        status: invoiceData.status || 'draft'
      });
    } catch (error) {
      console.error('Failed to fetch invoice:', error);
      toast.error('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  React.useEffect(() => {
    if (open && invoiceId) {
      fetchInvoice();
    }
  }, [open, invoiceId, fetchInvoice]);

  const handleSave = async () => {
    if (!invoice) return;

    try {
      const response = await invoicesApi.update(invoice.id, editData);
      // Handle different possible response structures
      const updatedInvoice = response.invoice || response.data || response;
      
      if (updatedInvoice) {
        setInvoice(updatedInvoice);
        setIsEditing(false);
        toast.success('Invoice updated successfully');
        onInvoiceUpdate?.(updatedInvoice);
      }
    } catch (error) {
      console.error('Failed to update invoice:', error);
      toast.error('Failed to update invoice');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (invoice) {
      setEditData({
        title: invoice.title || '',
        description: invoice.description || '',
        invoice_date: formatDateForInput(invoice.invoice_date || ''),
        due_date: formatDateForInput(invoice.due_date || ''),
        subtotal: invoice.subtotal || 0,
        tax_rate: invoice.tax_rate || 0,
        discount_rate: invoice.discount_rate || 0,
        currency: invoice.currency || 'USD',
        payment_terms: invoice.payment_terms || '',
        notes: invoice.notes || '',
        status: invoice.status
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    // Extract just the date part (YYYY-MM-DD) from ISO string or full timestamp
    return dateString.split('T')[0];
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partially_paid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <BusinessSheet 
        open={open} 
        onOpenChange={onOpenChange}
        title="Loading..."
        description="Loading invoice details"
        size="wide"
      >
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </BusinessSheet>
    );
  }

  if (!invoice) {
    return null;
  }

  return (
    <BusinessSheet 
      open={open} 
      onOpenChange={onOpenChange}
      title={invoice.invoice_number}
      description={isEditing ? 'Edit invoice details' : 'View invoice information'}
      size="wide"
    >
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <IconFileText className="h-5 w-5" />
              <span className="text-lg font-semibold">{invoice.invoice_number}</span>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
                  <IconEdit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} size="sm" variant="default">
                    <IconDeviceFloppy className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="outline">
                    <IconX className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <IconId className="mr-2 h-4 w-4" />
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {isEditing ? (
                    <Select value={editData.status} onValueChange={(value: Invoice['status']) => setEditData({...editData, status: value})}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(invoiceStatuses).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoiceStatuses[invoice.status] || invoice.status}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Invoice Date</span>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.invoice_date}
                      onChange={(e) => setEditData({...editData, invoice_date: e.target.value})}
                      className="w-32"
                    />
                  ) : (
                    <span className="text-sm font-medium">{formatDateForDisplay(invoice.invoice_date)}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due Date</span>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editData.due_date}
                      onChange={(e) => setEditData({...editData, due_date: e.target.value})}
                      className="w-32"
                    />
                  ) : (
                    <span className="text-sm font-medium">{formatDateForDisplay(invoice.due_date)}</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <IconBuilding className="mr-2 h-4 w-4" />
                  Company & Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground block">Company</span>
                  <span className="text-sm font-medium">{invoice.company?.name || 'N/A'}</span>
                </div>
                
                {invoice.contact && (
                  <div>
                    <span className="text-sm text-muted-foreground block">Contact</span>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <IconUser className="mr-1 h-3 w-3" />
                        {invoice.contact.name}
                      </div>
                      {invoice.contact.email && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <IconMail className="mr-1 h-3 w-3" />
                          {invoice.contact.email}
                        </div>
                      )}
                      {invoice.contact.phone && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <IconPhone className="mr-1 h-3 w-3" />
                          {invoice.contact.phone}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Financial Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <IconCurrencyDollar className="mr-2 h-4 w-4" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground block">Subtotal</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={editData.subtotal}
                      onChange={(e) => setEditData({...editData, subtotal: parseFloat(e.target.value) || 0})}
                    />
                  ) : (
                    <span className="text-lg font-semibold">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                  )}
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground block">Tax ({isEditing ? editData.tax_rate : invoice.tax_rate}%)</span>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.1"
                      value={editData.tax_rate}
                      onChange={(e) => setEditData({...editData, tax_rate: parseFloat(e.target.value) || 0})}
                    />
                  ) : (
                    <span className="text-lg font-semibold">{formatCurrency(invoice.tax_amount, invoice.currency)}</span>
                  )}
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground block">Total</span>
                  <span className="text-lg font-semibold">{formatCurrency(invoice.total_amount, invoice.currency)}</span>
                </div>
                
                <div>
                  <span className="text-sm text-muted-foreground block">Due Amount</span>
                  <span className="text-lg font-semibold text-red-600">{formatCurrency(invoice.due_amount, invoice.currency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <IconFileText className="mr-2 h-4 w-4" />
                  Invoice Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="title">Title</Label>
                  {isEditing ? (
                    <Input
                      id="title"
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      placeholder="Invoice title"
                    />
                  ) : (
                    <p className="text-sm mt-1">{invoice.title || 'N/A'}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={editData.description}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      placeholder="Invoice description"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm mt-1 whitespace-pre-wrap">{invoice.description || 'N/A'}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center">
                  <IconCreditCard className="mr-2 h-4 w-4" />
                  Payment Terms & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  {isEditing ? (
                    <Textarea
                      id="payment_terms"
                      value={editData.payment_terms}
                      onChange={(e) => setEditData({...editData, payment_terms: e.target.value})}
                      placeholder="Payment terms and conditions"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm mt-1 whitespace-pre-wrap">{invoice.payment_terms || 'N/A'}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  {isEditing ? (
                    <Textarea
                      id="notes"
                      value={editData.notes}
                      onChange={(e) => setEditData({...editData, notes: e.target.value})}
                      placeholder="Additional notes"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm mt-1 whitespace-pre-wrap">{invoice.notes || 'N/A'}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Creation and Update Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center">
                <IconClock className="mr-2 h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <span className="ml-2">{new Date(invoice.created_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span className="ml-2">{new Date(invoice.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </BusinessSheet>
  );
}