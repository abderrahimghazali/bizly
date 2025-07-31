import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  IconFileDescription, 
  IconFileText, 
  IconReceipt, 
  IconChartBar, 
  IconTemplate,
  IconPlus,
  IconUpload
} from "@tabler/icons-react"

export default function DocumentsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Documents</h1>
        <p className="text-muted-foreground">
          Store and organize your business documents efficiently
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Button>
          <IconPlus className="mr-2 h-4 w-4" />
          New Document
        </Button>
        <Button variant="outline">
          <IconUpload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts</CardTitle>
            <IconFileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Active agreements
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <IconReceipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Pending and paid
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <IconChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Analytics & insights
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <IconTemplate className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Ready to use
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconFileDescription className="h-5 w-5" />
            Recent Documents
          </CardTitle>
          <CardDescription>
            Your most recently accessed files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <IconFileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Service Agreement - ABC Corp</p>
                  <p className="text-sm text-muted-foreground">Modified 2 hours ago</p>
                </div>
              </div>
              <Badge variant="secondary">Contract</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <IconReceipt className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Invoice #INV-2024-001</p>
                  <p className="text-sm text-muted-foreground">Created yesterday</p>
                </div>
              </div>
              <Badge variant="secondary">Invoice</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center space-x-3">
                <IconChartBar className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Q4 Performance Report</p>
                  <p className="text-sm text-muted-foreground">Created 3 days ago</p>
                </div>
              </div>
              <Badge variant="secondary">Report</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}