-- Create data quality reports table
CREATE TABLE IF NOT EXISTS public.data_quality_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_exercises INTEGER NOT NULL DEFAULT 0,
  exercises_with_primary_muscle INTEGER NOT NULL DEFAULT 0,
  exercises_with_movement_pattern INTEGER NOT NULL DEFAULT 0,
  exercises_with_equipment_constraints INTEGER NOT NULL DEFAULT 0,
  primary_muscle_coverage_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  movement_pattern_coverage_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  equipment_constraints_coverage_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  issues_found JSONB NOT NULL DEFAULT '[]'::jsonb,
  report_type TEXT NOT NULL DEFAULT 'scheduled'
);

-- Enable RLS
ALTER TABLE public.data_quality_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view data quality reports"
  ON public.data_quality_reports
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert data quality reports"
  ON public.data_quality_reports
  FOR INSERT
  WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_data_quality_reports_created_at ON public.data_quality_reports(created_at DESC);

-- Create function to run data quality checks
CREATE OR REPLACE FUNCTION public.run_data_quality_check()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_exercises INTEGER;
  v_with_primary_muscle INTEGER;
  v_with_movement_pattern INTEGER;
  v_with_equipment_constraints INTEGER;
  v_equipment_exercises INTEGER;
  v_issues JSONB := '[]'::jsonb;
  v_report_id UUID;
  exercise_rec RECORD;
BEGIN
  -- Count total public exercises
  SELECT COUNT(*) INTO v_total_exercises
  FROM exercises 
  WHERE is_public = true;

  -- Count exercises with primary muscle
  SELECT COUNT(*) INTO v_with_primary_muscle
  FROM exercises 
  WHERE is_public = true 
    AND primary_muscle_id IS NOT NULL;

  -- Count exercises with movement pattern
  SELECT COUNT(*) INTO v_with_movement_pattern
  FROM exercises 
  WHERE is_public = true 
    AND movement_pattern IS NOT NULL;

  -- Count exercises that need equipment and have constraints
  SELECT COUNT(*) INTO v_equipment_exercises
  FROM exercises 
  WHERE is_public = true 
    AND equipment_id IS NOT NULL;

  SELECT COUNT(*) INTO v_with_equipment_constraints
  FROM exercises 
  WHERE is_public = true 
    AND equipment_id IS NOT NULL
    AND capability_schema IS NOT NULL
    AND capability_schema != '{}'::jsonb;

  -- Find specific issues
  FOR exercise_rec IN
    SELECT id, name, primary_muscle_id, movement_pattern, equipment_id, capability_schema
    FROM exercises 
    WHERE is_public = true 
      AND (
        primary_muscle_id IS NULL 
        OR movement_pattern IS NULL 
        OR (equipment_id IS NOT NULL AND (capability_schema IS NULL OR capability_schema = '{}'::jsonb))
      )
    LIMIT 100
  LOOP
    v_issues := v_issues || jsonb_build_object(
      'exercise_id', exercise_rec.id,
      'exercise_name', exercise_rec.name,
      'missing_primary_muscle', exercise_rec.primary_muscle_id IS NULL,
      'missing_movement_pattern', exercise_rec.movement_pattern IS NULL,
      'missing_equipment_constraints', 
        exercise_rec.equipment_id IS NOT NULL AND 
        (exercise_rec.capability_schema IS NULL OR exercise_rec.capability_schema = '{}'::jsonb)
    );
  END LOOP;

  -- Insert quality report
  INSERT INTO public.data_quality_reports (
    total_exercises,
    exercises_with_primary_muscle,
    exercises_with_movement_pattern,
    exercises_with_equipment_constraints,
    primary_muscle_coverage_pct,
    movement_pattern_coverage_pct,
    equipment_constraints_coverage_pct,
    issues_found
  ) VALUES (
    v_total_exercises,
    v_with_primary_muscle,
    v_with_movement_pattern,
    v_with_equipment_constraints,
    CASE WHEN v_total_exercises > 0 THEN (v_with_primary_muscle::numeric / v_total_exercises * 100) ELSE 0 END,
    CASE WHEN v_total_exercises > 0 THEN (v_with_movement_pattern::numeric / v_total_exercises * 100) ELSE 0 END,
    CASE WHEN v_equipment_exercises > 0 THEN (v_with_equipment_constraints::numeric / v_equipment_exercises * 100) ELSE 100 END,
    v_issues
  ) RETURNING id INTO v_report_id;

  RETURN jsonb_build_object(
    'report_id', v_report_id,
    'total_exercises', v_total_exercises,
    'primary_muscle_coverage', CASE WHEN v_total_exercises > 0 THEN (v_with_primary_muscle::numeric / v_total_exercises * 100) ELSE 0 END,
    'movement_pattern_coverage', CASE WHEN v_total_exercises > 0 THEN (v_with_movement_pattern::numeric / v_total_exercises * 100) ELSE 0 END,
    'equipment_constraints_coverage', CASE WHEN v_equipment_exercises > 0 THEN (v_with_equipment_constraints::numeric / v_equipment_exercises * 100) ELSE 100 END,
    'issues_count', jsonb_array_length(v_issues)
  );
END;
$$;