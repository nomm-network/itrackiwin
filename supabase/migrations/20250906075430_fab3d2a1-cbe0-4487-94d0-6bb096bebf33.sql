-- Step 3: Re-add Mentors / Coaches (DB only, clean + safe) - Working with existing tables

-- 1) Enum (already exists or create)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mentor_type') THEN
    CREATE TYPE mentor_type AS ENUM ('mentor','coach');
  END IF;
END $$;

-- 2) Check if we need to modify the existing mentor_profiles table or create new tables
-- Add is_active column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'mentor_profiles' AND column_name = 'is_active') THEN
    ALTER TABLE public.mentor_profiles ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
END $$;

-- Add type column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'mentor_profiles' AND column_name = 'type') THEN
    ALTER TABLE public.mentor_profiles ADD COLUMN type mentor_type;
    -- Set default type based on existing data pattern
    UPDATE public.mentor_profiles SET type = 'mentor' WHERE type IS NULL;
    ALTER TABLE public.mentor_profiles ALTER COLUMN type SET NOT NULL;
  END IF;
END $$;

-- 3) Create mentor_areas table (linking mentors to life categories)
CREATE TABLE IF NOT EXISTS public.mentor_areas (
  mentor_id        uuid NOT NULL,
  life_category_id uuid NOT NULL,
  PRIMARY KEY (mentor_id, life_category_id)
);

-- FK to mentors
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_mentor_areas_mentor') THEN
    ALTER TABLE public.mentor_areas
      ADD CONSTRAINT fk_mentor_areas_mentor
        FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- FK to existing life_categories
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_mentor_areas_life_cat') THEN
    ALTER TABLE public.mentor_areas
      ADD CONSTRAINT fk_mentor_areas_life_cat
        FOREIGN KEY (life_category_id) REFERENCES public.life_categories(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4) Create mentor_clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.mentor_clients (
  mentor_id  uuid NOT NULL,
  client_id  uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at   timestamptz,
  notes      text,
  PRIMARY KEY (mentor_id, client_id, started_at)
);

-- FK to mentors
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_mc_mentor') THEN
    ALTER TABLE public.mentor_clients
      ADD CONSTRAINT fk_mc_mentor
        FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- FK to users
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'fk_mc_client_auth') THEN
    ALTER TABLE public.mentor_clients
      ADD CONSTRAINT fk_mc_client_auth
        FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5) Timestamps function and trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_mp_updated_at ON public.mentor_profiles;
CREATE TRIGGER trg_mp_updated_at
BEFORE UPDATE ON public.mentor_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6) RLS policies (drop existing and recreate)
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_clients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS mp_read ON public.mentor_profiles;
DROP POLICY IF EXISTS mp_insert_own ON public.mentor_profiles;
DROP POLICY IF EXISTS mp_update_own ON public.mentor_profiles;
DROP POLICY IF EXISTS mp_delete_own ON public.mentor_profiles;

-- Create new policies for mentor_profiles
CREATE POLICY mp_read ON public.mentor_profiles
  FOR SELECT USING (is_active = true AND is_public = true);

CREATE POLICY mp_insert_own ON public.mentor_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY mp_update_own ON public.mentor_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY mp_delete_own ON public.mentor_profiles
  FOR DELETE USING (user_id = auth.uid());

-- Policies for mentor_areas
DROP POLICY IF EXISTS ma_read ON public.mentor_areas;
DROP POLICY IF EXISTS ma_insert_own ON public.mentor_areas;
DROP POLICY IF EXISTS ma_delete_own ON public.mentor_areas;

CREATE POLICY ma_read ON public.mentor_areas
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.is_active = true AND mp.is_public = true));

CREATE POLICY ma_insert_own ON public.mentor_areas
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid()));

CREATE POLICY ma_delete_own ON public.mentor_areas
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid()));

-- Policies for mentor_clients
DROP POLICY IF EXISTS mc_read ON public.mentor_clients;
DROP POLICY IF EXISTS mc_insert_own ON public.mentor_clients;
DROP POLICY IF EXISTS mc_update_own ON public.mentor_clients;
DROP POLICY IF EXISTS mc_delete_own ON public.mentor_clients;

CREATE POLICY mc_read ON public.mentor_clients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid())
    OR client_id = auth.uid()
  );

CREATE POLICY mc_insert_own ON public.mentor_clients
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid()));

CREATE POLICY mc_update_own ON public.mentor_clients
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid()));

CREATE POLICY mc_delete_own ON public.mentor_clients
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid()));