-- Create user_gym_stacks table for gym-specific machine stack overrides
CREATE TABLE user_gym_stacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES equipment(id) ON DELETE CASCADE,
  stack_weights numeric[] NOT NULL DEFAULT '{}',
  unit weight_unit NOT NULL DEFAULT 'kg',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_gym_id, equipment_id)
);

-- Add RLS policies for user_gym_stacks
ALTER TABLE user_gym_stacks ENABLE ROW LEVEL SECURITY;

-- Gym admins can manage their gym's stacks
CREATE POLICY "Gym admins can manage stacks" 
ON user_gym_stacks 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM gym_admins ga 
    WHERE ga.gym_id = user_gym_stacks.user_gym_id 
    AND ga.user_id = auth.uid()
  )
  OR is_superadmin_simple()
);

-- Add updated_at trigger
CREATE TRIGGER update_user_gym_stacks_updated_at
  BEFORE UPDATE ON user_gym_stacks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add default_stack_weights to equipment table for global defaults
ALTER TABLE equipment 
ADD COLUMN default_stack_weights numeric[] DEFAULT '{}',
ADD COLUMN default_stack_unit weight_unit DEFAULT 'kg';