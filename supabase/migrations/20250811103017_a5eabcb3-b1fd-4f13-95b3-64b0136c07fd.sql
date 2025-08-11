-- RLS policies to allow authenticated users to manage taxonomy values
DO $$ BEGIN
  -- body_parts: allow all authenticated users to insert/update/delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='body_parts' AND policyname='body_parts_mutate_auth'
  ) THEN
    CREATE POLICY "body_parts_mutate_auth" ON public.body_parts
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  -- muscle_groups: allow all authenticated users to insert/update/delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='muscle_groups' AND policyname='muscle_groups_mutate_auth'
  ) THEN
    CREATE POLICY "muscle_groups_mutate_auth" ON public.muscle_groups
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;

DO $$ BEGIN
  -- muscles: allow all authenticated users to insert/update/delete
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='muscles' AND policyname='muscles_mutate_auth'
  ) THEN
    CREATE POLICY "muscles_mutate_auth" ON public.muscles
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
  END IF;
END $$;