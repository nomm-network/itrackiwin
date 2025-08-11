-- 1) Create equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and basic policies (everyone can read, only authenticated can write)
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'equipment' AND policyname = 'equipment_select_all'
  ) THEN
    CREATE POLICY "equipment_select_all" ON public.equipment FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'equipment' AND policyname = 'equipment_mutate_auth'
  ) THEN
    CREATE POLICY "equipment_mutate_auth" ON public.equipment FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

-- Seed base equipment values
INSERT INTO public.equipment (name, slug)
VALUES
  ('body', 'body'),
  ('barr', 'barr'),
  ('dumbbells', 'dumbbells'),
  ('machine', 'machine')
ON CONFLICT (name) DO NOTHING;

-- 2) Alter exercises to use equipment_id and drop old text columns
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS equipment_id uuid REFERENCES public.equipment(id);

-- Drop redundant text columns
ALTER TABLE public.exercises DROP COLUMN IF EXISTS equipment;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS primary_muscle;
ALTER TABLE public.exercises DROP COLUMN IF EXISTS secondary_muscles;