import { X, TrendingUp, DollarSign, Target } from "lucide-react";
import { Badge, Button, LayerCard } from "@cloudflare/kumo";
import type { Product, CostColumn } from "@/types/pricing";
import { getTotalCost, getPriceStatus } from "@/types/pricing";

interface Props {
  product: Product;
  columns: CostColumn[];
  onClose: () => void;
}

export function AnalyticsSidebar({ product, columns, onClose }: Props) {
  const totalCost = getTotalCost(product, columns);
  const idealPrice = totalCost * 3;
  const netProfit = product.sellingPrice - totalCost;
  const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0;
  const breakeven = totalCost;
  const status = getPriceStatus(product.sellingPrice, totalCost);

  const statusLabel = status === "green" ? "صحي" : status === "amber" ? "تحذير" : "هامش منخفض";

  return (
    <aside className="w-full shrink-0 space-y-5 rounded-lg border border-border bg-card p-5 shadow-panel xl:sticky xl:top-24 xl:w-80">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          التحليلات
        </h3>
        <Button onClick={onClose} variant="ghost" shape="square" size="xs" aria-label="إغلاق التحليلات">
          <X size={18} />
        </Button>
      </div>

      <div>
        <p className="text-lg font-semibold text-foreground truncate">{product.name || "منتج بدون اسم"}</p>
        <Badge className="mt-1" appearance="dot" variant={status === "green" ? "success" : status === "amber" ? "warning" : "error"}>
          {statusLabel}
        </Badge>
      </div>

      <div className="space-y-4">
        <MetricCard
          icon={<TrendingUp size={18} />}
          label="العائد على الاستثمار"
          value={`${roi.toFixed(1)}%`}
          sublabel="ROI"
          status={status}
        />
        <MetricCard
          icon={<DollarSign size={18} />}
          label="صافي الربح"
          value={`${netProfit.toFixed(2)} ر.س`}
          sublabel="سعر البيع − إجمالي التكلفة"
          status={netProfit >= 0 ? (status) : "red"}
        />
        <MetricCard
          icon={<Target size={18} />}
          label="نقطة التعادل"
          value={`${breakeven.toFixed(2)} ر.س`}
          sublabel="أقل سعر بيع ممكن"
          status="green"
        />
      </div>

      <div className="pt-4 border-t border-border space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">تفاصيل التكلفة</h4>
        {columns.filter(c => c.includedInFormula).map((col) => (
          <div key={col.id} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{col.label}</span>
            <span className="font-mono-nums text-foreground">{(product.costs[col.id] || 0).toFixed(2)} ر.س</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border">
          <span className="text-foreground">إجمالي التكلفة</span>
          <span className="font-mono-nums text-foreground">{totalCost.toFixed(2)} ر.س</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">السعر المثالي (3×)</span>
          <span className="font-mono-nums text-primary">{idealPrice.toFixed(2)} ر.س</span>
        </div>
      </div>
    </aside>
  );
}

function MetricCard({ icon, label, value, sublabel, status }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel: string;
  status: string;
}) {
  return (
    <LayerCard className="rounded-md p-3 shadow-none">
      <div className="flex items-center gap-2 mb-1">
        <span className={
          status === "green" ? "text-status-emerald" :
          status === "amber" ? "text-status-amber" :
          "text-status-crimson"
        }>{icon}</span>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold font-mono-nums text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
    </LayerCard>
  );
}
