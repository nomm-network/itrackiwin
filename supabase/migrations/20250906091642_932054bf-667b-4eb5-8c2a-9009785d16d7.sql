-- Drop previous mentor tables to use the new improved structure
DROP TABLE IF EXISTS public.mentor_clients CASCADE;
DROP TABLE IF EXISTS public.mentors CASCADE;
DROP TYPE IF EXISTS public.mentor_type CASCADE;
DROP TYPE IF EXISTS public.mentor_client_status CASCADE;

-- 1) enum
DO $$ BEGIN
  CREATE TYPE public.mentor_type AS ENUM ('mentor','coach');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) mentors (one row per user who offers mentoring/coaching)
CREATE TABLE IF NOT EXISTS public.mentors (
  user_id        uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  type           public.mentor_type NOT NULL,
  tagline        text,
  bio            text,
  is_active      boolean NOT NULL DEFAULT true,
  is_public      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- 3) link mentors to life categories (many-to-many)
CREATE TABLE IF NOT EXISTS public.mentor_categories (
  mentor_user_id uuid NOT NULL REFERENCES public.mentors(user_id) ON DELETE CASCADE,
  life_category_id uuid NOT NULL REFERENCES public.life_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (mentor_user_id, life_category_id)
);

-- 4) simple availability/price (optional now, easy to extend later)
CREATE TABLE IF NOT EXISTS public.mentor_rates (
  mentor_user_id uuid PRIMARY KEY REFERENCES public.mentors(user_id) ON DELETE CASCADE,
  currency       text NOT NULL DEFAULT 'USD',
  hourly_rate    numeric(10,2) NOT NULL DEFAULT 0
);

-- 5) updated_at helper
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION public.update_updated_at_column()
  RETURNS trigger LANGUAGE plpgsql AS $$
  BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER mentors_utrg
  BEFORE UPDATE ON public.mentors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 6) RLS
ALTER TABLE public.mentors        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_rates   ENABLE ROW LEVEL SECURITY;

-- a) anyone can read public, active mentors
DO $$ BEGIN
  CREATE POLICY mentors_read_public ON public.mentors
  FOR SELECT USING (is_public AND is_active);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- b) a mentor can read/modify own row
DO $$ BEGIN
  CREATE POLICY mentors_self_rw ON public.mentors
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- c) categories readable if mentor is visible; mentor can manage own links
DO $$ BEGIN
  CREATE POLICY mentor_categories_read ON public.mentor_categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.mentors m
            WHERE m.user_id = mentor_user_id
              AND m.is_public AND m.is_active)
    OR auth.uid() = mentor_user_id
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY mentor_categories_self_manage ON public.mentor_categories
  FOR ALL USING (auth.uid() = mentor_user_id)
  WITH CHECK (auth.uid() = mentor_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- d) rates readable if mentor visible; mentor can edit own
DO $$ BEGIN
  CREATE POLICY mentor_rates_read ON public.mentor_rates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.mentors m
            WHERE m.user_id = mentor_user_id
              AND m.is_public AND m.is_active)
    OR auth.uid() = mentor_user_id
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY mentor_rates_self_manage ON public.mentor_rates
  FOR ALL USING (auth.uid() = mentor_user_id)
  WITH CHECK (auth.uid() = mentor_user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7) simple view for listing
CREATE OR REPLACE VIEW public.v_mentors_public AS
SELECT m.user_id, m.type, m.tagline, m.is_active, m.created_at,
       array_agg(mc.life_category_id ORDER BY mc.life_category_id) FILTER (WHERE mc.life_category_id IS NOT NULL) AS life_category_ids
FROM public.mentors m
LEFT JOIN public.mentor_categories mc ON mc.mentor_user_id = m.user_id
WHERE m.is_public AND m.is_active
GROUP BY m.user_id, m.type, m.tagline, m.is_active, m.created_at;