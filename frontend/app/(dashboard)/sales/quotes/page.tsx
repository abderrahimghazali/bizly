'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Plus } from 'lucide-react';
import { quotesApi, Quote, CreateQuoteData, quoteStatuses, currencies, type QuoteStats } from '@/lib/api/quotes';
import { companiesApi } from '@/lib/api/companies';
import { contactsApi } from '@/lib/api/contacts';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { QuotesDataTable } from '@/components/table/quotes-data-table';
import { QuoteDetailsSheet } from '@/components/sales/quote-details-sheet';

const createQuoteSchema = z.object({
  company_id: z.number().min(1, 'Company is required'),
  contact_id: z.number().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  quote_date: z.string().min(1, 'Quote date is required'),
  expiry_date: z.string().min(1, 'Expiry date is required'),
  subtotal: z.number().min(0, 'Subtotal must be positive'),
  tax_rate: z.number().min(0).max(100).optional(),
  discount_rate: z.number().min(0).max(100).optional(),
  currency: z.string().optional(),
  terms_conditions: z.string().optional(),  
  notes: z.string().optional(),
});

export default function QuotesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: quotesData, isLoading: quotesLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: () => quotesApi.getAll(),
  });

  const { data: statsData } = useQuery({
    queryKey: ['quotes-stats'],
    queryFn: () => quotesApi.getStats(),
  });

  const { data: companiesData, isLoading: companiesLoading, error: companiesError } = useQuery({
    queryKey: ['companies-options'],
    queryFn: () => companiesApi.getOptions(),
  });

  const createMutation = useMutation({
    mutationFn: quotesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quotes-stats'] });
      setIsCreateOpen(false);
      toast.success('Quote created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create quote');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: quotesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['quotes-stats'] });
      toast.success('Quote deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete quote');
    },
  });

  const form = useForm<CreateQuoteData>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      subtotal: 0,
      tax_rate: 0,
      discount_rate: 0,
      currency: 'USD',
    },
  });

  const selectedCompanyId = form.watch('company_id');
  
  const { data: contactsData, isLoading: contactsLoading, error: contactsError } = useQuery({
    queryKey: ['contacts-options', selectedCompanyId],
    queryFn: () => contactsApi.getOptions({ company_id: selectedCompanyId }),
    enabled: !!selectedCompanyId,
  });

  const onSubmit = (data: CreateQuoteData) => {
    createMutation.mutate(data);
  };


  const stats: QuoteStats = statsData?.stats || {
    total: 0,
    draft: 0,
    sent: 0,
    accepted: 0,
    total_value: 0,
  };

  const quotes: Quote[] = quotesData?.data || [];

  const handleQuoteDelete = (quoteId: number) => {
    deleteMutation.mutate(quoteId);
  };

  const handleViewDetails = (quoteId: number) => {
    setSelectedQuoteId(quoteId);
    setIsDetailsSheetOpen(true);
  };


  const handleQuoteUpdate = (updatedQuote: Quote) => {
    queryClient.setQueryData(['quotes'], (oldData: any) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: oldData.data.map((quote: Quote) => 
          quote.id === updatedQuote.id ? updatedQuote : quote
        )
      };
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quotes</h1>
          <p className="text-muted-foreground">
            Manage sales quotes and proposals
          </p>
        </div>
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Quote
            </Button>
          </SheetTrigger>
          <SheetContent className="px-6 overflow-y-auto" style={{ width: '50vw', maxWidth: '50vw' }}>
            <SheetHeader>
              <SheetTitle>Create New Quote</SheetTitle>
              <SheetDescription>
                Create a new sales quote for a customer.
              </SheetDescription>
            </SheetHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-6">
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
                          // Clear contact selection when company changes
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
                        <Input placeholder="Quote title" {...field} />
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
                        <Textarea placeholder="Quote description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quote_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quote Date *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiry_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date *</FormLabel>
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
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
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
                  name="terms_conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms & Conditions</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Terms and conditions" {...field} />
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
                  {createMutation.isPending ? 'Creating...' : 'Create Quote'}
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
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total_value)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quotes Data Table */}
      <QuotesDataTable 
        data={quotes}
        loading={quotesLoading}
        onDelete={handleQuoteDelete}
        onViewDetails={handleViewDetails}
      />

      {/* Quote Details Sheet */}
      <QuoteDetailsSheet 
        open={isDetailsSheetOpen}
        onOpenChange={setIsDetailsSheetOpen}
        quoteId={selectedQuoteId}
        onQuoteUpdate={handleQuoteUpdate}
      />
    </div>
  );
}