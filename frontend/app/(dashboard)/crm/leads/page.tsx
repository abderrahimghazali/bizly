'use client';

import { useState, useEffect, useCallback } from 'react';
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
  IconTargetArrow, 
  IconPlus, 
  IconSearch,
  IconCircleCheck,
  IconTrendingUp
} from '@tabler/icons-react';
import { FormSheet } from '@/components/ui/business-sheet';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Lead, leadsApi, CreateLeadData } from '@/lib/api/leads';
import { LeadsDataTable } from '@/components/table';
import { LeadConversionModal, LeadDetailsSheet } from '@/components/crm';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Lead conversion modal state
  const [conversionModalOpen, setConversionModalOpen] = useState(false);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  

  
  // View details state
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [leadToView, setLeadToView] = useState<Lead | null>(null);
  
  // Form data for new lead
  const [formData, setFormData] = useState<CreateLeadData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new',
    source: '',
    value: 0,
    notes: '',
  });

  // Fetch leads from API
  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadsApi.getAll();
      setLeads(response.leads);
      setFilteredLeads(response.leads);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters function
  const applyFilters = useCallback(() => {
    let filtered = leads;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(lead => lead.source === sourceFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, sourceFilter]);

  // Apply filters when search term or filters change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await leadsApi.create(formData);
      if (response.lead) {
        setLeads(prev => [response.lead, ...prev]);
        toast.success('Lead created successfully!');
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'new',
        source: '',
        value: 0,
        notes: '',
      });
      
      setSheetOpen(false);
    } catch (error: unknown) {
      console.error('Failed to save lead:', error);
      toast.error((error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to save lead');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateLeadData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const handleConvertLead = (lead: Lead) => {
    setLeadToConvert(lead);
    setConversionModalOpen(true);
  };

  const handleConversionComplete = (_result: unknown) => {
    setConversionModalOpen(false);
    setLeadToConvert(null);
    fetchLeads(); // Refresh leads to show updated status
  };

  const handleViewDetails = (lead: Lead) => {
    setLeadToView(lead);
    setDetailsSheetOpen(true);
  };

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads(prev => prev.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    ));
    setFilteredLeads(prev => prev.map(lead => 
      lead.id === updatedLead.id ? updatedLead : lead
    ));
  };

  // Calculate stats
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;

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
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Track and manage your potential customers and sales prospects
          </p>
        </div>
        
          <Button onClick={() => setSheetOpen(true)}>
            <IconPlus className="mr-2 h-4 w-4" />
            New Lead
          </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <IconTargetArrow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">
              Active prospects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualified</CardTitle>
            <IconCircleCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualifiedLeads}</div>
            <p className="text-xs text-muted-foreground">
              Ready for sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Potential revenue
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Lead to customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="proposal">Proposal</SelectItem>
                <SelectItem value="negotiation">Negotiation</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
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

        {/* Leads Data Table */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading leads...</p>
          </div>
        ) : (
          <LeadsDataTable 
            data={filteredLeads} 
            onDataChange={(updatedData) => {
              setLeads(updatedData);
              setFilteredLeads(updatedData);
            }}
            onConvertLead={handleConvertLead}
            onViewDetails={handleViewDetails}
          />
        )}
      </div>

      {/* Lead Conversion Modal */}
      <LeadConversionModal
        open={conversionModalOpen}
        onOpenChange={setConversionModalOpen}
        lead={leadToConvert}
        onConversionComplete={handleConversionComplete}
      />

      {/* Lead Details Sheet */}
      <LeadDetailsSheet
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        leadId={leadToView?.id || null}
        onLeadUpdate={handleLeadUpdate}
      />

      {/* Create Lead Form Sheet */}
      <FormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) {
            // Reset form when closing
            setFormData({
              name: '',
              email: '',
              phone: '',
              company: '',
              status: 'new',
              source: '',
              value: 0,
              notes: '',
            });
          }
        }}
        title="Create New Lead"
        description="Add a new lead to your sales pipeline"
        size="wide"
        onSubmit={handleFormSubmit}
        submitLabel="Create Lead"
        isSubmitting={submitting}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Lead Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter lead name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="lead@example.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              placeholder="Company name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
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
              <Label htmlFor="value">Value ($)</Label>
              <Input
                id="value"
                type="number"
                min="0"
                step="0.01"
                value={formData.value}
                onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="source">Source</Label>
            <Select value={formData.source} onValueChange={(value) => handleInputChange('source', value)}>
              <SelectTrigger>
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this lead"
              rows={3}
            />
          </div>
        </div>
      </FormSheet>
    </div>
  );
}