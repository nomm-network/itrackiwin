-- Add idempotency support and enhanced rate limiting

-- Create idempotency keys table
CREATE TABLE public.idempotency_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  operation_type TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '24 hours')
);

-- Add RLS policies for idempotency keys
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own idempotency keys"
ON public.idempotency_keys
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_idempotency_keys_user_operation ON public.idempotency_keys(user_id, operation_type);
CREATE INDEX idx_idempotency_keys_expires_at ON public.idempotency_keys(expires_at);

-- Add rate limiting function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID,
  p_operation_type TEXT,
  p_max_requests INTEGER DEFAULT 10,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_window_start TIMESTAMP WITH TIME ZONE;
  v_request_count INTEGER;
BEGIN
  -- Calculate window start time
  v_window_start := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Count requests in current window
  SELECT COUNT(*)
  INTO v_request_count
  FROM public.idempotency_keys
  WHERE user_id = p_user_id
    AND operation_type = p_operation_type
    AND created_at >= v_window_start;
  
  -- Return true if under limit
  RETURN v_request_count < p_max_requests;
END;
$$;

-- Add idempotency checking function
CREATE OR REPLACE FUNCTION public.check_idempotency(
  p_key TEXT,
  p_user_id UUID,
  p_operation_type TEXT,
  p_request_hash TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_existing_record RECORD;
BEGIN
  -- Check for existing idempotency key
  SELECT *
  INTO v_existing_record
  FROM public.idempotency_keys
  WHERE key = p_key
    AND user_id = p_user_id
    AND operation_type = p_operation_type
    AND expires_at > now();
  
  IF FOUND THEN
    -- If request hash matches, return cached response
    IF v_existing_record.request_hash = p_request_hash THEN
      RETURN jsonb_build_object(
        'cached', true,
        'response', v_existing_record.response_data,
        'created_at', v_existing_record.created_at
      );
    ELSE
      -- If request hash differs, this is a conflict
      RETURN jsonb_build_object(
        'error', true,
        'message', 'Idempotency key reused with different request data'
      );
    END IF;
  END IF;
  
  -- No existing record found
  RETURN jsonb_build_object('cached', false);
END;
$$;

-- Add function to store idempotency result
CREATE OR REPLACE FUNCTION public.store_idempotency_result(
  p_key TEXT,
  p_user_id UUID,
  p_operation_type TEXT,
  p_request_hash TEXT,
  p_response_data JSONB
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.idempotency_keys (
    key,
    user_id,
    operation_type,
    request_hash,
    response_data
  ) VALUES (
    p_key,
    p_user_id,
    p_operation_type,
    p_request_hash,
    p_response_data
  )
  ON CONFLICT (key) DO UPDATE SET
    response_data = EXCLUDED.response_data;
END;
$$;

-- Clean up expired idempotency keys (for cron job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  DELETE FROM public.idempotency_keys
  WHERE expires_at < now();
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  RETURN v_deleted_count;
END;
$$;