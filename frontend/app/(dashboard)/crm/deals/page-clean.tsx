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
import { FormSheet } from '@/components/ui/business-sheet';
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
  
  // View details state
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [dealToView, setDealToView] = useState<Deal | null>(null);
  
  // Form data for new deal
  const [formData, setFormData] = useState<CreateDealData>({
    title: '',
    description: '',
    amount: 0,
    probability: 50,
    stage: 'prospecting',
    company_id: null,
    contact_id: null,
    assigned_to: null,
    expected_close_date: '',
    source: '',
    notes: '',
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchDeals(),
        fetchStats(),
        fetchCompanies(),
        fetchContacts(),
        fetchAssignableUsers(),
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await dealsApi.getAll();
      setDeals(response.deals);
      setFilteredDeals(response.deals);
    } catch (error) {
      console.error('Failed to fetch deals:', error);
      toast.error('Failed to load deals');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await dealsApi.getStats();
      setStats(response);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companiesApi.getOptions();
      setCompanies(response);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await contactsApi.getOptions();
      setContacts(response);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    }
  };

  const fetchAssignableUsers = async () => {
    try {
      const response = await dealsApi.getAssignableUsers();
      setAssignableUsers(response);
    } catch (error) {
      console.error('Failed to fetch assignable users:', error);
    }
  };

  // Apply filters function
  const applyFilters = () => {
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
  };

  // Apply filters when search term or filters change
  useEffect(() => {
    applyFilters();
  }, [deals, searchTerm, stageFilter, sourceFilter]);

  const handleInputChange = (field: keyof CreateDealData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await dealsApi.create(formData);
      if (response.deal) {
        setDeals(prev => [response.deal, ...prev]);
        toast.success('Deal created successfully!');
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        amount: 0,
        probability: 50,
        stage: 'prospecting',
        company_id: null,
        contact_id: null,
        assigned_to: null,
        expected_close_date: '',
        source: '',
        notes: '',
      });
      setSelectedCompany(null);
      setSheetOpen(false);
    } catch (error: unknown) {
      console.error('Failed to save deal:', error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save deal');
    } finally {
      setSubmitting(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
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
        
        <Button onClick={() => setSheetOpen(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          New Deal
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <IconBriefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_deals}</div>
              <p className="text-xs text-muted-foreground">
                Active opportunities
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.total_value)}</div>
              <p className="text-xs text-muted-foreground">
                Total opportunity value
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Won This Month</CardTitle>
              <IconTarget className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.won_this_month}</div>
              <p className="text-xs text-muted-foreground">
                Closed deals
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Deal Size</CardTitle>
              <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.average_deal_size)}</div>
              <p className="text-xs text-muted-foreground">
                Per closed deal
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconBriefcase className="mr-2 h-5 w-5" />
            Sales Pipeline
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
                {Object.entries(dealSources).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
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

      {/* Create Deal Form Sheet */}
      <FormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            setFormData({
              title: '',
              description: '',
              amount: 0,
              probability: 50,
              stage: 'prospecting',
              company_id: null,
              contact_id: null,
              assigned_to: null,
              expected_close_date: '',
              source: '',
              notes: '',
            });
            setSelectedCompany(null);
          }
        }}
        title="Create New Deal"
        description="Add a new deal to your sales pipeline"
        size="wide"
        onSubmit={handleFormSubmit}
        submitLabel="Create Deal"
        isSubmitting={submitting}
      >
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
              onValueChange={(value) => {
                const companyId = parseInt(value);
                handleInputChange('company_id', companyId);
                setSelectedCompany(companyId);
                handleInputChange('contact_id', null);
              }}
            >
              <SelectTrigger>
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
            <Label htmlFor="contact">Contact</Label>
            <Select 
              value={formData.contact_id?.toString() || ''} 
              onValueChange={(value) => handleInputChange('contact_id', parseInt(value))}
              disabled={!selectedCompany}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedCompany ? "Select contact" : "Select a company first"} />
              </SelectTrigger>
              <SelectContent>
                {contacts
                  .filter(contact => contact.company_id === selectedCompany)
                  .map((contact) => (
                    <SelectItem key={contact.id} value={contact.id.toString()}>
                      {contact.full_name} {contact.position && `(${contact.position})`}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="assignee">Assign To</Label>
            <Select 
              value={formData.assigned_to?.toString() || ''} 
              onValueChange={(value) => handleInputChange('assigned_to', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {assignableUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expected_close_date">Expected Close Date</Label>
            <Input
              id="expected_close_date"
              type="date"
              value={formData.expected_close_date}
              onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="source">Source</Label>
            <Select value={formData.source || ''} onValueChange={(value) => handleInputChange('source', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(dealSources).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
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
      </FormSheet>
    </div>
  );
}