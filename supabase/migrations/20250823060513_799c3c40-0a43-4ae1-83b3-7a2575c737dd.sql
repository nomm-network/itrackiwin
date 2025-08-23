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
      tpb.program_id,
      MAX(tpb.order_index) as max_index
    FROM training_program_blocks tpb
    JOIN user_state us ON us.program_id = tpb.program_id
    GROUP BY tpb.program_id
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