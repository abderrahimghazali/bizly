export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-muted-foreground">
          Create and manage document templates for quick reuse
        </p>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No templates created yet</h3>
        <p className="text-sm text-muted-foreground">
          Create your first template to streamline document creation
        </p>
      </div>
    </div>
  )
}