-- Add missing RLS policies for the new tables

-- RLS policies for user_muscle_priorities
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_muscle_priorities' 
    AND policyname = 'Users can manage their own muscle priorities'
  ) THEN
    CREATE POLICY "Users can manage their own muscle priorities"
    ON public.user_muscle_priorities
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- RLS policies for user_exercise_warmups
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_exercise_warmups' 
    AND policyname = 'Users can manage their own exercise warmups'
  ) THEN
    CREATE POLICY "Users can manage their own exercise warmups"
    ON public.user_exercise_warmups
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;