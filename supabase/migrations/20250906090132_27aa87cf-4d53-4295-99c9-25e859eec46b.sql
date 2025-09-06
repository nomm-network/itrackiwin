-- Step 1d: Complete mentor setup with RLS and remaining components

-- Create mentor_clients table
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

-- Add foreign key constraints for mentor_clients
ALTER TABLE public.mentor_clients 
ADD CONSTRAINT fk_mentor_clients_mentor_id 
FOREIGN KEY (mentor_id) REFERENCES public.mentors(id) ON DELETE CASCADE;

ALTER TABLE public.mentor_clients 
ADD CONSTRAINT fk_mentor_clients_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Add updated_at triggers
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
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