-- 1) Ownership check helper
CREATE OR REPLACE FUNCTION public.can_mutate_workout_set(_we_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  u uuid := auth.uid();
BEGIN
  IF u IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.workout_exercises we
    JOIN public.workouts w ON w.id = we.workout_id
    WHERE we.id = _we_id
      AND w.user_id = u
  );
END
$$;

-- Lock down function permissions
ALTER FUNCTION public.can_mutate_workout_set(uuid) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.can_mutate_workout_set(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.can_mutate_workout_set(uuid) TO authenticated;

-- 2) Rebuild policies on workout_sets to use the function
DROP POLICY IF EXISTS workout_sets_per_user_mutate ON public.workout_sets;
DROP POLICY IF EXISTS workout_sets_per_user_select ON public.workout_sets;

CREATE POLICY workout_sets_per_user_select
ON public.workout_sets
FOR SELECT
TO authenticated
USING ( public.can_mutate_workout_set(workout_exercise_id) );

CREATE POLICY workout_sets_per_user_mutate
ON public.workout_sets
FOR ALL
TO authenticated
USING     ( public.can_mutate_workout_set(workout_exercise_id) )
WITH CHECK( public.can_mutate_workout_set(workout_exercise_id) );

-- 3) Auto-compute set_index server-side (prevents race conditions)
CREATE OR REPLACE FUNCTION public.assign_next_set_index()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_idx int;
BEGIN
  IF NEW.set_index IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(MAX(set_index), 0) INTO max_idx
  FROM public.workout_sets
  WHERE workout_exercise_id = NEW.workout_exercise_id;

  NEW.set_index := max_idx + 1;
  RETURN NEW;
END
$$;

DROP TRIGGER IF EXISTS trg_assign_next_set_index ON public.workout_sets;
CREATE TRIGGER trg_assign_next_set_index
BEFORE INSERT ON public.workout_sets
FOR EACH ROW EXECUTE FUNCTION public.assign_next_set_index();