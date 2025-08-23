-- Create training programs table
CREATE TABLE IF NOT EXISTS training_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT NULL, -- 'strength', 'hypertrophy', 'endurance', etc.
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE training_programs ENABLE ROW LEVEL SECURITY;

-- RLS policies for training programs
CREATE POLICY "training_programs_select_own" ON training_programs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "training_programs_insert_own" ON training_programs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "training_programs_update_own" ON training_programs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "training_programs_delete_own" ON training_programs
  FOR DELETE USING (auth.uid() = user_id);

-- Create training program blocks table
CREATE TABLE IF NOT EXISTS training_program_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  workout_template_id UUID NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  focus_tags TEXT[] NULL, -- 'chest', 'pull', 'legs', 'push', etc.
  notes TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (program_id, order_index)
);

-- Enable RLS
ALTER TABLE training_program_blocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for training program blocks
CREATE POLICY "training_program_blocks_select_own" ON training_program_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM training_programs tp 
      WHERE tp.id = training_program_blocks.program_id 
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "training_program_blocks_insert_own" ON training_program_blocks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM training_programs tp 
      WHERE tp.id = training_program_blocks.program_id 
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "training_program_blocks_update_own" ON training_program_blocks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM training_programs tp 
      WHERE tp.id = training_program_blocks.program_id 
        AND tp.user_id = auth.uid()
    )
  );

CREATE POLICY "training_program_blocks_delete_own" ON training_program_blocks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM training_programs tp 
      WHERE tp.id = training_program_blocks.program_id 
        AND tp.user_id = auth.uid()
    )
  );

-- Create user program state table
CREATE TABLE IF NOT EXISTS user_program_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES training_programs(id) ON DELETE CASCADE,
  last_completed_index INTEGER NOT NULL DEFAULT 0, -- 0 means none done yet
  total_cycles_completed INTEGER NOT NULL DEFAULT 0, -- Track how many full cycles completed
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_program_state ENABLE ROW LEVEL SECURITY;

-- RLS policies for user program state
CREATE POLICY "user_program_state_select_own" ON user_program_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_program_state_insert_own" ON user_program_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_program_state_update_own" ON user_program_state
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "user_program_state_delete_own" ON user_program_state
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger to update timestamps
CREATE TRIGGER update_training_programs_updated_at
  BEFORE UPDATE ON training_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_program_state_updated_at
  BEFORE UPDATE ON user_program_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();