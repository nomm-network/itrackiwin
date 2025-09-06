-- Read-only view for the admin mentors grid
CREATE OR REPLACE VIEW public.v_admin_mentors_overview AS
SELECT
  m.id,
  m.user_id,
  m.display_name,
  null::text as email,  -- email is in auth.users which we can't access directly
  m.mentor_type,              -- enum: 'mentor' | 'coach'
  m.life_category_id as primary_category_id,
  lc.name        AS primary_category_name,
  m.is_public as is_active,  -- using is_public as is_active for now
  m.hourly_rate,
  m.bio,
  m.created_at,
  m.updated_at
FROM public.mentors m
LEFT JOIN public.life_categories lc ON lc.id = m.life_category_id;

-- Upsert RPC (create/update one mentor)
CREATE OR REPLACE FUNCTION public.admin_upsert_mentor(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid := (p_payload->>'id')::uuid;
BEGIN
  -- insert or update
  INSERT INTO public.mentors AS m (
    id, user_id, mentor_type, life_category_id, is_public, bio, hourly_rate
  )
  VALUES (
    COALESCE(v_id, gen_random_uuid()),
    (p_payload->>'user_id')::uuid,
    (p_payload->>'mentor_type')::text::mentor_type,
    NULLIF(p_payload->>'primary_category_id','')::uuid,
    COALESCE((p_payload->>'is_active')::boolean, true),
    NULLIF(p_payload->>'bio',''),
    NULLIF(p_payload->>'hourly_rate','')::numeric
  )
  ON CONFLICT (id) DO UPDATE
  SET mentor_type        = EXCLUDED.mentor_type,
      life_category_id   = EXCLUDED.life_category_id,
      is_public          = EXCLUDED.is_public,
      bio                = EXCLUDED.bio,
      hourly_rate        = EXCLUDED.hourly_rate,
      updated_at         = now()
  RETURNING jsonb_build_object('id', m.id);
END;
$$;

-- Optional: limit who can call it (example: admins role)
REVOKE ALL ON FUNCTION public.admin_upsert_mentor(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_upsert_mentor(jsonb) TO anon, authenticated;

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

REVOKE ALL ON FUNCTION public.admin_delete_mentor(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_delete_mentor(uuid) TO anon, authenticated;