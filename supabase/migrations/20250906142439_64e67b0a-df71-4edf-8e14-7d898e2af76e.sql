-- Fix the ON CONFLICT issue in mentor_category_assignments
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
  v_existing_id uuid;
  v_existing_assignment_id uuid;
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

  -- Check if this is an update or insert
  IF v_mentor_id IS NOT NULL THEN
    -- Update existing mentor
    UPDATE public.mentors SET
      user_id = v_user_id,
      life_category_id = v_life_category_id,
      mentor_type = v_mentor_type::public.mentor_type,
      bio = v_bio,
      hourly_rate = v_hourly_rate,
      gym_id = v_gym_id,
      updated_at = now()
    WHERE id = v_mentor_id;
    
    v_existing_id := v_mentor_id;
  ELSE
    -- Insert new mentor
    INSERT INTO public.mentors (
      user_id, life_category_id, mentor_type, bio, hourly_rate, gym_id
    ) VALUES (
      v_user_id,
      v_life_category_id,
      v_mentor_type::public.mentor_type,
      v_bio,
      v_hourly_rate,
      v_gym_id
    )
    RETURNING id INTO v_existing_id;
  END IF;

  -- Handle mentor category assignment (avoid ON CONFLICT issues)
  IF v_life_category_id IS NOT NULL THEN
    -- Check if assignment already exists
    SELECT id INTO v_existing_assignment_id
    FROM public.mentor_category_assignments
    WHERE mentor_user_id = v_user_id AND life_category_id = v_life_category_id;
    
    IF v_existing_assignment_id IS NOT NULL THEN
      -- Update existing assignment
      UPDATE public.mentor_category_assignments SET
        is_active = v_is_active,
        mentor_type = v_mentor_type::public.mentor_type
      WHERE id = v_existing_assignment_id;
    ELSE
      -- Insert new assignment
      INSERT INTO public.mentor_category_assignments (
        mentor_user_id, life_category_id, mentor_type, is_active, created_by
      ) VALUES (
        v_user_id, v_life_category_id, v_mentor_type::public.mentor_type, v_is_active, auth.uid()
      );
    END IF;
  END IF;

  RETURN v_existing_id;
END;
$$;