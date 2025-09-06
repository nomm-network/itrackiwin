-- Create or replace the admin_upsert_mentor_fixed function to handle gym_id
CREATE OR REPLACE FUNCTION public.admin_upsert_mentor_fixed(p_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mentor_id uuid;
  v_user_id uuid;
  v_life_category_id uuid;
  v_mentor_type text;
  v_bio text;
  v_hourly_rate numeric;
  v_is_active boolean;
  v_gym_id uuid;
BEGIN
  -- Validate admin access
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Extract values from payload
  v_mentor_id := (p_payload->>'id')::uuid;
  v_user_id := (p_payload->>'user_id')::uuid;
  v_life_category_id := (p_payload->>'primary_category_id')::uuid;
  v_mentor_type := p_payload->>'mentor_type';
  v_bio := p_payload->>'bio';
  v_hourly_rate := (p_payload->>'hourly_rate')::numeric;
  v_is_active := COALESCE((p_payload->>'is_active')::boolean, true);
  v_gym_id := (p_payload->>'gym_id')::uuid;

  -- Validate required fields
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'user_id is required';
  END IF;
  
  IF v_mentor_type IS NULL THEN
    RAISE EXCEPTION 'mentor_type is required';
  END IF;

  -- Insert or update mentor record
  INSERT INTO public.mentors (
    id, user_id, life_category_id, mentor_type, bio, hourly_rate, gym_id
  ) VALUES (
    COALESCE(v_mentor_id, gen_random_uuid()),
    v_user_id,
    v_life_category_id,
    v_mentor_type::public.mentor_type,
    v_bio,
    v_hourly_rate,
    v_gym_id
  )
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    life_category_id = EXCLUDED.life_category_id,
    mentor_type = EXCLUDED.mentor_type,
    bio = EXCLUDED.bio,
    hourly_rate = EXCLUDED.hourly_rate,
    gym_id = EXCLUDED.gym_id,
    updated_at = now()
  RETURNING id INTO v_mentor_id;

  -- Handle mentor category assignment
  IF v_life_category_id IS NOT NULL THEN
    INSERT INTO public.mentor_category_assignments (
      mentor_user_id, life_category_id, mentor_type, is_active, created_by
    ) VALUES (
      v_user_id, v_life_category_id, v_mentor_type::public.mentor_type, v_is_active, auth.uid()
    )
    ON CONFLICT (mentor_user_id, life_category_id) DO UPDATE SET
      is_active = EXCLUDED.is_active,
      mentor_type = EXCLUDED.mentor_type;
  END IF;

  RETURN v_mentor_id;
END;
$$;