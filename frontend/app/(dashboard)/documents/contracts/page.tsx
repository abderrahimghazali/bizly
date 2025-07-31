export default function ContractsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Contracts</h1>
        <p className="text-muted-foreground">
          Manage your business contracts and agreements
        </p>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No contracts yet</h3>
        <p className="text-sm text-muted-foreground">
          Upload your first contract to get started
        </p>
      </div>
    </div>
  )
}