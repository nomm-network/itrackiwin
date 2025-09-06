-- Step 1e: Create mentor_clients table and complete setup

-- Create mentor_clients table
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

-- Add triggers if function exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE TRIGGER trg_mentor_clients_updated_at
      BEFORE UPDATE ON public.mentor_clients
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_mentor_clients_mentor ON public.mentor_clients(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_clients_user ON public.mentor_clients(user_id);

-- Enable RLS
ALTER TABLE public.mentor_clients ENABLE ROW LEVEL SECURITY;