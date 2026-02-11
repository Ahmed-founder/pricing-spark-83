export interface CostColumn {
  id: string;
  label: string;
  isDefault: boolean;
}

export interface Product {
  id: string;
  name: string;
  costs: Record<string, number>;
  sellingPrice: number;
}

export type PriceStatus = "green" | "amber" | "red";

export function getPriceStatus(sellingPrice: number, totalCost: number): PriceStatus {
  if (totalCost === 0) return "green";
  const ratio = sellingPrice / totalCost;
  if (ratio >= 2.8) return "green";
  if (ratio >= 2) return "amber";
  return "red";
}

export function getTotalCost(product: Product, columns: CostColumn[]): number {
  return columns.reduce((sum, col) => sum + (product.costs[col.id] || 0), 0);
}
