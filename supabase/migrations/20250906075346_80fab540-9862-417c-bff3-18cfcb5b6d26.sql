-- Step 3: Re-add Mentors / Coaches (DB only, clean + safe) - Fixed

-- 1) Enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mentor_type') THEN
    CREATE TYPE mentor_type AS ENUM ('mentor','coach');
  END IF;
END $$;

-- 2) Core profile (one row per mentor/coach user)
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL UNIQUE,                       -- 1:1 with a user
  type             mentor_type NOT NULL,                       -- mentor | coach
  bio              text,
  hourly_rate_cents integer CHECK (hourly_rate_cents IS NULL OR hourly_rate_cents >= 0),
  is_active        boolean NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

-- point to your real users table (keep both FKs if you have both tables; the second will no-op if missing)
ALTER TABLE public.mentor_profiles
  DROP CONSTRAINT IF EXISTS fk_mentor_profiles_auth_users,
  ADD CONSTRAINT fk_mentor_profiles_auth_users
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3) Areas (life categories / specialties)
CREATE TABLE IF NOT EXISTS public.mentor_areas (
  mentor_id        uuid NOT NULL,
  life_category_id uuid NOT NULL,
  PRIMARY KEY (mentor_id, life_category_id)
);

-- FK to mentors
ALTER TABLE public.mentor_areas
  DROP CONSTRAINT IF EXISTS fk_mentor_areas_mentor,
  ADD CONSTRAINT fk_mentor_areas_mentor
    FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id) ON DELETE CASCADE;

-- FK to existing life_categories (nullable if your project names differ, adjust the table name)
ALTER TABLE public.mentor_areas
  DROP CONSTRAINT IF EXISTS fk_mentor_areas_life_cat,
  ADD CONSTRAINT fk_mentor_areas_life_cat
    FOREIGN KEY (life_category_id) REFERENCES public.life_categories(id) ON DELETE CASCADE;

-- 4) Client assignments (who is coached/mentored by whom)
CREATE TABLE IF NOT EXISTS public.mentor_clients (
  mentor_id  uuid NOT NULL,
  client_id  uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at   timestamptz,
  notes      text,
  PRIMARY KEY (mentor_id, client_id, started_at)
);

ALTER TABLE public.mentor_clients
  DROP CONSTRAINT IF EXISTS fk_mc_mentor,
  ADD CONSTRAINT fk_mc_mentor
    FOREIGN KEY (mentor_id) REFERENCES public.mentor_profiles(id) ON DELETE CASCADE;

ALTER TABLE public.mentor_clients
  DROP CONSTRAINT IF EXISTS fk_mc_client_auth,
  ADD CONSTRAINT fk_mc_client_auth
    FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5) Timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_mp_updated_at ON public.mentor_profiles;
CREATE TRIGGER trg_mp_updated_at
BEFORE UPDATE ON public.mentor_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6) RLS (owner-only write, public read of active mentors)
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_areas    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_clients  ENABLE ROW LEVEL SECURITY;

-- Profiles: separate policies for different operations
CREATE POLICY mp_read ON public.mentor_profiles
  FOR SELECT USING (is_active = true);

CREATE POLICY mp_insert_own ON public.mentor_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY mp_update_own ON public.mentor_profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY mp_delete_own ON public.mentor_profiles
  FOR DELETE USING (user_id = auth.uid());

-- Areas: mentor can manage own areas; everyone can read active mentors' areas
CREATE POLICY ma_read ON public.mentor_areas
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.is_active = true));

CREATE POLICY ma_insert_own ON public.mentor_areas
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid()));

CREATE POLICY ma_delete_own ON public.mentor_areas
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid()));

-- Clients: mentor can see/manage their own client links; client can read their own link
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