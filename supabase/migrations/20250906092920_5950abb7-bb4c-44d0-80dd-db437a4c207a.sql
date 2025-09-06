-- Create admin mentors SQL foundation (corrected)

-- READ-ONLY ADMIN VIEW
CREATE OR REPLACE VIEW public.v_admin_mentors_overview AS
SELECT
  m.id,
  m.user_id,
  COALESCE(m.display_name, 'Unknown User') as display_name,
  m.mentor_type,
  m.life_category_id as primary_category_id,
  m.is_public,
  m.bio,
  m.hourly_rate,
  m.created_at,
  m.updated_at
FROM public.mentors m;

-- Upsert RPC (expects JSONB payload)
CREATE OR REPLACE FUNCTION public.admin_upsert_mentor(p_payload jsonb)
RETURNS TABLE (id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid := coalesce((p_payload->>'id')::uuid, gen_random_uuid());
BEGIN
  INSERT INTO public.mentors AS m (
    id, user_id, mentor_type, life_category_id, is_public, display_name, bio, hourly_rate
  )
  VALUES (
    v_id,
    (p_payload->>'user_id')::uuid,
    (p_payload->>'mentor_type')::text::public.mentor_type,
    (p_payload->>'primary_category_id')::uuid,
    COALESCE((p_payload->>'is_public')::boolean, true),
    (p_payload->>'display_name'),
    (p_payload->>'bio'),
    NULLIF((p_payload->>'hourly_rate')::numeric, 0)
  )
  ON CONFLICT (id) DO UPDATE
    SET mentor_type        = EXCLUDED.mentor_type,
        life_category_id   = EXCLUDED.life_category_id,
        is_public          = EXCLUDED.is_public,
        display_name       = EXCLUDED.display_name,
        bio                = EXCLUDED.bio,
        hourly_rate        = EXCLUDED.hourly_rate,
        updated_at         = now()
  RETURNING m.id INTO v_id;
  RETURN QUERY SELECT v_id;
END$$;

-- Delete RPC
CREATE OR REPLACE FUNCTION public.admin_delete_mentor(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.mentors WHERE id = p_id;
  RETURN found;
END$$;