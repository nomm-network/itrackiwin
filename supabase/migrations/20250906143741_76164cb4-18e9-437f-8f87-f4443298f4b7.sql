-- Create gyms table (enhance existing if needed)
CREATE TABLE IF NOT EXISTS public.gyms (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  name text not null,
  country text,
  city text,
  address text,
  photo_url text,
  status text not null default 'active' check (status in ('active','inactive','pending')),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Update existing gym_admins table to ensure proper constraints
ALTER TABLE public.gym_admins DROP CONSTRAINT IF EXISTS gym_admins_pkey;
ALTER TABLE public.gym_admins ADD CONSTRAINT gym_admins_pkey PRIMARY KEY (gym_id, user_id);
ALTER TABLE public.gym_admins ADD COLUMN IF NOT EXISTS created_at timestamptz not null default now();
ALTER TABLE public.gym_admins ADD CONSTRAINT gym_admins_role_check CHECK (role in ('owner','admin','staff'));

-- Create gym_coach_memberships table
CREATE TABLE IF NOT EXISTS public.gym_coach_memberships (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references public.gyms(id) on delete cascade,
  mentor_id uuid not null references public.mentors(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','rejected','removed')),
  requested_by uuid not null,
  decided_by uuid,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  unique (gym_id, mentor_id)
);

-- Update gym_equipment table structure
ALTER TABLE public.gym_equipment ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE public.gym_equipment ADD COLUMN IF NOT EXISTS loading_mode text;
ALTER TABLE public.gym_equipment ADD COLUMN IF NOT EXISTS min_weight_kg numeric(6,2) default 0;
ALTER TABLE public.gym_equipment ADD COLUMN IF NOT EXISTS max_weight_kg numeric(6,2);
ALTER TABLE public.gym_equipment ADD COLUMN IF NOT EXISTS increment_kg numeric(5,2) default 2.5;
ALTER TABLE public.gym_equipment ADD COLUMN IF NOT EXISTS count int default 1;

-- Add constraints
ALTER TABLE public.gym_equipment ADD CONSTRAINT IF NOT EXISTS gym_equipment_loading_mode_check 
  CHECK (loading_mode in ('plates','stack','fixed','bodyweight','band'));
ALTER TABLE public.gym_equipment ADD CONSTRAINT IF NOT EXISTS gym_equipment_min_weight_check 
  CHECK (min_weight_kg >= 0);
ALTER TABLE public.gym_equipment ADD CONSTRAINT IF NOT EXISTS gym_equipment_max_weight_check 
  CHECK (max_weight_kg >= 0);
ALTER TABLE public.gym_equipment ADD CONSTRAINT IF NOT EXISTS gym_equipment_increment_check 
  CHECK (increment_kg >= 0);
ALTER TABLE public.gym_equipment ADD CONSTRAINT IF NOT EXISTS gym_equipment_count_check 
  CHECK (count >= 0);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gym_equipment_gym ON public.gym_equipment(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_coach_memberships_gym ON public.gym_coach_memberships(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_coach_memberships_mentor ON public.gym_coach_memberships(mentor_id);

-- Helper function: is_gym_admin
CREATE OR REPLACE FUNCTION public.is_gym_admin(gym_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gym_admins ga
    WHERE ga.gym_id = gym_uuid AND ga.user_id = auth.uid()
  );
$$;

-- Helper function: create_gym
CREATE OR REPLACE FUNCTION public.create_gym(p_name text, p_city text, p_country text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  gid uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.gyms(id, name, city, country, created_by)
  VALUES (gid, p_name, p_city, p_country, auth.uid());

  INSERT INTO public.gym_admins(gym_id, user_id, role)
  VALUES (gid, auth.uid(), 'owner');

  RETURN gid;
END;
$$;

-- Helper function: assign_gym_admin
CREATE OR REPLACE FUNCTION public.assign_gym_admin(p_gym uuid, p_user uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.gym_admins
    WHERE gym_id = p_gym AND user_id = auth.uid() AND role IN ('owner','admin')
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_role NOT IN ('owner','admin','staff') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  INSERT INTO public.gym_admins(gym_id, user_id, role)
  VALUES (p_gym, p_user, p_role)
  ON CONFLICT (gym_id, user_id) DO UPDATE SET role = EXCLUDED.role;
END;
$$;

-- Helper function: request_gym_coach
CREATE OR REPLACE FUNCTION public.request_gym_coach(p_gym uuid, p_mentor_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure caller owns that mentor profile
  IF NOT EXISTS (
    SELECT 1 FROM public.mentors m
    WHERE m.id = p_mentor_id AND m.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized for mentor profile';
  END IF;

  INSERT INTO public.gym_coach_memberships(gym_id, mentor_id, status, requested_by)
  VALUES (p_gym, p_mentor_id, 'pending', auth.uid())
  ON CONFLICT (gym_id, mentor_id) DO NOTHING;
END;
$$;

-- Helper function: decide_gym_coach
CREATE OR REPLACE FUNCTION public.decide_gym_coach(p_gym uuid, p_mentor_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_status NOT IN ('active','rejected','removed') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  IF NOT public.is_gym_admin(p_gym) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.gym_coach_memberships
  SET status = p_status, decided_by = auth.uid(), decided_at = now()
  WHERE gym_id = p_gym AND mentor_id = p_mentor_id;
END;
$$;

-- RLS Policies
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- Gyms policies
DROP POLICY IF EXISTS "gyms_read" ON public.gyms;
CREATE POLICY "gyms_read" ON public.gyms
FOR SELECT USING (true);

DROP POLICY IF EXISTS "gyms_insert" ON public.gyms;
CREATE POLICY "gyms_insert" ON public.gyms
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "gyms_update_admin" ON public.gyms;
CREATE POLICY "gyms_update_admin" ON public.gyms
FOR UPDATE USING (public.is_gym_admin(id));

DROP POLICY IF EXISTS "gyms_delete_owner" ON public.gyms;
CREATE POLICY "gyms_delete_owner" ON public.gyms
FOR DELETE USING (created_by = auth.uid());

-- Gym coach memberships policies
ALTER TABLE public.gym_coach_memberships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gcm_select" ON public.gym_coach_memberships;
CREATE POLICY "gcm_select" ON public.gym_coach_memberships
FOR SELECT USING (
  public.is_gym_admin(gym_id) OR
  EXISTS (SELECT 1 FROM public.mentors m WHERE m.id = mentor_id AND m.user_id = auth.uid())
);

DROP POLICY IF EXISTS "gcm_insert" ON public.gym_coach_memberships;
CREATE POLICY "gcm_insert" ON public.gym_coach_memberships
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.mentors m WHERE m.id = mentor_id AND m.user_id = auth.uid())
);

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_gym_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_gym(text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_gym_admin(uuid,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_gym_coach(uuid,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decide_gym_coach(uuid,uuid,text) TO authenticated;