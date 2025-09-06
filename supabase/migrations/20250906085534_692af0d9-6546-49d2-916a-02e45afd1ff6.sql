-- Step 1: Database foundation for Mentors/Coaches feature

-- 1. Enum (mentor type)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mentor_type') THEN
    CREATE TYPE public.mentor_type AS ENUM ('mentor','coach');
  END IF;
END$$;

-- 2. Core tables

-- 2. mentors (one row per mentor/coach user; may be global or tied to a life category)
CREATE TABLE IF NOT EXISTS public.mentors (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  mentor_kind        public.mentor_type NOT NULL,         -- 'mentor' | 'coach'
  life_category_id   uuid NULL REFERENCES public.life_categories(id) ON DELETE SET NULL,
  display_name       text,
  bio                text,
  hourly_rate        numeric(10,2),
  currency           text DEFAULT 'USD',
  is_active          boolean NOT NULL DEFAULT true,
  accepting_clients  boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, mentor_kind, COALESCE(life_category_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

-- 3. mentor_clients (relationships)
-- a user can be a client of a mentor/coach
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mentor_client_status') THEN
    CREATE TYPE public.mentor_client_status AS ENUM ('invited','active','paused','ended');
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.mentor_clients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   uuid NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, -- the client
  status      public.mentor_client_status NOT NULL DEFAULT 'active',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mentor_id, user_id)
);

-- 4. updated_at trigger (reuse your existing trigger fn if present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER trg_mentors_updated_at
      BEFORE UPDATE ON public.mentors
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

    CREATE TRIGGER trg_mentor_clients_updated_at
      BEFORE UPDATE ON public.mentor_clients
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 5. helpful indexes
CREATE INDEX IF NOT EXISTS idx_mentors_user ON public.mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_active ON public.mentors(is_active, accepting_clients);
CREATE INDEX IF NOT EXISTS idx_mentors_category ON public.mentors(life_category_id);
CREATE INDEX IF NOT EXISTS idx_mentor_clients_mentor ON public.mentor_clients(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_clients_user ON public.mentor_clients(user_id);

-- 3) RLS (safe defaults)

-- Enable RLS
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_clients ENABLE ROW LEVEL SECURITY;

-- Owners can read/update their own mentor row(s)
CREATE POLICY mentors_owner_rw ON public.mentors
  FOR SELECT USING (auth.uid() = user_id)
  TO authenticated;

CREATE POLICY mentors_owner_mod ON public.mentors
  FOR INSERT WITH CHECK (auth.uid() = user_id)
  TO authenticated;

CREATE POLICY mentors_owner_update ON public.mentors
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)
  TO authenticated;

-- Public read of visible mentors (directory listing)
CREATE POLICY mentors_public_read ON public.mentors
  FOR SELECT USING (is_active = true AND accepting_clients = true)
  TO anon, authenticated;

-- mentor_clients: mentors can see/manage their own client relations; clients can read their relation
CREATE POLICY mentor_clients_mentor_rw ON public.mentor_clients
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.mentors m WHERE m.id = mentor_clients.mentor_id AND m.user_id = auth.uid()
  ))
  TO authenticated;

CREATE POLICY mentor_clients_mentor_mod ON public.mentor_clients
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.mentors m WHERE m.id = mentor_clients.mentor_id AND m.user_id = auth.uid()
  ))
  TO authenticated;

CREATE POLICY mentor_clients_mentor_update ON public.mentor_clients
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.mentors m WHERE m.id = mentor_clients.mentor_id AND m.user_id = auth.uid()
  )) WITH CHECK (EXISTS (
    SELECT 1 FROM public.mentors m WHERE m.id = mentor_clients.mentor_id AND m.user_id = auth.uid()
  ))
  TO authenticated;

-- Clients can read their link
CREATE POLICY mentor_clients_client_read ON public.mentor_clients
  FOR SELECT USING (user_id = auth.uid())
  TO authenticated;

-- 4) Public view (directory-safe fields)

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