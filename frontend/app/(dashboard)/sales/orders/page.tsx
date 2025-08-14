'use client';

import { useState } from 'react';
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Plus } from 'lucide-react';
import { ordersApi, Order, CreateOrderData, type OrderStats } from '@/lib/api/orders';
import { quotesApi } from '@/lib/api/quotes';
import { companiesApi } from '@/lib/api/companies';
import { contactsApi } from '@/lib/api/contacts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { OrdersDataTable } from '@/components/table/orders-data-table';
import { OrderDetailsSheet } from '@/components/sales/order-details-sheet';

const createOrderSchema = z.object({
  company_id: z.number().min(1, 'Company is required'),
  contact_id: z.number().optional(),
  quote_id: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  order_date: z.string().min(1, 'Order date is required'),
  expected_delivery_date: z.string().optional(),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  tax_rate: z.number().min(0).max(100).optional(),
  discount_rate: z.number().min(0).max(100).optional(),
  currency: z.string().optional(),
  shipping_address: z.string().optional(),
  billing_address: z.string().optional(),
  notes: z.string().optional(),
});

export default function OrdersPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getAll(),
  });

  const { data: statsData } = useQuery({
    queryKey: ['orders-stats'],
    queryFn: () => ordersApi.getStats(),
  });

  const { data: companiesData, isLoading: companiesLoading } = useQuery({
    queryKey: ['companies-options'],
    queryFn: () => companiesApi.getOptions(),
  });

  const { data: quotesData } = useQuery({
    queryKey: ['quotes-for-orders'],
    queryFn: () => quotesApi.getAll({ status: 'accepted' }),
  });

  const createMutation = useMutation({
    mutationFn: ordersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
      setIsCreateOpen(false);
      toast.success('Order created successfully!');
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { message?: string } })?.data?.message || 'Failed to create order'
        : 'Failed to create order';
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: ordersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
      toast.success('Order deleted successfully!');
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { message?: string } })?.data?.message || 'Failed to delete order'
        : 'Failed to delete order';
      toast.error(errorMessage);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Order['status'] }) => 
      ordersApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-stats'] });
      toast.success('Order status updated successfully!');
    },
    onError: (error: unknown) => {
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error.response as { data?: { message?: string } })?.data?.message || 'Failed to update order status'
        : 'Failed to update order status';
      toast.error(errorMessage);
    },
  });

  const form = useForm<CreateOrderData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      subtotal: 0,
      tax_rate: 0,
      discount_rate: 0,
      currency: 'USD',
    },
  });

  const selectedCompanyId = form.watch('company_id');
  const selectedQuoteId = form.watch('quote_id');
  
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ['contacts-options', selectedCompanyId],
    queryFn: () => contactsApi.getOptions({ company_id: selectedCompanyId }),
    enabled: !!selectedCompanyId,
  });

  // Auto-fill form when a quote is selected
  const selectedQuote = quotesData?.data?.find((quote: any) => quote.id === selectedQuoteId);
  
  React.useEffect(() => {
    if (selectedQuote) {
      form.setValue('company_id', selectedQuote.company_id);
      form.setValue('contact_id', selectedQuote.contact_id);
      form.setValue('title', selectedQuote.title);
      form.setValue('description', selectedQuote.description);
      form.setValue('subtotal', selectedQuote.subtotal);
      form.setValue('tax_rate', selectedQuote.tax_rate);
      form.setValue('discount_rate', selectedQuote.discount_rate);
      form.setValue('currency', selectedQuote.currency);
      form.setValue('notes', selectedQuote.notes);
    }
  }, [selectedQuote, form]);

  const onSubmit = (data: CreateOrderData) => {
    createMutation.mutate(data);
  };

  const stats: OrderStats = statsData?.stats || {
    total: 0,
    pending: 0,
    confirmed: 0,
    delivered: 0,
    total_value: 0,
  };

  const orders: Order[] = ordersData?.data || [];

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleOrderDelete = (orderId: number) => {
    deleteMutation.mutate(orderId);
  };

  const handleStatusChange = (orderId: number, newStatus: Order['status']) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleViewDetails = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsDetailsSheetOpen(true);
  };


  const handleOrderUpdate = (updatedOrder: Order) => {
    queryClient.setQueryData(['orders'], (oldData: unknown) => {
      if (!oldData || typeof oldData !== 'object' || !('data' in oldData)) return oldData;
      const typedOldData = oldData as { data: Order[] };
      return {
        ...typedOldData,
        data: typedOldData.data.map((order: Order) => 
          order.id === updatedOrder.id ? updatedOrder : order
        )
      };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage sales orders and fulfillment
          </p>
        </div>
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </SheetTrigger>
          <SheetContent className="px-6 overflow-y-auto" style={{ width: '50vw', maxWidth: '50vw' }}>
            <SheetHeader>
              <SheetTitle>Create New Order</SheetTitle>
              <SheetDescription>
                Create a new sales order from scratch or from an accepted quote.
              </SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
                <FormField
                  control={form.control}
                  name="quote_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Quote (Optional)</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a quote to auto-fill" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Create from scratch</SelectItem>
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
                        <Input placeholder="Order title" {...field} />
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
                        <Textarea placeholder="Order description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="order_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expected_delivery_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected Delivery</FormLabel>
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
                  name="shipping_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Shipping address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="billing_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Billing address" {...field} />
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
                  {createMutation.isPending ? 'Creating...' : 'Create Order'}
                </Button>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total_value)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Data Table */}
      <OrdersDataTable 
        data={orders}
        loading={ordersLoading}
        onDelete={handleOrderDelete}
        onStatusChange={handleStatusChange}
        onViewDetails={handleViewDetails}
      />

      {/* Order Details Sheet */}
      <OrderDetailsSheet 
        open={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
        orderId={selectedOrderId}
        onOrderUpdate={handleOrderUpdate}
      />
    </div>
  );
}