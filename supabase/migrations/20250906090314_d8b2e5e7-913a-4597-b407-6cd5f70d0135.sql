-- Step 1e: Create mentor_clients table separately

CREATE TABLE IF NOT EXISTS public.mentor_clients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   uuid NOT NULL,
  user_id     uuid NOT NULL,
  status      public.mentor_client_status NOT NULL DEFAULT 'active',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Add constraints separately
ALTER TABLE public.mentor_clients 
ADD CONSTRAINT uk_mentor_clients_mentor_user 
UNIQUE (mentor_id, user_id);

-- Add foreign key to mentors table (should work since mentors exists)
ALTER TABLE public.mentor_clients 
ADD CONSTRAINT fk_mentor_clients_mentor_id 
FOREIGN KEY (mentor_id) REFERENCES public.mentors(id) ON DELETE CASCADE;

-- Add foreign key to users table with explicit schema reference
DO $$
BEGIN
  -- Check if users table exists in public schema and has id column
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'id'
  ) THEN
    ALTER TABLE public.mentor_clients 
    ADD CONSTRAINT fk_mentor_clients_user_id 
    FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END$$;