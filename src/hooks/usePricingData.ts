import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product, CostColumn, Section } from "@/types/pricing";

export function usePricingData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [columns, setColumns] = useState<CostColumn[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const load = async () => {
      const [colRes, prodRes, secRes] = await Promise.all([
        supabase.from("cost_columns").select("*").order("sort_order"),
        supabase.from("products").select("*").order("sort_order"),
        supabase.from("sections").select("*").order("sort_order"),
      ]);

      if (colRes.data) {
        setColumns(colRes.data.map((c: any) => ({
          id: c.col_key, label: c.label, isDefault: c.is_default, includedInFormula: c.included_in_formula,
        })));
      }

      if (prodRes.data) {
        setProducts(prodRes.data.map((p: any) => ({
          id: p.id, name: p.name,
          costs: (p.costs || {}) as Record<string, number>,
          sellingPrice: Number(p.selling_price) || 0,
          link: p.link || "",
          sectionId: p.section_id || null,
          sortOrder: p.sort_order || 0,
          parentId: p.parent_id || null,
        })));
      }

      if (secRes.data) {
        setSections(secRes.data.map((s: any) => ({
          id: s.id, name: s.name, sortOrder: s.sort_order,
        })));
      }

      setLoading(false);
    };
    load();
  }, []);

  const addProduct = useCallback(async (sectionId: string | null = null, afterSortOrder?: number, parentId?: string | null) => {
    // Calculate sort order
    const sectionProducts = products.filter(p => p.sectionId === sectionId && p.parentId === (parentId || null));
    let newSortOrder: number;

    if (afterSortOrder !== undefined) {
      newSortOrder = afterSortOrder + 1;
      // Shift products after this position
      const toShift = sectionProducts.filter(p => p.sortOrder > afterSortOrder);
      for (const p of toShift) {
        await supabase.from("products").update({ sort_order: p.sortOrder + 1 }).eq("id", p.id);
      }
      setProducts(prev => prev.map(p =>
        p.sectionId === sectionId && p.parentId === (parentId || null) && p.sortOrder > afterSortOrder
          ? { ...p, sortOrder: p.sortOrder + 1 } : p
      ));
    } else {
      newSortOrder = sectionProducts.length > 0 ? Math.max(...sectionProducts.map(p => p.sortOrder)) + 1 : 0;
    }

    const { data } = await supabase
      .from("products")
      .insert({
        name: "", costs: {}, selling_price: 0, link: "",
        section_id: sectionId, sort_order: newSortOrder,
        parent_id: parentId || null,
      })
      .select()
      .single();

    if (data) {
      setProducts(prev => [...prev, {
        id: data.id, name: data.name,
        costs: (data.costs || {}) as Record<string, number>,
        sellingPrice: Number(data.selling_price) || 0,
        link: data.link || "",
        sectionId: data.section_id || null,
        sortOrder: data.sort_order || 0,
        parentId: data.parent_id || null,
      }]);
    }
  }, [products]);

  const removeProduct = useCallback(async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id && p.parentId !== id));
  }, []);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));

    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    debounceTimers.current[id] = setTimeout(async () => {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.sellingPrice !== undefined) dbUpdates.selling_price = updates.sellingPrice;
      if (updates.link !== undefined) dbUpdates.link = updates.link;
      if (updates.sectionId !== undefined) dbUpdates.section_id = updates.sectionId;
      if (updates.sortOrder !== undefined) dbUpdates.sort_order = updates.sortOrder;
      if (updates.costs !== undefined) {
        const current = products.find(p => p.id === id);
        dbUpdates.costs = { ...(current?.costs || {}), ...updates.costs };
      }
      dbUpdates.updated_at = new Date().toISOString();
      await supabase.from("products").update(dbUpdates).eq("id", id);
    }, 500);
  }, [products]);

  const moveProductToSection = useCallback(async (productId: string, newSectionId: string) => {
    const sectionProducts = products.filter(p => p.sectionId === newSectionId && !p.parentId);
    const newSort = sectionProducts.length > 0 ? Math.max(...sectionProducts.map(p => p.sortOrder)) + 1 : 0;

    await supabase.from("products").update({ section_id: newSectionId, sort_order: newSort }).eq("id", productId);
    // Also move variants
    await supabase.from("products").update({ section_id: newSectionId }).eq("parent_id", productId);

    setProducts(prev => prev.map(p => {
      if (p.id === productId) return { ...p, sectionId: newSectionId, sortOrder: newSort };
      if (p.parentId === productId) return { ...p, sectionId: newSectionId };
      return p;
    }));
  }, [products]);

  const addSection = useCallback(async () => {
    const newSort = sections.length > 0 ? Math.max(...sections.map(s => s.sortOrder)) + 1 : 0;
    const { data } = await supabase.from("sections").insert({ name: "قسم جديد", sort_order: newSort }).select().single();
    if (data) {
      setSections(prev => [...prev, { id: data.id, name: data.name, sortOrder: data.sort_order }]);
    }
  }, [sections]);

  const updateSection = useCallback((id: string, name: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, name } : s));
    if (debounceTimers.current[`sec_${id}`]) clearTimeout(debounceTimers.current[`sec_${id}`]);
    debounceTimers.current[`sec_${id}`] = setTimeout(async () => {
      await supabase.from("sections").update({ name }).eq("id", id);
    }, 500);
  }, []);

  const removeSection = useCallback(async (id: string) => {
    // Move products to null section before deleting
    await supabase.from("products").update({ section_id: null }).eq("section_id", id);
    setProducts(prev => prev.map(p => p.sectionId === id ? { ...p, sectionId: null } : p));
    await supabase.from("sections").delete().eq("id", id);
    setSections(prev => prev.filter(s => s.id !== id));
  }, []);

  const addColumn = useCallback(async (label: string, includedInFormula: boolean = false) => {
    const colKey = `col_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const maxOrder = columns.length > 0 ? Math.max(...columns.map((_, i) => i + 1)) : 0;
    const { error } = await supabase.from("cost_columns").insert({
      col_key: colKey, label, is_default: false, included_in_formula: includedInFormula, sort_order: maxOrder + 1,
    });
    if (!error) {
      setColumns(prev => [...prev, { id: colKey, label, isDefault: false, includedInFormula }]);
    }
  }, [columns]);

  const removeColumn = useCallback(async (id: string) => {
    await supabase.from("cost_columns").delete().eq("col_key", id);
    setColumns(prev => prev.filter(c => c.id !== id));
    setProducts(prev => prev.map(p => {
      const costs = { ...p.costs };
      delete costs[id];
      return { ...p, costs };
    }));
  }, []);

  return {
    products, columns, sections, loading,
    addProduct, removeProduct, updateProduct,
    addColumn, removeColumn,
    addSection, updateSection, removeSection,
    moveProductToSection,
  };
}
