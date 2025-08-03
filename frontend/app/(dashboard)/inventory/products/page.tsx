export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground">
          Manage product catalog and inventory
        </p>
      </div>
      
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground">
          The Products module is under development and will be available soon.
        </p>
      </div>
    </div>
  );
}