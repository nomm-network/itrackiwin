-- Function to delete a training program and its orphaned templates (only for AI programs)
CREATE OR REPLACE FUNCTION delete_program_with_templates(p_program_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_deleted_templates_count integer := 0;
  v_template_id uuid;
  v_template_ids uuid[];
BEGIN
  -- Verify ownership
  IF NOT EXISTS (
    SELECT 1 FROM training_programs 
    WHERE id = p_program_id AND user_id = p_user_id
  ) THEN
    RAISE EXCEPTION 'Program not found or unauthorized';
  END IF;

  -- Get all template IDs from this program's blocks
  SELECT ARRAY_AGG(DISTINCT workout_template_id) INTO v_template_ids
  FROM training_program_blocks
  WHERE program_id = p_program_id;

  -- Delete the program (cascade will delete blocks)
  DELETE FROM training_programs WHERE id = p_program_id;

  -- For each template, check if it's orphaned and delete if so
  IF v_template_ids IS NOT NULL THEN
    FOREACH v_template_id IN ARRAY v_template_ids
    LOOP
      -- Check if this template is used by any other program
      IF NOT EXISTS (
        SELECT 1 FROM training_program_blocks 
        WHERE workout_template_id = v_template_id
      ) THEN
        -- Template is orphaned, delete it
        DELETE FROM workout_templates WHERE id = v_template_id AND user_id = p_user_id;
        v_deleted_templates_count := v_deleted_templates_count + 1;
      END IF;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_templates', v_deleted_templates_count
  );
END;
$$;

-- Function to cleanup orphaned templates (admin only)
CREATE OR REPLACE FUNCTION cleanup_orphaned_templates(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_deleted_count integer := 0;
  v_orphaned_templates uuid[];
BEGIN
  -- Check if user is admin
  IF NOT is_admin(p_user_id) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Find all templates that are not linked to any program blocks
  SELECT ARRAY_AGG(id) INTO v_orphaned_templates
  FROM workout_templates wt
  WHERE NOT EXISTS (
    SELECT 1 FROM training_program_blocks tpb
    WHERE tpb.workout_template_id = wt.id
  );

  -- Delete orphaned templates
  IF v_orphaned_templates IS NOT NULL THEN
    DELETE FROM workout_templates 
    WHERE id = ANY(v_orphaned_templates);
    
    v_deleted_count := array_length(v_orphaned_templates, 1);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_count', v_deleted_count,
    'orphaned_template_ids', COALESCE(v_orphaned_templates, ARRAY[]::uuid[])
  );
END;
$$;