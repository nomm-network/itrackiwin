-- Drop the text parameter version of generate_ai_program to resolve conflict
DROP FUNCTION IF EXISTS public.generate_ai_program(uuid, text, text, integer, text, text[], text[], integer);

-- Ensure only the enum version exists
-- (The enum version should already exist from previous migration)