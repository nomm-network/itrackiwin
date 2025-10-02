-- Drop redundant unique indexes that are causing upsert conflicts
DROP INDEX IF EXISTS public.idx_user_ex_pref_global;
DROP INDEX IF EXISTS public.idx_user_ex_pref_template;
DROP INDEX IF EXISTS public.idx_user_ex_pref_program;

-- Drop the existing index and recreate as a proper unique constraint
DROP INDEX IF EXISTS public.idx_user_ex_pref_both;

-- Add a single unique constraint that covers all cases
ALTER TABLE public.user_exercise_preferences 
ADD CONSTRAINT uq_user_exercise_preferences_scope 
UNIQUE (user_id, exercise_id, template_id, program_id);

-- Create a regular index for performance on common queries
CREATE INDEX IF NOT EXISTS idx_user_ex_pref_lookup 
ON public.user_exercise_preferences(user_id, exercise_id);