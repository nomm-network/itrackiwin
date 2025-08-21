-- Security Fixes Migration
-- Fix 1: Remove/Secure Privilege Escalation Vulnerability
-- Replace bootstrap_admin_if_empty with secure admin creation process

-- First, let's create a more secure admin creation function that requires explicit authorization
CREATE OR REPLACE FUNCTION public.create_admin_user(target_user_id uuid, requester_role text DEFAULT 'system')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  requester_id uuid := auth.uid();
  is_authorized boolean := false;
BEGIN
  -- Only allow system calls or existing superadmins to create new admins
  IF requester_role = 'system' AND requester_id IS NULL THEN
    -- System initialization - only when no admins exist
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'superadmin')) THEN
      is_authorized := true;
    END IF;
  ELSIF requester_id IS NOT NULL THEN
    -- Check if requester is superadmin
    SELECT public.has_role(requester_id, 'superadmin') INTO is_authorized;
  END IF;

  IF NOT is_authorized THEN
    RAISE EXCEPTION 'Unauthorized: Only superadmins can create admin users';
  END IF;

  -- Create the admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Log the admin creation
  INSERT INTO public.admin_audit_log (
    action_type, 
    target_user_id, 
    performed_by, 
    details,
    created_at
  ) VALUES (
    'admin_created',
    target_user_id,
    COALESCE(requester_id, '00000000-0000-0000-0000-000000000000'::uuid),
    jsonb_build_object('requester_role', requester_role),
    now()
  );

  RETURN true;
END;
$function$;

-- Replace the insecure bootstrap function
DROP FUNCTION IF EXISTS public.bootstrap_admin_if_empty();

-- Fix 2: Create admin audit logging table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  target_user_id uuid,
  performed_by uuid,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only superadmins can view audit logs
CREATE POLICY "Superadmins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (public.has_role(auth.uid(), 'superadmin'));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Fix 3: Add rate limiting table for admin checks
CREATE TABLE IF NOT EXISTS public.admin_check_rate_limit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  check_count integer DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_check_rate_limit ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limit records
CREATE POLICY "Users can view own rate limits" 
ON public.admin_check_rate_limit 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own rate limit records
CREATE POLICY "Users can insert own rate limits" 
ON public.admin_check_rate_limit 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own rate limit records
CREATE POLICY "Users can update own rate limits" 
ON public.admin_check_rate_limit 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fix 4: Create secure admin check function with rate limiting
CREATE OR REPLACE FUNCTION public.is_admin_with_rate_limit(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  -- Perform the actual admin check
  RETURN public.is_admin(_user_id);
END;
$function$;

-- Fix 5: Add function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  target_user_id uuid DEFAULT NULL,
  details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  -- Log the action
  INSERT INTO public.admin_audit_log (
    action_type,
    target_user_id,
    performed_by,
    details,
    created_at
  ) VALUES (
    action_type,
    target_user_id,
    auth.uid(),
    details,
    now()
  );
END;
$function$;

-- Fix 6: Update the original is_admin function to log usage
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result boolean;
BEGIN
  -- Perform the check
  SELECT (public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'superadmin')) INTO result;
  
  -- Log admin check if result is true (successful admin access)
  IF result = true THEN
    INSERT INTO public.admin_audit_log (
      action_type,
      target_user_id,
      performed_by,
      details,
      created_at
    ) VALUES (
      'admin_check_success',
      _user_id,
      _user_id,
      jsonb_build_object('check_result', result),
      now()
    );
  END IF;

  RETURN result;
END;
$function$;