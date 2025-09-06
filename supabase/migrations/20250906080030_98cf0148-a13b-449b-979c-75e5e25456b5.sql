-- Fix warmup trigger - reconnect warmup generation to workout_exercises inserts

-- Drop any old trigger if exists
DROP TRIGGER IF EXISTS trg_init_warmup ON public.workout_exercises;

-- Recreate trigger using existing warmup function
CREATE TRIGGER trg_init_warmup
AFTER INSERT ON public.workout_exercises
FOR EACH ROW
EXECUTE FUNCTION public.initialize_warmup_for_exercise();