export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">
          Track and manage your business invoices
        </p>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
        <p className="text-sm text-muted-foreground">
          Create your first invoice to get started
        </p>
      </div>
    </div>
  )
}