"use client"

import { useAuth } from "@/lib/hooks/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  IconCurrencyDollar, 
  IconTrendingUp, 
  IconTrendingDown,
  IconCalendarTime,
  IconTarget,
  IconAlertTriangle,
  IconUsers,
  IconBuilding,
  IconFileText,
  IconChartBar,
  IconArrowUpRight,
  IconArrowDownRight,
  IconClock,
  IconRefresh
} from "@tabler/icons-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

// Demo data
const revenueData = [
  { month: 'Jan', revenue: 45000, target: 50000 },
  { month: 'Feb', revenue: 52000, target: 55000 },
  { month: 'Mar', revenue: 48000, target: 58000 },
  { month: 'Apr', revenue: 61000, target: 60000 },
  { month: 'May', revenue: 58000, target: 62000 },
  { month: 'Jun', revenue: 67000, target: 65000 },
]

const dealsPipeline = [
  { name: 'Qualified', value: 15, amount: 150000, color: '#3b82f6' },
  { name: 'Proposal', value: 8, amount: 280000, color: '#f59e0b' },
  { name: 'Negotiation', value: 5, amount: 320000, color: '#ef4444' },
  { name: 'Closed Won', value: 12, amount: 450000, color: '#10b981' },
]

const leadsConversion = [
  { stage: 'Leads', count: 120, percentage: 100 },
  { stage: 'Qualified', count: 48, percentage: 40 },
  { stage: 'Proposal', count: 24, percentage: 20 },
  { stage: 'Closed', count: 12, percentage: 10 },
]

const quotesToRelaunch = [
  { id: 1, company: 'Acme Corp', amount: 45000, daysOverdue: 5, priority: 'high' },
  { id: 2, company: 'Tech Solutions', amount: 28000, daysOverdue: 12, priority: 'medium' },
  { id: 3, company: 'Global Inc', amount: 67000, daysOverdue: 8, priority: 'high' },
  { id: 4, company: 'StartupXYZ', amount: 15000, daysOverdue: 3, priority: 'low' },
]

export default function DashboardPage() {
  const { user } = useAuth()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact'
    }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-6 border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Hello {user?.name || "User"}! 👋
            </h1>
            <p className="text-muted-foreground text-lg">
              Your business overview for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Badge variant="secondary" className="px-3 py-1">
              <IconTrendingUp className="w-3 h-3 mr-1" />
              Revenue +12%
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <IconCurrencyDollar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$67,000</div>
            <div className="flex items-center text-xs text-green-600">
              <IconArrowUpRight className="w-3 h-3 mr-1" />
              +12% from last month
            </div>
            <Progress value={103} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Target: $65,000</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <IconTarget className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">$1.2M</div>
            <div className="flex items-center text-xs text-red-600">
              <IconArrowDownRight className="w-3 h-3 mr-1" />
              -5% from last month
            </div>
            <div className="text-xs text-muted-foreground mt-1">28 active deals</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">10%</div>
            <div className="flex items-center text-xs text-green-600">
              <IconArrowUpRight className="w-3 h-3 mr-1" />
              +2% from last month
            </div>
            <div className="text-xs text-muted-foreground mt-1">12 of 120 leads closed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Quotes</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">4</div>
            <div className="text-xs text-red-600">$155K total value</div>
            <div className="text-xs text-muted-foreground mt-1">Avg. 7 days overdue</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Target</CardTitle>
            <CardDescription>Monthly performance tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="target" stackId="1" stroke="#e5e7eb" fill="#f3f4f6" />
                <Area type="monotone" dataKey="revenue" stackId="2" stroke="#3b82f6" fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pipeline Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Deals Pipeline</CardTitle>
            <CardDescription>Distribution by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dealsPipeline}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dealsPipeline.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [
                  `${value} deals (${formatCurrency(props.payload.amount)})`,
                  name
                ]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {dealsPipeline.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Conversion Funnel</CardTitle>
            <CardDescription>Conversion rates by stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadsConversion} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quotes to Relaunch */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Quotes to Relaunch</span>
              <Button size="sm" variant="outline">
                <IconRefresh className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardTitle>
            <CardDescription>Overdue quotes requiring follow-up</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quotesToRelaunch.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <IconBuilding className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{quote.company}</span>
                      <Badge variant={quote.priority === 'high' ? 'destructive' : quote.priority === 'medium' ? 'default' : 'secondary'}>
                        {quote.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <span>{formatCurrency(quote.amount)}</span>
                      <div className="flex items-center">
                        <IconClock className="w-3 h-3 mr-1" />
                        {quote.daysOverdue} days overdue
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Follow up
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="h-5 w-5" />
              CRM Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <IconUsers className="mr-2 h-4 w-4" />
              Add New Lead
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <IconBuilding className="mr-2 h-4 w-4" />
              Create Company
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <IconTarget className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFileText className="h-5 w-5" />
              Sales Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <IconFileText className="mr-2 h-4 w-4" />
              Generate Quote
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <IconCalendarTime className="mr-2 h-4 w-4" />
              Schedule Follow-up
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <IconChartBar className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
            <CardDescription>High priority items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Follow up: Acme Corp</p>
                <p className="text-xs text-muted-foreground">Quote expires today</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Demo: Tech Solutions</p>
                <p className="text-xs text-muted-foreground">2:00 PM scheduled</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Contract review</p>
                <p className="text-xs text-muted-foreground">Global Inc deal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}