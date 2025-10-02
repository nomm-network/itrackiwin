-- Create the missing generate_warmup_steps function
CREATE OR REPLACE FUNCTION public.generate_warmup_steps(target_weight_kg numeric)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  warmup_sets jsonb := '[]'::jsonb;
  set_weight numeric;
BEGIN
  -- If target is too low, return empty warmup
  IF target_weight_kg IS NULL OR target_weight_kg < 20 THEN
    RETURN '[]'::jsonb;
  END IF;
  
  -- Generate 2-3 warmup sets at 40%, 60%, 80% of target
  -- 40% warmup set
  set_weight := ROUND((target_weight_kg * 0.4) / 2.5) * 2.5;
  IF set_weight >= 2.5 THEN
    warmup_sets := warmup_sets || jsonb_build_object(
      'weight_kg', set_weight,
      'reps', 8,
      'set_kind', 'warmup'
    );
  END IF;
  
  -- 60% warmup set
  set_weight := ROUND((target_weight_kg * 0.6) / 2.5) * 2.5;
  IF set_weight >= 2.5 THEN
    warmup_sets := warmup_sets || jsonb_build_object(
      'weight_kg', set_weight,
      'reps', 5,
      'set_kind', 'warmup'
    );
  END IF;
  
  -- 80% warmup set
  set_weight := ROUND((target_weight_kg * 0.8) / 2.5) * 2.5;
  IF set_weight >= 2.5 THEN
    warmup_sets := warmup_sets || jsonb_build_object(
      'weight_kg', set_weight,
      'reps', 3,
      'set_kind', 'warmup'
    );
  END IF;
  
  RETURN warmup_sets;
END;
$$;