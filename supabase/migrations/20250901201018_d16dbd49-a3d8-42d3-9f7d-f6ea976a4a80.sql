-- Fix for target_weight vs target_weight_kg mismatch
-- 1) Normalize template weights once (backfill target_weight_kg)

-- Backfill kg from legacy target_weight using unit when present
UPDATE public.template_exercises te
SET target_weight_kg = COALESCE(
  te.target_weight_kg,
  CASE
    WHEN te.target_weight IS NULL THEN NULL
    WHEN COALESCE(te.weight_unit, 'kg') ILIKE 'lb' THEN ROUND(te.target_weight * 0.45359237::numeric, 2)
    ELSE te.target_weight::numeric
  END
)
WHERE te.target_weight_kg IS NULL
  AND te.target_weight IS NOT NULL;

-- 2) Make start_workout resilient to both columns
CREATE OR REPLACE FUNCTION public.start_workout(p_template_id uuid DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_workout_id uuid;
  v_user_id uuid;
BEGIN
  -- 1) Who's calling
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2) Create the workout shell
  INSERT INTO public.workouts (user_id, started_at)
  VALUES (v_user_id, now())
  RETURNING id INTO v_workout_id;

  -- 3) Optionally hydrate from template
  IF p_template_id IS NOT NULL THEN
    -- Own or accessible template (removed is_public check since column doesn't exist)
    IF NOT EXISTS (
      SELECT 1
      FROM public.workout_templates wt
      WHERE wt.id = p_template_id
            AND wt.user_id = v_user_id
    ) THEN
      RAISE EXCEPTION 'Template not found or access denied';
    END IF;

    INSERT INTO public.workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      target_sets,
      target_reps,
      target_weight_kg,
      weight_unit,
      rest_seconds,
      notes
    )
    SELECT
      v_workout_id,
      te.exercise_id,
      te.order_index,
      te.default_sets,
      te.target_reps,
      COALESCE(
        te.target_weight_kg,
        CASE
          WHEN te.target_weight IS NULL THEN NULL
          WHEN COALESCE(te.weight_unit, 'kg') ILIKE 'lb' THEN ROUND(te.target_weight * 0.45359237::numeric, 2)
          ELSE te.target_weight::numeric
        END
      ) AS target_weight_kg,
      NULLIF(te.weight_unit, '') AS weight_unit,
      te.rest_seconds,
      te.notes
    FROM public.template_exercises te
    WHERE te.template_id = p_template_id
    ORDER BY te.order_index NULLS LAST;
  END IF;

  RETURN v_workout_id;
END;
$$;

-- 3) Keep future edits consistent with trigger
CREATE OR REPLACE FUNCTION public.trg_te_sync_weights()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If kg provided explicitly, it wins
  IF NEW.target_weight_kg IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Else derive kg from legacy target_weight + unit
  IF NEW.target_weight IS NOT NULL THEN
    NEW.target_weight_kg :=
      CASE
        WHEN COALESCE(NEW.weight_unit, 'kg') ILIKE 'lb' THEN ROUND(NEW.target_weight * 0.45359237::numeric, 2)
        ELSE NEW.target_weight::numeric
      END;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS te_sync_weights ON public.template_exercises;
CREATE TRIGGER te_sync_weights
BEFORE INSERT OR UPDATE ON public.template_exercises
FOR EACH ROW EXECUTE FUNCTION public.trg_te_sync_weights();