-- Add warmup functionality to workout_exercises
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS warmup_plan jsonb,
  ADD COLUMN IF NOT EXISTS warmup_feedback text,
  ADD COLUMN IF NOT EXISTS warmup_updated_at timestamptz DEFAULT now();

-- Optional: default warmup at the template level
ALTER TABLE public.template_exercises
  ADD COLUMN IF NOT EXISTS default_warmup_plan jsonb;

-- Add sets configuration
ALTER TABLE public.workout_exercises
  ADD COLUMN IF NOT EXISTS target_sets integer DEFAULT 3;

-- Helpful GIN index for warmup content search
CREATE INDEX IF NOT EXISTS idx_workout_exercises_warmup_plan_gin
  ON public.workout_exercises USING GIN (warmup_plan jsonb_path_ops);

-- RPC to generate warmup suggestions
CREATE OR REPLACE FUNCTION public.generate_warmup_json(
  p_top_weight numeric,
  p_top_reps integer DEFAULT 8,
  p_unit text DEFAULT 'kg'
) RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  w1 numeric := round(p_top_weight * 0.40::numeric, 1);
  w2 numeric := round(p_top_weight * 0.55::numeric, 1);
  w3 numeric := round(p_top_weight * 0.70::numeric, 1);
BEGIN
  IF p_top_weight IS NULL OR p_top_weight <= 0 THEN
    RETURN jsonb_build_object(
      'version', 1,
      'strategy', 'ramped',
      'unit', coalesce(p_unit, 'kg'),
      'steps', jsonb_build_array()
    );
  END IF;

  RETURN jsonb_build_object(
    'version', 1,
    'strategy', 'ramped',
    'unit', coalesce(p_unit, 'kg'),
    'top_set_hint', jsonb_build_object(
      'weight', p_top_weight, 'reps', p_top_reps, 'rpe', 8
    ),
    'steps', jsonb_build_array(
      jsonb_build_object('id','w1','weight',w1,'reps',10,'rest',60),
      jsonb_build_object('id','w2','weight',w2,'reps',8, 'rest',60),
      jsonb_build_object('id','w3','weight',w3,'reps',5, 'rest',60)
    )
  );
END;
$$;