-- Check current set_log function definition
SELECT pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname = 'set_log' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');