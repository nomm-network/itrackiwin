-- Step 1: Database foundation for Mentors/Coaches feature (Simplified)

-- 1. Enum (mentor type)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mentor_type') THEN
    CREATE TYPE public.mentor_type AS ENUM ('mentor','coach');
  END IF;
END$$;

-- 2. Enum for client status
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mentor_client_status') THEN
    CREATE TYPE public.mentor_client_status AS ENUM ('invited','active','paused','ended');
  END IF;
END$$;

-- 3. mentors table
CREATE TABLE IF NOT EXISTS public.mentors (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mentor_kind        public.mentor_type NOT NULL,
  life_category_id   uuid NULL REFERENCES public.life_categories(id) ON DELETE SET NULL,
  display_name       text,
  bio                text,
  hourly_rate        numeric(10,2),
  currency           text DEFAULT 'USD',
  is_active          boolean NOT NULL DEFAULT true,
  accepting_clients  boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- 4. mentor_clients table
CREATE TABLE IF NOT EXISTS public.mentor_clients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   uuid NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status      public.mentor_client_status NOT NULL DEFAULT 'active',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mentor_id, user_id)
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_mentors_user ON public.mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_active ON public.mentors(is_active, accepting_clients);
CREATE INDEX IF NOT EXISTS idx_mentors_category ON public.mentors(life_category_id);
CREATE INDEX IF NOT EXISTS idx_mentor_clients_mentor ON public.mentor_clients(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_clients_user ON public.mentor_clients(user_id);

-- 6. Enable RLS
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_clients ENABLE ROW LEVEL SECURITY;

-- 7. Basic RLS policies
DROP POLICY IF EXISTS mentors_owner_rw ON public.mentors;
DROP POLICY IF EXISTS mentors_owner_mod ON public.mentors;
DROP POLICY IF EXISTS mentors_owner_update ON public.mentors;
DROP POLICY IF EXISTS mentors_public_read ON public.mentors;

CREATE POLICY mentors_owner_rw ON public.mentors
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY mentors_owner_mod ON public.mentors
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY mentors_owner_update ON public.mentors
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY mentors_public_read ON public.mentors
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true AND accepting_clients = true);

-- 8. Public view
CREATE OR REPLACE VIEW public.v_public_mentors AS
SELECT
  me.id,
  me.mentor_kind,
  me.display_name,
  me.bio,
  me.hourly_rate,
  me.currency,
  me.life_category_id,
  me.is_active,
  me.accepting_clients,
  me.created_at
FROM public.mentors me
WHERE me.is_active = true AND me.accepting_clients = true;