import { useState, useCallback } from "react";
import { BarChart3 } from "lucide-react";
import type { Product, CostColumn } from "@/types/pricing";
import { PricingTable } from "@/components/dashboard/PricingTable";
import { AnalyticsSidebar } from "@/components/dashboard/AnalyticsSidebar";

const DEFAULT_COLUMNS: CostColumn[] = [
  { id: "base_cost", label: "Base Cost", isDefault: true },
  { id: "shipping", label: "Shipping", isDefault: true },
  { id: "marketing", label: "Marketing", isDefault: true },
];

let nextId = 1;
const makeId = () => `p-${nextId++}`;
const makeColId = () => `col-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [columns, setColumns] = useState<CostColumn[]>(DEFAULT_COLUMNS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addProduct = useCallback(() => {
    const id = makeId();
    setProducts((prev) => [
      ...prev,
      { id, name: "", costs: {}, sellingPrice: 0 },
    ]);
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const addColumn = useCallback((label: string) => {
    setColumns((prev) => [...prev, { id: makeColId(), label, isDefault: false }]);
  }, []);

  const removeColumn = useCallback((id: string) => {
    setColumns((prev) => prev.filter((c) => c.id !== id));
    setProducts((prev) =>
      prev.map((p) => {
        const costs = { ...p.costs };
        delete costs[id];
        return { ...p, costs };
      })
    );
  }, []);

  const selectedProduct = products.find((p) => p.id === selectedId) || null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <BarChart3 size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Pricing Strategy</h1>
            <p className="text-xs text-muted-foreground">3× Golden Rule · Real-time margin analysis</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex gap-6 p-6 items-start">
        <PricingTable
          products={products}
          columns={columns}
          selectedId={selectedId}
          onSelectProduct={setSelectedId}
          onUpdateProduct={updateProduct}
          onAddProduct={addProduct}
          onRemoveProduct={removeProduct}
          onAddColumn={addColumn}
          onRemoveColumn={removeColumn}
        />

        {selectedProduct && (
          <AnalyticsSidebar
            product={selectedProduct}
            columns={columns}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
