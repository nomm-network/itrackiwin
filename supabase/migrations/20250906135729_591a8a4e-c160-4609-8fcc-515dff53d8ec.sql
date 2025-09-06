-- Create a new RPC function that properly handles mentor_type enum
CREATE OR REPLACE FUNCTION public.admin_upsert_mentor_fixed(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid := (p_payload->>'id')::uuid;
  v_user uuid := (p_payload->>'user_id')::uuid;
  v_mentor_type_text text := p_payload->>'mentor_type';
  v_mentor_type_enum mentor_type;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;

  -- Cast text to enum safely
  v_mentor_type_enum := CASE 
    WHEN v_mentor_type_text = 'coach' THEN 'coach'::mentor_type
    WHEN v_mentor_type_text = 'mentor' THEN 'mentor'::mentor_type
    ELSE 'mentor'::mentor_type
  END;

  IF v_id IS NULL THEN
    INSERT INTO public.mentors (
      user_id,
      mentor_type,
      life_category_id,
      is_public,
      bio,
      hourly_rate
    )
    VALUES (
      v_user,
      v_mentor_type_enum,
      NULLIF(p_payload->>'primary_category_id','')::uuid,
      COALESCE((p_payload->>'is_active')::boolean, true),
      p_payload->>'bio',
      NULLIF(p_payload->>'hourly_rate','')::numeric
    )
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.mentors SET
      mentor_type         = v_mentor_type_enum,
      life_category_id    = COALESCE(NULLIF(p_payload->>'primary_category_id','')::uuid, life_category_id),
      is_public           = COALESCE((p_payload->>'is_active')::boolean, is_public),
      bio                 = COALESCE(p_payload->>'bio', bio),
      hourly_rate         = COALESCE(NULLIF(p_payload->>'hourly_rate','')::numeric, hourly_rate),
      updated_at          = now()
    WHERE id = v_id;
  END IF;

  RETURN v_id;
END;
$$;