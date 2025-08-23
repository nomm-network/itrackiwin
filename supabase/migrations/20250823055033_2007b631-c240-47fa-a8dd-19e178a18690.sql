-- Create table for exercise grip effects (how grips change muscle emphasis)
CREATE TABLE IF NOT EXISTS exercise_grip_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  grip_id UUID NOT NULL REFERENCES public.grips(id) ON DELETE RESTRICT,
  muscle_id UUID NOT NULL REFERENCES public.muscles(id) ON DELETE CASCADE,
  effect_pct NUMERIC NOT NULL,  -- e.g. +20 means +20% emphasis, -15 means -15%
  is_primary_override BOOLEAN NOT NULL DEFAULT false, -- if true, marks this muscle as primary for this grip
  equipment_id UUID NULL REFERENCES public.equipment(id) ON DELETE SET NULL, -- optional: only for barbell/cable etc.
  note TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add unique constraint separately to handle COALESCE
CREATE UNIQUE INDEX exercise_grip_effects_unique_idx ON exercise_grip_effects (
  exercise_id, grip_id, muscle_id, COALESCE(equipment_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Enable RLS
ALTER TABLE exercise_grip_effects ENABLE ROW LEVEL SECURITY;

-- RLS policies for exercise grip effects
CREATE POLICY "exercise_grip_effects_select_all" ON exercise_grip_effects
  FOR SELECT USING (true);

CREATE POLICY "exercise_grip_effects_admin_manage" ON exercise_grip_effects
  FOR ALL USING (is_admin(auth.uid()));

-- Create table for gym machine grip options (which grips are available for specific machines)
CREATE TABLE IF NOT EXISTS gym_machine_grip_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_machine_id UUID NOT NULL REFERENCES public.gym_machines(id) ON DELETE CASCADE,
  grip_id UUID NOT NULL REFERENCES public.grips(id) ON DELETE RESTRICT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (gym_machine_id, grip_id)
);

-- Enable RLS
ALTER TABLE gym_machine_grip_options ENABLE ROW LEVEL SECURITY;

-- RLS policies for gym machine grip options
CREATE POLICY "gym_machine_grip_options_select_all" ON gym_machine_grip_options
  FOR SELECT USING (true);

CREATE POLICY "gym_machine_grip_options_gym_admin_manage" ON gym_machine_grip_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM gym_admins ga
      JOIN gym_machines gm ON gm.gym_id = ga.gym_id
      WHERE ga.user_id = auth.uid() 
        AND gm.id = gym_machine_grip_options.gym_machine_id
    )
  );

-- RPC function to compute effective muscles based on grips
CREATE OR REPLACE FUNCTION get_effective_muscles(
  _exercise_id UUID,
  _grip_ids UUID[] DEFAULT NULL,
  _equipment_id UUID DEFAULT NULL
)
RETURNS TABLE(muscle_id UUID, base_role TEXT, effective_score NUMERIC, primary_muscle BOOLEAN) 
LANGUAGE SQL STABLE AS $$
  WITH base AS (
    -- base roles (primary + secondaries from exercises table)
    SELECT m.id AS muscle_id,
           CASE WHEN m.id = e.primary_muscle_id THEN 'primary' ELSE 'secondary' END AS base_role,
           CASE WHEN m.id = e.primary_muscle_id THEN 1.0 ELSE 0.5 END AS base_score
    FROM exercises e
    JOIN muscles m ON m.id = ANY(ARRAY[e.primary_muscle_id] || COALESCE(e.secondary_muscle_group_ids::UUID[], '{}'))
    WHERE e.id = _exercise_id
      AND m.id IS NOT NULL
  ),
  adjusted AS (
    SELECT b.muscle_id,
           b.base_role,
           b.base_score * (1.0 + COALESCE(SUM(efe.effect_pct) FILTER (
             WHERE (_grip_ids IS NULL OR efe.grip_id = ANY(_grip_ids))
               AND (_equipment_id IS NULL OR efe.equipment_id IS NULL OR efe.equipment_id = _equipment_id)
           )/100.0, 0)) AS effective_score,
           BOOL_OR(efe.is_primary_override) AS primary_override
    FROM base b
    LEFT JOIN exercise_grip_effects efe ON efe.muscle_id = b.muscle_id AND efe.exercise_id = _exercise_id
    GROUP BY b.muscle_id, b.base_role, b.base_score
  )
  SELECT muscle_id,
         base_role,
         effective_score,
         COALESCE(primary_override, base_role='primary') AS primary_muscle
  FROM adjusted
  ORDER BY effective_score DESC;
$$;