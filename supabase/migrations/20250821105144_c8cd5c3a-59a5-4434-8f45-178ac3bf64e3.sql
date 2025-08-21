-- Create superadmin-only check function
CREATE OR REPLACE FUNCTION public.is_superadmin_with_rate_limit(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rate_limit_record record;
  current_time timestamp with time zone := now();
  window_duration interval := '1 minute';
  max_checks_per_window integer := 10;
BEGIN
  -- Check if user ID is provided
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get or create rate limit record
  SELECT * INTO rate_limit_record
  FROM public.admin_check_rate_limit
  WHERE user_id = _user_id 
  AND window_start > (current_time - window_duration);

  IF rate_limit_record IS NULL THEN
    -- Create new rate limit window
    INSERT INTO public.admin_check_rate_limit (user_id, check_count, window_start)
    VALUES (_user_id, 1, current_time);
  ELSE
    -- Check if rate limit exceeded
    IF rate_limit_record.check_count >= max_checks_per_window THEN
      -- Log suspicious activity
      INSERT INTO public.admin_audit_log (
        action_type, 
        target_user_id, 
        performed_by, 
        details,
        created_at
      ) VALUES (
        'rate_limit_exceeded',
        _user_id,
        _user_id,
        jsonb_build_object('check_count', rate_limit_record.check_count, 'window_start', rate_limit_record.window_start),
        current_time
      );
      
      RAISE EXCEPTION 'Rate limit exceeded for admin checks. Please try again later.';
    END IF;

    -- Increment counter
    UPDATE public.admin_check_rate_limit
    SET check_count = check_count + 1
    WHERE id = rate_limit_record.id;
  END IF;

  -- Clean up old rate limit records (older than 1 hour)
  DELETE FROM public.admin_check_rate_limit
  WHERE window_start < (current_time - interval '1 hour');

  -- ONLY check for superadmin role (not admin)
  RETURN public.has_role(_user_id, 'superadmin');
END;
$$;