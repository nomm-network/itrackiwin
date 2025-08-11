-- Purge all exercise rows so the Exercises page starts empty
BEGIN;
  DELETE FROM public.exercises;
COMMIT;