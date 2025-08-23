-- Create coach_logs table for debugging coach decisions
CREATE TABLE public.coach_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  step TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  outputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  session_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage coach logs" 
ON public.coach_logs 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own coach logs" 
ON public.coach_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_coach_logs_user_id ON public.coach_logs(user_id);
CREATE INDEX idx_coach_logs_function_name ON public.coach_logs(function_name);
CREATE INDEX idx_coach_logs_created_at ON public.coach_logs(created_at DESC);
CREATE INDEX idx_coach_logs_session_id ON public.coach_logs(session_id);

-- Function to log coach decisions
CREATE OR REPLACE FUNCTION public.log_coach_decision(
  p_user_id UUID,
  p_function_name TEXT,
  p_step TEXT,
  p_inputs JSONB DEFAULT '{}'::jsonb,
  p_outputs JSONB DEFAULT '{}'::jsonb,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_execution_time_ms INTEGER DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_error_message TEXT DEFAULT NULL,
  p_session_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.coach_logs (
    user_id,
    function_name,
    step,
    inputs,
    outputs,
    metadata,
    execution_time_ms,
    success,
    error_message,
    session_id
  ) VALUES (
    p_user_id,
    p_function_name,
    p_step,
    p_inputs,
    p_outputs,
    p_metadata,
    p_execution_time_ms,
    p_success,
    p_error_message,
    p_session_id
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;