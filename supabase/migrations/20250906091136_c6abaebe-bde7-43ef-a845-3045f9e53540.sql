-- Migration A: Create tables first (no policies)

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.mentor_clients CASCADE;
DROP TABLE IF EXISTS public.mentors CASCADE;
DROP TYPE IF EXISTS public.mentor_type CASCADE;
DROP TYPE IF EXISTS public.mentor_client_status CASCADE;

-- Create enum types
CREATE TYPE public.mentor_type AS ENUM ('mentor','coach');
CREATE TYPE public.mentor_client_status AS ENUM ('active','inactive','pending');

-- Create mentors table
CREATE TABLE public.mentors (
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

-- Create indexes for mentors
CREATE INDEX idx_mentors_user_id ON public.mentors(user_id);
CREATE INDEX idx_mentors_public ON public.mentors(is_public);

-- Create mentor_clients table
CREATE TABLE public.mentor_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL REFERENCES public.mentors(id) ON DELETE CASCADE,
  client_user_id uuid NOT NULL,                         -- links to auth.users.id (no FK across schemas)
  status public.mentor_client_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (mentor_id, client_user_id)
);

-- Create indexes for mentor_clients
CREATE INDEX idx_mentor_clients_mentor ON public.mentor_clients(mentor_id);
CREATE INDEX idx_mentor_clients_client ON public.mentor_clients(client_user_id);