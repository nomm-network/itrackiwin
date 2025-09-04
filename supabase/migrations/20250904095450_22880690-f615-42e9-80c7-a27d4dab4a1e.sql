-- Create the missing trigger for automatic warmup initialization
DROP TRIGGER IF EXISTS trg_init_warmup ON public.workout_exercises;
CREATE TRIGGER trg_init_warmup
AFTER INSERT ON public.workout_exercises
FOR EACH ROW
EXECUTE FUNCTION initialize_warmup_for_exercise(NEW.id);