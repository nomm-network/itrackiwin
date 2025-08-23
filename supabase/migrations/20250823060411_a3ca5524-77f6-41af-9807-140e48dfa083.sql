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

-- RPC function to get next program block
CREATE OR REPLACE FUNCTION get_next_program_block(_user_id UUID)
RETURNS TABLE(
  program_id UUID, 
  next_block_id UUID, 
  workout_template_id UUID, 
  template_name TEXT,
  order_index INTEGER,
  focus_tags TEXT[],
  total_blocks INTEGER,
  cycles_completed INTEGER
) 
LANGUAGE SQL STABLE 
SET search_path = public
AS $$
  WITH user_state AS (
    SELECT 
      ups.program_id,
      ups.last_completed_index,
      ups.total_cycles_completed,
      tp.name as program_name
    FROM user_program_state ups
    JOIN training_programs tp ON tp.id = ups.program_id
    WHERE ups.user_id = _user_id 
      AND tp.is_active = true
  ),
  program_info AS (
    SELECT 
      program_id,
      MAX(order_index) as max_index
    FROM training_program_blocks tpb
    JOIN user_state us ON us.program_id = tpb.program_id
    GROUP BY program_id
  ),
  next_index AS (
    SELECT 
      us.program_id,
      us.total_cycles_completed,
      CASE 
        WHEN us.last_completed_index = 0 THEN 1
        WHEN us.last_completed_index >= pi.max_index THEN 1
        ELSE us.last_completed_index + 1
      END as next_order_index
    FROM user_state us
    JOIN program_info pi ON pi.program_id = us.program_id
  )
  SELECT 
    tpb.program_id,
    tpb.id as next_block_id,
    tpb.workout_template_id,
    wt.name as template_name,
    tpb.order_index,
    tpb.focus_tags,
    pi.max_index as total_blocks,
    ni.total_cycles_completed as cycles_completed
  FROM training_program_blocks tpb
  JOIN next_index ni ON ni.program_id = tpb.program_id 
    AND tpb.order_index = ni.next_order_index
  JOIN program_info pi ON pi.program_id = tpb.program_id
  JOIN workout_templates wt ON wt.id = tpb.workout_template_id
  LIMIT 1;
$$;

-- RPC function to advance program state after workout completion
CREATE OR REPLACE FUNCTION advance_program_state(_user_id UUID, _completed_block_id UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL 
SET search_path = public
AS $$
DECLARE
  v_program_id UUID;
  v_completed_index INTEGER;
  v_max_index INTEGER;
  v_new_cycles INTEGER;
BEGIN
  -- Get the completed block info
  SELECT 
    tpb.program_id, 
    tpb.order_index
  INTO v_program_id, v_completed_index
  FROM training_program_blocks tpb
  WHERE tpb.id = _completed_block_id;

  IF v_program_id IS NULL THEN
    RETURN false;
  END IF;

  -- Get max index for this program
  SELECT MAX(order_index) INTO v_max_index
  FROM training_program_blocks
  WHERE program_id = v_program_id;

  -- Calculate new cycle count
  SELECT 
    CASE 
      WHEN v_completed_index >= v_max_index THEN total_cycles_completed + 1
      ELSE total_cycles_completed
    END
  INTO v_new_cycles
  FROM user_program_state
  WHERE user_id = _user_id AND program_id = v_program_id;

  -- Update user program state
  INSERT INTO user_program_state (user_id, program_id, last_completed_index, total_cycles_completed)
  VALUES (_user_id, v_program_id, v_completed_index, v_new_cycles)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    program_id = EXCLUDED.program_id,
    last_completed_index = EXCLUDED.last_completed_index,
    total_cycles_completed = EXCLUDED.total_cycles_completed,
    updated_at = now();

  RETURN true;
END;
$$;