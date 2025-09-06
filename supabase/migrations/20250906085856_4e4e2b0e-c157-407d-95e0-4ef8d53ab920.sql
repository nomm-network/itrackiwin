-- Step 1: Database foundation for Mentors/Coaches feature (Separate Steps)

-- 1. Enum (mentor type)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mentor_type') THEN
    CREATE TYPE public.mentor_type AS ENUM ('mentor','coach');
  END IF;
END$$;

-- 2. Enum (mentor client status)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'mentor_client_status') THEN
    CREATE TYPE public.mentor_client_status AS ENUM ('invited','active','paused','ended');
  END IF;
END$$;