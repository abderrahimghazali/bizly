'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  IconBriefcase, 
  IconPlus, 
  IconSearch,
  IconTrendingUp,
  IconCurrencyDollar,
  IconTarget,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { Deal, dealsApi, CreateDealData, dealStages, dealSources, DealStats, AssignableUser } from '@/lib/api/deals';
import { companiesApi, CompanyOption } from '@/lib/api/companies';
import { contactsApi, ContactOption } from '@/lib/api/contacts';
import { DealsDataTable } from '@/components/table';
import { DealDetailsSheet } from '@/components/crm';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DealStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // CRM data for dropdowns
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  
  // Deal details sheet state
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [dealToView, setDealToView] = useState<Deal | null>(null);
  
  // Form data for new deal
  const [formData, setFormData] = useState<CreateDealData>({
    title: '',
    description: '',
    amount: 0,
    probability: 50,
    stage: 'qualified',
    expected_close_date: '',
    source: '',
    notes: '',
    company_id: undefined,
    contact_id: undefined,
  });

  // Fetch deals and stats from API
  useEffect(() => {
    fetchDeals();
    fetchStats();
    fetchCompanies();
    fetchAssignableUsers();
  }, []);

  // Fetch contacts when company is selected
  useEffect(() => {
    if (selectedCompany) {
      fetchContacts(selectedCompany);
    } else {
      setContacts([]);
    }
  }, [selectedCompany]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await dealsApi.getAll();
      setDeals(response.deals);
      setFilteredDeals(response.deals);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await dealsApi.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch deal stats:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companiesApi.getOptions();
      setCompanies(response);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
      toast.error('Failed to load companies');
    }
  };

  const fetchContacts = async (companyId: number) => {
    try {
      const response = await contactsApi.getOptions({ company_id: companyId });
      setContacts(response);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      toast.error('Failed to load contacts');
    }
  };

  const fetchAssignableUsers = async () => {
    try {
      const response = await dealsApi.getAssignableUsers();
      setAssignableUsers(response.users);
    } catch (error) {
      console.error('Failed to fetch assignable users:', error);
      toast.error('Failed to load assignable users');
    }
  };

  const handleAssignDeal = async (dealId: number, userId: number | null) => {
    try {
      await dealsApi.update(dealId, { assigned_to: userId });
      // Update local state
      setDeals(prev => prev.map(deal => 
        deal.id === dealId 
          ? { 
              ...deal, 
              assigned_to: userId,
              assigned_user: userId ? assignableUsers.find(u => u.id === userId) : undefined 
            }
          : deal
      ));
      setFilteredDeals(prev => prev.map(deal => 
        deal.id === dealId 
          ? { 
              ...deal, 
              assigned_to: userId,
              assigned_user: userId ? assignableUsers.find(u => u.id === userId) : undefined 
            }
          : deal
      ));
      toast.success('Deal assignment updated successfully');
    } catch (error) {
      console.error('Failed to assign deal:', error);
      toast.error('Failed to update deal assignment');
    }
  };

  const handleViewDetails = (deal: Deal) => {
    setDealToView(deal);
    setDetailsSheetOpen(true);
  };

  const handleDealUpdate = (updatedDeal: Deal) => {
    setDeals(prev => prev.map(deal => 
      deal.id === updatedDeal.id ? updatedDeal : deal
    ));
    setFilteredDeals(prev => prev.map(deal => 
      deal.id === updatedDeal.id ? updatedDeal : deal
    ));
  };

  // Filter deals based on search and filters
  useEffect(() => {
    let filtered = deals;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(deal => 
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (deal.company && deal.company.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Stage filter
    if (stageFilter !== 'all') {
      filtered = filtered.filter(deal => deal.stage === stageFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(deal => deal.source === sourceFilter);
    }

    setFilteredDeals(filtered);
  }, [deals, searchTerm, stageFilter, sourceFilter]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.expected_close_date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const response = await dealsApi.create(formData);
      
      if (response.success) {
        const newDeals = [...deals, response.deal];
        setDeals(newDeals);
        setFilteredDeals(newDeals);
        toast.success('Deal created successfully!');
        setSheetOpen(false);
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          amount: 0,
          probability: 50,
          stage: 'qualified',
          expected_close_date: '',
          source: '',
          notes: '',
          company_id: undefined,
          contact_id: undefined,
        });
        setSelectedCompany(null);
        setContacts([]);
        
        // Refresh stats
        fetchStats();
      } else {
        toast.error(response.message || 'Failed to create deal');
      }
    } catch (error: unknown) {
      console.error('Failed to create deal:', error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create deal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateDealData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If company is being changed, update selected company and reset contact
    if (field === 'company_id') {
      const companyId = value as number;
      setSelectedCompany(companyId);
      setFormData(prev => ({ ...prev, contact_id: undefined }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">
            Manage your sales pipeline and track deal progress
          </p>
        </div>
        
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader className="px-6 py-6">
              <SheetTitle>Create New Deal</SheetTitle>
              <SheetDescription>
                Add a new deal to your sales pipeline
              </SheetDescription>
            </SheetHeader>
            
            <form onSubmit={handleFormSubmit} className="px-6 pb-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Deal Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter deal title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description" 
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Deal description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount ($) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="probability">Probability (%)</Label>
                    <Input
                      id="probability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => handleInputChange('probability', parseInt(e.target.value) || 50)}
                      placeholder="50"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Select value={formData.stage} onValueChange={(value: Deal['stage']) => handleInputChange('stage', value)}>
                    <SelectTrigger>
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
                  <Label htmlFor="company">Company</Label>
                  <Select 
                    value={formData.company_id?.toString() || ''} 
                    onValueChange={(value) => handleInputChange('company_id', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
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

                <div>
                  <Label htmlFor="contact">Primary Contact</Label>
                  <Select 
                    value={formData.contact_id?.toString() || ''} 
                    onValueChange={(value) => handleInputChange('contact_id', parseInt(value))}
                    disabled={!selectedCompany}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedCompany ? "Select contact" : "Select company first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id.toString()}>
                          {contact.name} {contact.position && `(${contact.position})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="expected_close_date">Expected Close Date *</Label>
                  <Input
                    id="expected_close_date"
                    type="date"
                    value={formData.expected_close_date}
                    onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={formData.source || ''} onValueChange={(value) => handleInputChange('source', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {dealSources.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes about this deal"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? 'Creating...' : 'Create Deal'}
                </Button>
                <SheetClose asChild>
                  <Button variant="outline" className="flex-1">Cancel</Button>
                </SheetClose>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pipeline
              </CardTitle>
              <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_value)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_deals} deal{stats.total_deals !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Weighted Pipeline
              </CardTitle>
              <IconTarget className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.weighted_pipeline)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.open_deals} open deal{stats.open_deals !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Won Deals
              </CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.won_value)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.won_deals} won • {stats.conversion_rate.toFixed(1)}% rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overdue Deals
              </CardTitle>
              <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overdue_deals}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconBriefcase className="mr-2 h-5 w-5" />
            Deals Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search deals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {Object.entries(dealStages).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {dealSources.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deals Data Table */}
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading deals...</p>
            </div>
          ) : (
            <DealsDataTable 
              data={filteredDeals}
              assignableUsers={assignableUsers}
              onDataChange={(updatedData) => {
                setDeals(updatedData);
                setFilteredDeals(updatedData);
                fetchStats(); // Refresh stats when data changes
              }}
              onAssignDeal={handleAssignDeal}
              onViewDetails={handleViewDetails}
            />
          )}
        </CardContent>
      </Card>

      {/* Deal Details Sheet */}
      <DealDetailsSheet
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        dealId={dealToView?.id || null}
        assignableUsers={assignableUsers}
        onDealUpdate={handleDealUpdate}
      />
    </div>
  );
}