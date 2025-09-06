-- Drop existing functions and view to recreate them properly
DROP FUNCTION IF EXISTS public.admin_upsert_mentor(jsonb);
DROP FUNCTION IF EXISTS public.admin_delete_mentor(uuid);
DROP VIEW IF EXISTS public.v_admin_mentors_overview;

-- View used by useMentors()/useMentor() - get display_name and email from auth metadata
CREATE OR REPLACE VIEW public.v_admin_mentors_overview AS
SELECT
  m.id,
  m.user_id,
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'full_name',
    au.email
  ) as display_name,
  au.email,
  m.mentor_type,           -- 'mentor' | 'coach'
  m.primary_category_id,   -- FK to life_categories.id (nullable)
  m.is_active,
  m.hourly_rate,
  m.created_at
FROM public.mentors m
JOIN auth.users au ON au.id = m.user_id;

-- Upsert RPC
CREATE OR REPLACE FUNCTION public.admin_upsert_mentor(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid := (p_payload->>'id')::uuid;
  v_user uuid := (p_payload->>'user_id')::uuid;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  IF v_id IS NULL THEN
    INSERT INTO public.mentors (
      user_id,
      mentor_type,
      primary_category_id,
      is_active,
      bio,
      hourly_rate
    )
    VALUES (
      v_user,
      COALESCE(p_payload->>'mentor_type','mentor')::text,
      NULLIF(p_payload->>'primary_category_id','')::uuid,
      COALESCE((p_payload->>'is_active')::boolean, true),
      p_payload->>'bio',
      NULLIF(p_payload->>'hourly_rate','')::numeric
    )
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.mentors SET
      mentor_type         = COALESCE(p_payload->>'mentor_type', mentor_type),
      primary_category_id = COALESCE(NULLIF(p_payload->>'primary_category_id','')::uuid, primary_category_id),
      is_active           = COALESCE((p_payload->>'is_active')::boolean, is_active),
      bio                 = COALESCE(p_payload->>'bio', bio),
      hourly_rate         = COALESCE(NULLIF(p_payload->>'hourly_rate','')::numeric, hourly_rate),
      updated_at          = now()
    WHERE id = v_id;
  END IF;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_upsert_mentor(jsonb) TO authenticated;

-- Delete RPC
CREATE OR REPLACE FUNCTION public.admin_delete_mentor(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.mentors WHERE id = p_id;
  RETURN FOUND;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_mentor(uuid) TO authenticated;

-- RLS policies for mentors table
DROP POLICY IF EXISTS mentors_admin_all ON public.mentors;
CREATE POLICY mentors_admin_all
  ON public.mentors
  USING (true)           -- read
  WITH CHECK (true);     -- write