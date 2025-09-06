-- Step 1f: Create mentor_clients table (simplified approach)

-- Create mentor_clients table without FK constraints first
CREATE TABLE IF NOT EXISTS public.mentor_clients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id   uuid NOT NULL,
  user_id     uuid NOT NULL,
  status      public.mentor_client_status NOT NULL DEFAULT 'active',
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Add unique constraint
ALTER TABLE public.mentor_clients 
ADD CONSTRAINT uk_mentor_clients_mentor_user UNIQUE (mentor_id, user_id);

-- Add foreign key constraints one by one
ALTER TABLE public.mentor_clients 
ADD CONSTRAINT fk_mentor_clients_mentor 
FOREIGN KEY (mentor_id) REFERENCES public.mentors(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.mentor_clients ENABLE ROW LEVEL SECURITY;