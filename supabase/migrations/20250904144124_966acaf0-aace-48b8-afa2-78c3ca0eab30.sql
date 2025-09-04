-- Add the trigger back to workout_exercises table
CREATE TRIGGER trg_init_warmup
BEFORE INSERT ON public.workout_exercises
FOR EACH ROW
EXECUTE FUNCTION public.trg_init_warmup();