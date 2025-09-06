-- Step 1b: Create mentors table

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
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Add unique constraint separately to handle the COALESCE properly
CREATE UNIQUE INDEX IF NOT EXISTS idx_mentors_unique_user_kind_category 
ON public.mentors (user_id, mentor_kind, COALESCE(life_category_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Create mentor_clients table
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

-- Add updated_at triggers
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

-- Add helpful indexes
CREATE INDEX IF NOT EXISTS idx_mentors_user ON public.mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_active ON public.mentors(is_active, accepting_clients);
CREATE INDEX IF NOT EXISTS idx_mentors_category ON public.mentors(life_category_id);
CREATE INDEX IF NOT EXISTS idx_mentor_clients_mentor ON public.mentor_clients(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_clients_user ON public.mentor_clients(user_id);