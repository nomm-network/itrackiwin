-- Grant public access to the function (this is safe since it checks auth.uid() internally)
GRANT EXECUTE ON FUNCTION public.can_mutate_workout_set(uuid) TO public;

-- Also make sure the function owner is correct
ALTER FUNCTION public.can_mutate_workout_set(uuid) OWNER TO postgres;