import React, { useState, useCallback } from "react";
import { Plus, Trash2, Columns3, Package, Link, Copy, Check, ChevronDown, ChevronLeft, FolderPlus, ArrowRightLeft, GitBranch } from "lucide-react";
import type { Product, CostColumn, Section } from "@/types/pricing";
import { getTotalCost, getPriceStatus } from "@/types/pricing";
import { useDragScroll } from "@/hooks/useDragScroll";
import { Switch } from "@/components/ui/switch";

const DISCOUNT_RATES = [10, 15, 20, 30, 40];

interface Props {
  products: Product[];
  columns: CostColumn[];
  sections: Section[];
  selectedId: string | null;
  onSelectProduct: (id: string | null) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
  onAddProduct: (sectionId: string | null, afterSortOrder?: number, parentId?: string | null) => void;
  onRemoveProduct: (id: string) => void;
  onAddColumn: (label: string, includedInFormula: boolean) => void;
  onRemoveColumn: (id: string) => void;
  onAddSection: () => void;
  onUpdateSection: (id: string, name: string) => void;
  onRemoveSection: (id: string) => void;
  onMoveProduct: (productId: string, newSectionId: string) => void;
}

export function PricingTable({
  products, columns, sections, selectedId,
  onSelectProduct, onUpdateProduct,
  onAddProduct, onRemoveProduct,
  onAddColumn, onRemoveColumn,
  onAddSection, onUpdateSection, onRemoveSection,
  onMoveProduct,
}: Props) {
  const [newColName, setNewColName] = useState("");
  const [newColInFormula, setNewColInFormula] = useState(false);
  const [showColInput, setShowColInput] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(new Set());
  const [movingProductId, setMovingProductId] = useState<string | null>(null);

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

  const copyLink = (productId: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(productId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const toggleVariants = (productId: string) => {
    setExpandedVariants(prev => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const totalColSpan = columns.length + 7 + DISCOUNT_RATES.length;

  const renderProductRow = (product: Product, isVariant: boolean = false) => {
    const totalCost = getTotalCost(product, columns);
    const idealPrice = totalCost * 3;
    const status = getPriceStatus(product.sellingPrice, totalCost);
    const isSelected = selectedId === product.id;
    const variants = products.filter(p => p.parentId === product.id).sort((a, b) => a.sortOrder - b.sortOrder);
    const hasVariants = variants.length > 0;
    const isExpanded = expandedVariants.has(product.id);

    return (
      <tr
        key={product.id}
        onClick={() => onSelectProduct(isSelected ? null : product.id)}
        className={`border-b border-border cursor-pointer transition-colors ${
          isSelected ? "bg-accent/60" : "hover:bg-muted/30"
        } ${isVariant ? "bg-muted/20" : ""}`}
      >
        <td className="px-4 py-2 text-center">
          <div className={`w-2 h-2 rounded-full mx-auto ${
            status === "green" ? "bg-status-emerald" :
            status === "amber" ? "bg-status-amber" :
            "bg-status-crimson"
          }`} />
        </td>
        <td className="px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-1">
            {isVariant && (
              <span className="text-muted-foreground/40 text-xs">↳</span>
            )}
            {!isVariant && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleVariants(product.id); }}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                title={isExpanded ? "إخفاء الخيارات" : "عرض الخيارات"}
              >
                {hasVariants ? (
                  isExpanded ? <ChevronDown size={13} /> : <ChevronLeft size={13} />
                ) : (
                  <GitBranch size={12} className="opacity-30" />
                )}
              </button>
            )}
            <input
              value={product.name}
              onChange={(e) => onUpdateProduct(product.id, { name: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder={isVariant ? "اسم الخيار..." : "اسم المنتج..."}
              className={`w-full bg-transparent text-foreground focus:outline-none placeholder:text-muted-foreground/50 text-center ${isVariant ? "text-xs" : ""}`}
            />
          </div>
        </td>
        <td className="px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <input
              value={product.link}
              onChange={(e) => onUpdateProduct(product.id, { link: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="رابط المنتج..."
              className="w-32 bg-transparent text-foreground focus:outline-none placeholder:text-muted-foreground/40 text-center text-xs"
            />
            {product.link && (
              <button
                onClick={(e) => { e.stopPropagation(); copyLink(product.id, product.link); }}
                className="text-muted-foreground hover:text-primary transition-colors p-0.5"
                title="نسخ الرابط"
              >
                {copiedId === product.id ? <Check size={13} className="text-status-emerald" /> : <Copy size={13} />}
              </button>
            )}
          </div>
        </td>
        {columns.map((col) => (
          <td key={col.id} className="px-4 py-2 text-center">
            <div className="flex items-center justify-center">
              <input
                type="text"
                inputMode="decimal"
                value={product.costs[col.id] || ""}
                onChange={(e) => setCost(product.id, col.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="0.00"
                className="w-20 bg-transparent text-center font-mono-nums text-foreground focus:outline-none placeholder:text-muted-foreground/40"
              />
              <span className="text-muted-foreground mr-1">ر.س</span>
            </div>
          </td>
        ))}
        <td className="px-4 py-2 text-center font-mono-nums font-semibold text-foreground">
          {totalCost.toFixed(2)} ر.س
        </td>
        <td className="px-4 py-2 text-center font-mono-nums font-semibold text-primary">
          {idealPrice.toFixed(2)} ر.س
        </td>
        <td className="px-4 py-2 text-center">
          <div className={`inline-flex items-center rounded-md px-2 py-1 ${
            status === "green" ? "status-green glow-green" :
            status === "amber" ? "status-amber glow-amber" :
            "status-red glow-red"
          }`}>
            <input
              type="text"
              inputMode="decimal"
              value={product.sellingPrice || ""}
              onChange={(e) => onUpdateProduct(product.id, { sellingPrice: parseFloat(e.target.value) || 0 })}
              onClick={(e) => e.stopPropagation()}
              placeholder="0.00"
              className="w-20 bg-transparent text-center font-mono-nums font-semibold focus:outline-none placeholder:opacity-50"
            />
            <span className="mr-1">ر.س</span>
          </div>
        </td>
        {DISCOUNT_RATES.map((rate) => {
          const preDiscount = product.sellingPrice > 0
            ? (product.sellingPrice / (1 - rate / 100))
            : 0;
          return (
            <td key={rate} className="px-4 py-2 text-center font-mono-nums text-muted-foreground">
              {preDiscount > 0 ? `${preDiscount.toFixed(2)} ر.س` : "—"}
            </td>
          );
        })}
        <td className="px-2 py-2 text-center">
          <div className="flex items-center gap-0.5">
            {!isVariant && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onAddProduct(product.sectionId, product.sortOrder, product.id); }}
                  className="text-muted-foreground hover:text-primary transition-colors p-1"
                  title="إضافة خيار"
                >
                  <GitBranch size={13} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAddProduct(product.sectionId, product.sortOrder); }}
                  className="text-muted-foreground hover:text-primary transition-colors p-1"
                  title="إضافة منتج بعد هذا"
                >
                  <Plus size={13} />
                </button>
                {sections.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMovingProductId(movingProductId === product.id ? null : product.id);
                    }}
                    className="text-muted-foreground hover:text-primary transition-colors p-1"
                    title="نقل لقسم آخر"
                  >
                    <ArrowRightLeft size={13} />
                  </button>
                )}
              </>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onRemoveProduct(product.id); }}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {movingProductId === product.id && (
            <div className="absolute z-10 mt-1 left-0 bg-card border border-border rounded-lg shadow-lg p-2 space-y-1 min-w-[120px]"
              onClick={(e) => e.stopPropagation()}>
              {sections.filter(s => s.id !== product.sectionId).map(s => (
                <button
                  key={s.id}
                  onClick={() => { onMoveProduct(product.id, s.id); setMovingProductId(null); }}
                  className="block w-full text-right px-3 py-1.5 text-xs rounded hover:bg-muted transition-colors text-foreground"
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </td>
      </tr>
    );
  };

  const renderSectionTable = (section: Section) => {
    const isCollapsed = collapsedSections.has(section.id);
    const sectionProducts = products
      .filter(p => p.sectionId === section.id && !p.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return (
      <div key={section.id} className="space-y-2">
        {/* Section header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleSection(section.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {isCollapsed ? <ChevronLeft size={18} /> : <ChevronDown size={18} />}
          </button>
          <input
            value={section.name}
            onChange={(e) => onUpdateSection(section.id, e.target.value)}
            className="text-base font-semibold text-foreground bg-transparent focus:outline-none border-b border-transparent focus:border-border"
          />
          <span className="text-xs text-muted-foreground">({sectionProducts.length})</span>
          <button
            onClick={() => onAddProduct(section.id)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
          >
            <Plus size={13} /> منتج
          </button>
          {section.id !== "00000000-0000-0000-0000-000000000001" && (
            <button
              onClick={() => onRemoveSection(section.id)}
              className="text-muted-foreground hover:text-destructive transition-colors p-1"
              title="حذف القسم"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {!isCollapsed && (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground w-8"></th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[180px]">اسم المنتج</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[180px]">
                      <div className="flex items-center justify-center gap-1"><Link size={12} /> الرابط</div>
                    </th>
                    {columns.map((col) => (
                      <th key={col.id} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[120px]">
                        <div className="flex items-center justify-center gap-1">
                          {col.label}
                          {!col.includedInFormula && <span className="text-[10px] text-muted-foreground/50 font-normal">(معلوماتي)</span>}
                          {!col.isDefault && (
                            <button onClick={() => onRemoveColumn(col.id)} className="text-muted-foreground hover:text-destructive transition-colors mr-1">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[100px]">إجمالي التكلفة</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-primary min-w-[110px]">السعر المثالي</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[140px]">سعر البيع</th>
                    {DISCOUNT_RATES.map((rate) => (
                      <th key={rate} className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground min-w-[120px]">
                        قبل خصم {rate}%
                      </th>
                    ))}
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {sectionProducts.length === 0 && (
                    <tr>
                      <td colSpan={totalColSpan} className="text-center py-12 text-muted-foreground">
                        <Package size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="text-sm">لا توجد منتجات. أضف منتجاً للبدء.</p>
                      </td>
                    </tr>
                  )}
                  {sectionProducts.map((product) => {
                    const variants = products
                      .filter(p => p.parentId === product.id)
                      .sort((a, b) => a.sortOrder - b.sortOrder);
                    const isExpanded = expandedVariants.has(product.id);

                    return (
                      <React.Fragment key={product.id}>
                        {renderProductRow(product, false)}
                        {isExpanded && variants.map(v => renderProductRow(v, true))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 min-w-0 space-y-6">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => onAddProduct(sections[0]?.id || null)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> إضافة منتج
        </button>

        <button
          onClick={onAddSection}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <FolderPlus size={16} /> إضافة قسم
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
              <Switch checked={newColInFormula} onCheckedChange={setNewColInFormula} className="scale-75" />
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

      {/* Sections */}
      {sections.length > 0 ? (
        sections.sort((a, b) => a.sortOrder - b.sortOrder).map(section => renderSectionTable(section))
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Package size={32} className="mx-auto mb-2 opacity-40" />
          <p>لا توجد أقسام. أضف قسماً للبدء.</p>
        </div>
      )}

      {/* Products without section */}
      {products.filter(p => !p.sectionId && !p.parentId).length > 0 && (
        renderSectionTable({ id: "__unsectioned__" as any, name: "بدون قسم", sortOrder: 999 } as any)
      )}
    </div>
  );
}
