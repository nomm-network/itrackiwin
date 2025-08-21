-- Create improved admin functions without user_id parameter for better security
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'superadmin'::app_role
  );
$$;

-- Rate-limited variant, no parameters, bound to the caller only
CREATE OR REPLACE FUNCTION public.is_superadmin_with_rate_limit()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _uid uuid := auth.uid();
  rate_limit_record record;
  current_time timestamptz := now();
  window_duration interval := '1 minute';
  max_checks_per_window integer := 10;
BEGIN
  IF _uid IS NULL THEN
    RETURN false;
  END IF;

  SELECT * INTO rate_limit_record
  FROM public.admin_check_rate_limit
  WHERE user_id = _uid
    AND window_start > (current_time - window_duration)
  LIMIT 1;

  IF rate_limit_record IS NULL THEN
    INSERT INTO public.admin_check_rate_limit (user_id, check_count, window_start)
    VALUES (_uid, 1, current_time);
  ELSE
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
        _uid,
        _uid,
        jsonb_build_object('check_count', rate_limit_record.check_count, 'window_start', rate_limit_record.window_start),
        current_time
      );
      
      RAISE EXCEPTION 'Rate limit exceeded for admin checks. Please try again later.';
    END IF;

    UPDATE public.admin_check_rate_limit
       SET check_count = check_count + 1
     WHERE id = rate_limit_record.id;
  END IF;

  DELETE FROM public.admin_check_rate_limit
  WHERE window_start < (current_time - interval '1 hour');

  RETURN public.is_superadmin();
END;
$function$;