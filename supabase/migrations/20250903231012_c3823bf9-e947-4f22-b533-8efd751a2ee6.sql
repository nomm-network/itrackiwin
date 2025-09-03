-- Check if preworkout_checkins table exists and has any data
DO $$
DECLARE
  table_exists boolean;
  record_count integer;
BEGIN
  -- Check if table exists
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'preworkout_checkins'
  ) INTO table_exists;
  
  IF table_exists THEN
    -- Check record count
    EXECUTE 'SELECT COUNT(*) FROM public.preworkout_checkins' INTO record_count;
    RAISE NOTICE 'Table preworkout_checkins exists with % records', record_count;
    
    -- If empty or minimal data, drop the table
    IF record_count = 0 THEN
      DROP TABLE public.preworkout_checkins CASCADE;
      RAISE NOTICE 'Dropped empty preworkout_checkins table';
    ELSE
      RAISE NOTICE 'Table preworkout_checkins has data - manual review needed';
    END IF;
  ELSE
    RAISE NOTICE 'Table preworkout_checkins does not exist';
  END IF;
END $$;