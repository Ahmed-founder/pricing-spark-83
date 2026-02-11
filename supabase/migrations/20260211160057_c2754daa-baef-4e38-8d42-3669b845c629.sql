
-- Cost columns table
CREATE TABLE public.cost_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  col_key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  included_in_formula BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cost_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read cost_columns" ON public.cost_columns FOR SELECT USING (true);
CREATE POLICY "Public insert cost_columns" ON public.cost_columns FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update cost_columns" ON public.cost_columns FOR UPDATE USING (true);
CREATE POLICY "Public delete cost_columns" ON public.cost_columns FOR DELETE USING (true);

-- Products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  costs JSONB NOT NULL DEFAULT '{}'::jsonb,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Public delete products" ON public.products FOR DELETE USING (true);

-- Insert default columns
INSERT INTO public.cost_columns (col_key, label, is_default, included_in_formula, sort_order) VALUES
  ('base_cost', 'تكلفة المنتج', true, true, 1),
  ('shipping', 'الشحن', true, true, 2),
  ('packaging', 'التغليف', true, true, 3),
  ('payment_fees', 'رسوم الدفع', true, true, 4),
  ('vat', 'ضريبة القيمة المضافة 15%', true, true, 5),
  ('additional', 'تكاليف إضافية', true, true, 6);
