export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">
          Generate and view business reports and analytics
        </p>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No reports generated yet</h3>
        <p className="text-sm text-muted-foreground">
          Generate your first report to get insights
        </p>
      </div>
    </div>
  )
}