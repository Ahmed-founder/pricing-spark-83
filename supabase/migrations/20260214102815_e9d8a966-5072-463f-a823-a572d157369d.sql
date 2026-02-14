
-- Sections table
CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'قسم جديد',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read sections" ON public.sections FOR SELECT USING (true);
CREATE POLICY "Public insert sections" ON public.sections FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sections" ON public.sections FOR UPDATE USING (true);
CREATE POLICY "Public delete sections" ON public.sections FOR DELETE USING (true);

-- Add section_id, sort_order, parent_id to products
ALTER TABLE public.products ADD COLUMN section_id UUID REFERENCES public.sections(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN parent_id UUID REFERENCES public.products(id) ON DELETE CASCADE;

-- Insert a default section for existing products
INSERT INTO public.sections (id, name, sort_order) VALUES ('00000000-0000-0000-0000-000000000001', 'عام', 0);

-- Move existing products to default section
UPDATE public.products SET section_id = '00000000-0000-0000-0000-000000000001' WHERE section_id IS NULL;
