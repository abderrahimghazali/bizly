'use client';

import { useState } from 'react';
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BusinessSheet } from '@/components/ui/business-sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus, DollarSign, CreditCard } from 'lucide-react';
import { invoicesApi, Invoice, CreateInvoiceData, MarkAsPaidData, type InvoiceStats } from '@/lib/api/invoices';
import { ordersApi } from '@/lib/api/orders';
import { quotesApi } from '@/lib/api/quotes';
import { companiesApi } from '@/lib/api/companies';
import { contactsApi } from '@/lib/api/contacts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { InvoicesDataTable } from '@/components/table/invoices-data-table';

const createInvoiceSchema = z.object({
  company_id: z.number().min(1, 'Company is required'),
  contact_id: z.number().optional(),
  order_id: z.number().optional(),
  quote_id: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  tax_rate: z.number().min(0).max(100).optional(),
  discount_rate: z.number().min(0).max(100).optional(),
  currency: z.string().optional(),
  payment_terms: z.string().optional(),
  notes: z.string().optional(),
});

const markAsPaidSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paid_date: z.string().optional(),
});

export default function InvoicesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const queryClient = useQueryClient();

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesApi.getAll(),
  });

  const { data: statsData } = useQuery({
    queryKey: ['invoices-stats'],
    queryFn: () => invoicesApi.getStats(),
  });

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies-options'],
    queryFn: () => companiesApi.getOptions(),
  });

  const { data: ordersData } = useQuery({
    queryKey: ['orders-for-invoices'],
    queryFn: () => ordersApi.getAll({ status: 'confirmed' }),
  });

  const { data: quotesData } = useQuery({
    queryKey: ['quotes-for-invoices'],
    queryFn: () => quotesApi.getAll({ status: 'accepted' }),
  });

  const createMutation = useMutation({
    mutationFn: invoicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-stats'] });
      setIsCreateOpen(false);
      toast.success('Invoice created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: invoicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-stats'] });
      toast.success('Invoice deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MarkAsPaidData }) => 
      invoicesApi.markAsPaid(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-stats'] });
      setIsPaymentOpen(false);
      setSelectedInvoice(null);
      toast.success('Payment recorded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    },
  });

  const form = useForm<CreateInvoiceData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      subtotal: 0,
      tax_rate: 0,
      discount_rate: 0,
      currency: 'USD',
    },
  });

  const paymentForm = useForm<MarkAsPaidData>({
    resolver: zodResolver(markAsPaidSchema),
    defaultValues: {
      paid_date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedCompanyId = form.watch('company_id');
  const selectedOrderId = form.watch('order_id');
  const selectedQuoteId = form.watch('quote_id');
  
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts-options', selectedCompanyId],
    queryFn: () => contactsApi.getOptions({ company_id: selectedCompanyId }),
    enabled: !!selectedCompanyId,
  });

  // Auto-fill form when an order or quote is selected
  const selectedOrder = ordersData?.data?.find((order: any) => order.id === selectedOrderId);
  const selectedQuote = quotesData?.data?.find((quote: any) => quote.id === selectedQuoteId);
  
  React.useEffect(() => {
    const source = selectedOrder || selectedQuote;
    if (source) {
      form.setValue('company_id', source.company_id);
      form.setValue('contact_id', source.contact_id);
      form.setValue('title', source.title);
      form.setValue('description', source.description);
      form.setValue('subtotal', source.subtotal);
      form.setValue('tax_rate', source.tax_rate);
      form.setValue('discount_rate', source.discount_rate);
      form.setValue('currency', source.currency);
      form.setValue('notes', source.notes);
      
      // Set due date to 30 days from today
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      form.setValue('due_date', dueDate.toISOString().split('T')[0]);
    }
  }, [selectedOrder, selectedQuote, form]);

  const onSubmit = (data: CreateInvoiceData) => {
    createMutation.mutate(data);
  };

  const onPaymentSubmit = (data: MarkAsPaidData) => {
    if (selectedInvoice) {
      markAsPaidMutation.mutate({ id: selectedInvoice.id, data });
    }
  };

  const handleMarkAsPaid = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    paymentForm.setValue('amount', invoice.due_amount);
    setIsPaymentOpen(true);
  };

  const stats: InvoiceStats = statsData?.stats || {
    total: 0,
    draft: 0,
    sent: 0,
    paid: 0,
    overdue: 0,
    total_value: 0,
    paid_value: 0,
    due_value: 0,
  };

  const invoices: Invoice[] = invoicesData?.data || [];

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleInvoiceDelete = (invoiceId: number) => {
    deleteMutation.mutate(invoiceId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage invoices and track payments
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Create Invoice Business Sheet */}
      <BusinessSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Create New Invoice"
        description="Create a new invoice from scratch, an order, or a quote."
        size="wide"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="order_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Order (Optional)</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value ? parseInt(value) : undefined);
                          if (value) form.setValue('quote_id', undefined);
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an order" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Don't use order</SelectItem>
                            {(ordersData?.data || []).map((order: any) => (
                              <SelectItem key={order.id} value={order.id.toString()}>
                                {order.order_number} - {order.title} ({formatCurrency(order.total_amount, order.currency)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quote_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Quote (Optional)</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value ? parseInt(value) : undefined);
                          if (value) form.setValue('order_id', undefined);
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a quote" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Don't use quote</SelectItem>
                            {(quotesData?.data || []).map((quote: any) => (
                              <SelectItem key={quote.id} value={quote.id.toString()}>
                                {quote.quote_number} - {quote.title} ({formatCurrency(quote.total_amount, quote.currency)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="company_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company *</FormLabel>
                        <Select onValueChange={(value) => {
                          const companyId = parseInt(value);
                          field.onChange(companyId);
                          form.setValue('contact_id', undefined);
                        }}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={companiesLoading ? "Loading..." : "Select company"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {companiesLoading ? (
                              <SelectItem value="loading" disabled>Loading companies...</SelectItem>
                            ) : (companiesData || []).map((company: any) => (
                              <SelectItem key={company.id} value={company.id.toString()}>
                                {company.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                !selectedCompanyId 
                                  ? "Select company first" 
                                  : contactsLoading 
                                    ? "Loading..." 
                                    : "Select contact"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {!selectedCompanyId ? (
                              <SelectItem value="no-company" disabled>Please select a company first</SelectItem>
                            ) : contactsLoading ? (
                              <SelectItem value="loading" disabled>Loading contacts...</SelectItem>
                            ) : (contactsData || []).length === 0 ? (
                              <SelectItem value="no-contacts" disabled>No contacts found for this company</SelectItem>
                            ) : (contactsData || []).map((contact: any) => (
                              <SelectItem key={contact.id} value={contact.id.toString()}>
                                {contact.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Invoice title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Invoice description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="invoice_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="due_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="subtotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtotal *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Rate (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="discount_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Rate (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="payment_terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Terms</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Payment terms and conditions" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Additional notes" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
                </Button>
              </form>
            </Form>
      </BusinessSheet>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for invoice {selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          <Form {...paymentForm}>
            <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Total Amount: {selectedInvoice && formatCurrency(selectedInvoice.total_amount, selectedInvoice.currency)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Already Paid: {selectedInvoice && formatCurrency(selectedInvoice.paid_amount, selectedInvoice.currency)}
                </div>
                <div className="text-sm font-medium">
                  Amount Due: {selectedInvoice && formatCurrency(selectedInvoice.due_amount, selectedInvoice.currency)}
                </div>
              </div>
              
              <FormField
                control={paymentForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={paymentForm.control}
                name="paid_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPaymentOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={markAsPaidMutation.isPending}>
                  {markAsPaidMutation.isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.paid_value)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total - stats.paid}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.due_value)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Data Table */}
      <InvoicesDataTable 
        data={invoices}
        loading={invoicesLoading}
        onDelete={handleInvoiceDelete}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </div>
  );
}