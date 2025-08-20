-- Check if there's a trigger or function creating default sets
-- Look for functions that might be creating empty sets
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND (routine_definition LIKE '%workout_sets%' OR routine_definition LIKE '%default_sets%');

-- Let's check for triggers on workout_exercises
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'workout_exercises';

-- Check the clone_template_to_workout function definition
\df clone_template_to_workout