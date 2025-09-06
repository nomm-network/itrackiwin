-- Step 1f: Final mentor setup - RLS and remaining components

-- Create mentor_clients table without foreign keys first
CREATE TABLE IF NOT EXISTS public.mentor_clients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   uuid NOT NULL,
  user_id     uuid NOT NULL,
  status      public.mentor_client_status NOT NULL DEFAULT 'active',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mentor_id, user_id)
);

-- Add triggers for updated_at
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS trg_mentors_updated_at ON public.mentors;
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

-- Enable RLS on new tables
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for mentors
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

-- Public read of visible mentors (directory listing)
CREATE POLICY mentors_public_read ON public.mentors
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true AND accepting_clients = true);

-- Create RLS policies for mentor_clients
CREATE POLICY mentor_clients_mentor_rw ON public.mentor_clients
  FOR SELECT 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.mentors m WHERE m.id = mentor_clients.mentor_id AND m.user_id = auth.uid()
  ));

CREATE POLICY mentor_clients_mentor_mod ON public.mentor_clients
  FOR INSERT 
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.mentors m WHERE m.id = mentor_clients.mentor_id AND m.user_id = auth.uid()
  ));

CREATE POLICY mentor_clients_mentor_update ON public.mentor_clients
  FOR UPDATE 
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.mentors m WHERE m.id = mentor_clients.mentor_id AND m.user_id = auth.uid()
  )) 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.mentors m WHERE m.id = mentor_clients.mentor_id AND m.user_id = auth.uid()
  ));

-- Clients can read their link
CREATE POLICY mentor_clients_client_read ON public.mentor_clients
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

-- Create public view (directory-safe fields)
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