-- Fix the trigger function to work with normalized schema
CREATE OR REPLACE FUNCTION public.trg_te_sync_weights()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Since we've normalized to only use target_weight_kg, this trigger
  -- now just ensures the weight_unit defaults properly
  IF NEW.weight_unit IS NULL THEN
    NEW.weight_unit := 'kg';
  END IF;

  RETURN NEW;
END;
$$;