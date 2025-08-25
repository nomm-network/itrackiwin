-- Create view to get last set per user/exercise/set number
CREATE OR REPLACE VIEW public.v_last_set_per_user_exercise_set AS
SELECT
  w.user_id,
  we.exercise_id,
  ws.set_index,
  ws.weight,
  ws.reps,
  ws.completed_at,
  ws.notes,
  ws.rpe,
  -- Extract feel from notes if stored there, otherwise use RPE mapping
  CASE 
    WHEN ws.notes ~ 'Feel:\s*(\+\+|\+|ok|=|-|--)'
    THEN regexp_replace(ws.notes, '.*Feel:\s*(\+\+|\+|ok|=|-|--).*', '\1', 1, 0, 'i')
    WHEN ws.rpe IS NOT NULL THEN
      CASE 
        WHEN ws.rpe >= 9.5 THEN '++'
        WHEN ws.rpe >= 8.5 THEN '+'
        WHEN ws.rpe >= 7.5 THEN 'ok'
        WHEN ws.rpe >= 6.5 THEN '-'
        ELSE '--'
      END
    ELSE NULL
  END AS feel_extracted
FROM public.workout_sets ws
JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
JOIN public.workouts w ON w.id = we.workout_id
WHERE ws.is_completed = true
  AND ws.weight IS NOT NULL
  AND ws.reps IS NOT NULL
  AND ws.reps > 0
  AND ws.completed_at IS NOT NULL
  AND ROW_NUMBER() OVER (
    PARTITION BY w.user_id, we.exercise_id, ws.set_index
    ORDER BY ws.completed_at DESC
  ) = 1;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ws_completed_at ON public.workout_sets(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ws_we_id_setidx ON public.workout_sets(workout_exercise_id, set_index);
CREATE INDEX IF NOT EXISTS idx_we_exercise_id ON public.workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_w_user_id ON public.workouts(user_id);