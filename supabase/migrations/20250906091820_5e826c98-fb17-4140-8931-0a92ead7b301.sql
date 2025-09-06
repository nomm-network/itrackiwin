-- Migration A: Create tables first (no policies)
-- Drop the user_id-based tables to use the original id-based approach
DROP TABLE IF EXISTS public.mentor_categories CASCADE;
DROP TABLE IF EXISTS public.mentor_rates CASCADE;
DROP TABLE IF EXISTS public.mentors CASCADE;
DROP VIEW IF EXISTS public.v_mentors_public CASCADE;
DROP TYPE IF EXISTS public.mentor_type CASCADE;

-- Create the enum
CREATE TYPE public.mentor_type AS ENUM ('mentor','coach');

-- Create mentors table (with id as PK, user_id as FK)
CREATE TABLE IF NOT EXISTS public.mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,                                -- links to auth.users.id (no FK across schemas)
  life_category_id uuid NULL,                           -- optional, if you have public.life_categories
  mentor_type public.mentor_type NOT NULL DEFAULT 'mentor',
  display_name text,
  bio text,
  is_public boolean NOT NULL DEFAULT true,
  hourly_rate numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add FK to life_categories if it exists
ALTER TABLE public.mentors
  ADD CONSTRAINT fk_mentors_life_category
  FOREIGN KEY (life_category_id) REFERENCES public.life_categories(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_mentors_user_id ON public.mentors(user_id);
CREATE INDEX IF NOT EXISTS idx_mentors_public ON public.mentors(is_public);

-- Create mentor_clients table
CREATE TABLE IF NOT EXISTS public.mentor_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  client_user_id uuid NOT NULL,                         -- links to auth.users.id (no FK across schemas)
  status text NOT NULL DEFAULT 'active',                -- or make an enum later
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mentor_id, client_user_id)
);

-- Create indexes for mentor_clients
CREATE INDEX IF NOT EXISTS idx_mentor_clients_mentor ON public.mentor_clients(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_clients_client ON public.mentor_clients(client_user_id);