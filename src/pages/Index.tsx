import { useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";
import { PricingTable } from "@/components/dashboard/PricingTable";
import { AnalyticsSidebar } from "@/components/dashboard/AnalyticsSidebar";
import { usePricingData } from "@/hooks/usePricingData";

const Index = () => {
  const {
    products, columns, loading,
    addProduct, removeProduct, updateProduct,
    addColumn, removeColumn,
  } = usePricingData();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedId) || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
            <BarChart3 size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">استراتيجية التسعير</h1>
            <p className="text-xs text-muted-foreground">قاعدة 3× الذهبية · تحليل الهوامش الفورية</p>
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
