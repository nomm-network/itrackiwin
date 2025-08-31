-- Script 1: Fast unblock (disable all PR triggers)
DROP TRIGGER IF EXISTS trg_upsert_prs_after_set              ON public.workout_sets;
DROP TRIGGER IF EXISTS upsert_prs_with_grips_trigger         ON public.workout_sets;
DROP TRIGGER IF EXISTS tr_upsert_prs_with_grips_after_set    ON public.workout_sets;

-- Keep UUID extension
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_extension WHERE extname = 'uuid-ossp'
  ) THEN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  END IF;
END$$;