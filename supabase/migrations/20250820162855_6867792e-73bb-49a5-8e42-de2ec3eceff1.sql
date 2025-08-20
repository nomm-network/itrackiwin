-- Check for functions that might be creating empty sets
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('clone_template_to_workout', 'add_set');

-- Let's check for triggers on workout_exercises that might create default sets
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'workout_exercises';