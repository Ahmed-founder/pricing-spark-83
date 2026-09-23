import { useState } from "react";
import { BarChart3, Loader2, Sun, Moon, CircleDollarSign } from "lucide-react";
import { Button } from "@cloudflare/kumo";
import { PricingTable } from "@/components/dashboard/PricingTable";
import { AnalyticsSidebar } from "@/components/dashboard/AnalyticsSidebar";
import { usePricingData } from "@/hooks/usePricingData";
import { useTheme } from "@/hooks/useTheme";

const Index = () => {
  const {
    products, columns, sections, loading,
    addProduct, removeProduct, updateProduct,
    addColumn, removeColumn,
    addSection, updateSection, removeSection,
    moveProductToSection,
  } = usePricingData();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { isDark, toggle: toggleTheme } = useTheme();

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
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CircleDollarSign size={20} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground">استراتيجية التسعير</h1>
              <p className="text-xs text-muted-foreground">تسعير المنتجات وتحليل الهوامش</p>
            </div>
          </div>
          <Button
            onClick={toggleTheme}
            variant="secondary"
            shape="square"
            size="sm"
            aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
            title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1800px] flex-col items-start gap-5 p-4 sm:p-6 xl:flex-row">
        <PricingTable
          products={products}
          columns={columns}
          sections={sections}
          selectedId={selectedId}
          onSelectProduct={setSelectedId}
          onUpdateProduct={updateProduct}
          onAddProduct={addProduct}
          onRemoveProduct={removeProduct}
          onAddColumn={addColumn}
          onRemoveColumn={removeColumn}
          onAddSection={addSection}
          onUpdateSection={updateSection}
          onRemoveSection={removeSection}
          onMoveProduct={moveProductToSection}
        />

        {selectedProduct && (
          <AnalyticsSidebar
            product={selectedProduct}
            columns={columns}
            onClose={() => setSelectedId(null)}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
