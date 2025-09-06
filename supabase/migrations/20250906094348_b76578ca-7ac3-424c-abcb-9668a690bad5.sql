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