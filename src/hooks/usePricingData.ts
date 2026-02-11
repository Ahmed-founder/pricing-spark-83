import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product, CostColumn } from "@/types/pricing";

export function usePricingData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [columns, setColumns] = useState<CostColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Load initial data
  useEffect(() => {
    const load = async () => {
      const [colRes, prodRes] = await Promise.all([
        supabase.from("cost_columns").select("*").order("sort_order"),
        supabase.from("products").select("*").order("created_at"),
      ]);

      if (colRes.data) {
        setColumns(colRes.data.map((c: any) => ({
          id: c.col_key,
          label: c.label,
          isDefault: c.is_default,
          includedInFormula: c.included_in_formula,
        })));
      }

      if (prodRes.data) {
        setProducts(prodRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          costs: (p.costs || {}) as Record<string, number>,
          sellingPrice: Number(p.selling_price) || 0,
        })));
      }
      setLoading(false);
    };
    load();
  }, []);

  const addProduct = useCallback(async () => {
    const { data, error } = await supabase
      .from("products")
      .insert({ name: "", costs: {}, selling_price: 0 })
      .select()
      .single();
    if (data) {
      setProducts((prev) => [...prev, {
        id: data.id,
        name: data.name,
        costs: (data.costs || {}) as Record<string, number>,
        sellingPrice: Number(data.selling_price) || 0,
      }]);
    }
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    // Debounce DB update
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(async () => {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.sellingPrice !== undefined) dbUpdates.selling_price = updates.sellingPrice;
      if (updates.costs !== undefined) {
        // Need current full costs
        const current = products.find((p) => p.id === id);
        dbUpdates.costs = { ...(current?.costs || {}), ...updates.costs };
      }
      dbUpdates.updated_at = new Date().toISOString();
      await supabase.from("products").update(dbUpdates).eq("id", id);
    }, 500);
  }, [products]);

  const addColumn = useCallback(async (label: string, includedInFormula: boolean = false) => {
    const colKey = `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const maxOrder = columns.length > 0 ? Math.max(...columns.map((_, i) => i + 1)) : 0;

    const { error } = await supabase.from("cost_columns").insert({
      col_key: colKey,
      label,
      is_default: false,
      included_in_formula: includedInFormula,
      sort_order: maxOrder + 1,
    });

    if (!error) {
      setColumns((prev) => [...prev, { id: colKey, label, isDefault: false, includedInFormula }]);
    }
  }, [columns]);

  const removeColumn = useCallback(async (id: string) => {
    await supabase.from("cost_columns").delete().eq("col_key", id);
    setColumns((prev) => prev.filter((c) => c.id !== id));
    // Clean costs from products
    setProducts((prev) =>
      prev.map((p) => {
        const costs = { ...p.costs };
        delete costs[id];
        return { ...p, costs };
      })
    );
  }, []);

  return {
    products,
    columns,
    loading,
    addProduct,
    removeProduct,
    updateProduct,
    addColumn,
    removeColumn,
  };
}
