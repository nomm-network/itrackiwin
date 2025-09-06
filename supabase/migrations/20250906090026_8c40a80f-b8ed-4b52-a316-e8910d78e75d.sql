-- Step 1: Database foundation for Mentors/Coaches feature (Minimal)

-- 1. Create enums
CREATE TYPE IF NOT EXISTS public.mentor_type AS ENUM ('mentor','coach');
CREATE TYPE IF NOT EXISTS public.mentor_client_status AS ENUM ('invited','active','paused','ended');

-- 2. Create mentors table
CREATE TABLE IF NOT EXISTS public.mentors (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL,
  mentor_kind        public.mentor_type NOT NULL,
  life_category_id   uuid NULL,
  display_name       text,
  bio                text,
  hourly_rate        numeric(10,2),
  currency           text DEFAULT 'USD',
  is_active          boolean NOT NULL DEFAULT true,
  accepting_clients  boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- 3. Add foreign key constraints separately
ALTER TABLE public.mentors 
ADD CONSTRAINT fk_mentors_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 4. Enable RLS
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- 5. Basic policies
CREATE POLICY mentors_owner_read ON public.mentors
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY mentors_public_read ON public.mentors
  FOR SELECT 
  TO anon, authenticated
  USING (is_active = true AND accepting_clients = true);