import { useState, useCallback } from "react";
import { Plus, Trash2, Columns3, Package } from "lucide-react";
import type { Product, CostColumn } from "@/types/pricing";
import { getTotalCost, getPriceStatus } from "@/types/pricing";
import { useDragScroll } from "@/hooks/useDragScroll";
import { Switch } from "@/components/ui/switch";

const DISCOUNT_RATES = [10, 15, 20, 30, 40];

interface Props {
  products: Product[];
  columns: CostColumn[];
  selectedId: string | null;
  onSelectProduct: (id: string | null) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onAddProduct: () => void;
  onRemoveProduct: (id: string) => void;
  onAddColumn: (label: string, includedInFormula: boolean) => void;
  onRemoveColumn: (id: string) => void;
}

export function PricingTable({
  products, columns, selectedId,
  onSelectProduct, onUpdateProduct,
  onAddProduct, onRemoveProduct,
  onAddColumn, onRemoveColumn,
}: Props) {
  const [newColName, setNewColName] = useState("");
  const [newColInFormula, setNewColInFormula] = useState(false);
  const [showColInput, setShowColInput] = useState(false);
  const scrollRef = useDragScroll();

  const handleAddColumn = useCallback(() => {
    if (newColName.trim()) {
      onAddColumn(newColName.trim(), newColInFormula);
      setNewColName("");
      setNewColInFormula(false);
      setShowColInput(false);
    }
  }, [newColName, newColInFormula, onAddColumn]);

  const setCost = (productId: string, colId: string, value: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    onUpdateProduct(productId, {
      costs: { ...product.costs, [colId]: parseFloat(value) || 0 },
    });
  };

  return (
    <div className="flex-1 min-w-0 space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={onAddProduct}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> إضافة منتج
        </button>

        {showColInput ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
              placeholder="اسم العمود..."
              className="px-3 py-2 rounded-lg bg-muted text-foreground text-sm border border-border focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Switch
                checked={newColInFormula}
                onCheckedChange={setNewColInFormula}
                className="scale-75"
              />
              <span>ضمن المعادلة</span>
            </div>
            <button onClick={handleAddColumn} className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              إضافة
            </button>
            <button onClick={() => { setShowColInput(false); setNewColName(""); setNewColInFormula(false); }} className="text-muted-foreground hover:text-foreground text-sm">
              إلغاء
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowColInput(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Columns3 size={16} /> إضافة عامل تكلفة
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <div ref={scrollRef} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground w-8"></th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[180px]">اسم المنتج</th>
                {columns.map((col) => (
                  <th key={col.id} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[120px]">
                    <div className="flex items-center justify-start gap-1">
                      {col.label}
                      {!col.includedInFormula && (
                        <span className="text-[10px] text-muted-foreground/50 font-normal">(معلوماتي)</span>
                      )}
                      {!col.isDefault && (
                        <button onClick={() => onRemoveColumn(col.id)} className="text-muted-foreground hover:text-destructive transition-colors mr-1">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[100px]">إجمالي التكلفة</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-primary min-w-[110px]">السعر المثالي</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[140px]">سعر البيع</th>
                {DISCOUNT_RATES.map((rate) => (
                  <th key={rate} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[120px]">
                    قبل خصم {rate}%
                  </th>
                ))}
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 5} className="text-center py-16 text-muted-foreground">
                    <Package size={32} className="mx-auto mb-2 opacity-40" />
                    <p>لا توجد منتجات بعد. أضف منتجاً للبدء.</p>
                  </td>
                </tr>
              )}
              {products.map((product) => {
                const totalCost = getTotalCost(product, columns);
                const idealPrice = totalCost * 3;
                const status = getPriceStatus(product.sellingPrice, totalCost);
                const isSelected = selectedId === product.id;

                return (
                  <tr
                    key={product.id}
                    onClick={() => onSelectProduct(isSelected ? null : product.id)}
                    className={`border-b border-border cursor-pointer transition-colors ${
                      isSelected ? "bg-accent/60" : "hover:bg-muted/30"
                    }`}
                  >
                    <td className="px-4 py-2">
                      <div className={`w-2 h-2 rounded-full ${
                        status === "green" ? "bg-status-emerald" :
                        status === "amber" ? "bg-status-amber" :
                        "bg-status-crimson"
                      }`} />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={product.name}
                        onChange={(e) => onUpdateProduct(product.id, { name: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="اسم المنتج..."
                        className="w-full bg-transparent text-foreground focus:outline-none placeholder:text-muted-foreground/50 text-right"
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col.id} className="px-4 py-2 text-left">
                        <div className="flex items-center justify-start">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={product.costs[col.id] || ""}
                            onChange={(e) => setCost(product.id, col.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="0.00"
                            className="w-20 bg-transparent text-left font-mono-nums text-foreground focus:outline-none placeholder:text-muted-foreground/40"
                          />
                          <span className="text-muted-foreground mr-1">ر.س</span>
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-2 text-left font-mono-nums font-semibold text-foreground">
                      {totalCost.toFixed(2)} ر.س
                    </td>
                    <td className="px-4 py-2 text-left font-mono-nums font-semibold text-primary">
                      {idealPrice.toFixed(2)} ر.س
                    </td>
                    <td className="px-4 py-2 text-left">
                      <div className={`inline-flex items-center rounded-md px-2 py-1 ${
                        status === "green" ? "status-green glow-green" :
                        status === "amber" ? "status-amber glow-amber" :
                        "status-red glow-red"
                      }`}>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={product.sellingPrice || ""}
                          onChange={(e) => onUpdateProduct(product.id, { sellingPrice: parseFloat(e.target.value) || 0 })}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="0.00"
                          className="w-20 bg-transparent text-left font-mono-nums font-semibold focus:outline-none placeholder:opacity-50"
                        />
                        <span className="mr-1">ر.س</span>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemoveProduct(product.id); }}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
