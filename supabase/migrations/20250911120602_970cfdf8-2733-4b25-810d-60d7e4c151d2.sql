-- Create RLS policies for weight resolution logging and gym inventory access

-- Ensure users can read their own gym inventories
CREATE POLICY "Users can read own gym plates" ON user_gym_plates
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_gyms ug 
    WHERE ug.id = user_gym_plates.user_gym_id 
    AND ug.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read own gym dumbbells" ON user_gym_dumbbells
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_gyms ug 
    WHERE ug.id = user_gym_dumbbells.user_gym_id 
    AND ug.user_id = auth.uid()
  )
);

CREATE POLICY "Users can read own gym miniweights" ON user_gym_miniweights
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_gyms ug 
    WHERE ug.id = user_gym_miniweights.user_gym_id 
    AND ug.user_id = auth.uid()
  )
);

-- Allow users to insert their own weight resolution logs
CREATE POLICY "Users can insert own weight resolution logs" ON weight_resolution_log
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow users to read their own weight resolution logs
CREATE POLICY "Users can read own weight resolution logs" ON weight_resolution_log
FOR SELECT USING (user_id = auth.uid());

-- Create improved stack weight resolution function with aux combinations
CREATE OR REPLACE FUNCTION public.resolve_stack_weight_with_aux(
  desired_kg numeric,
  stack_steps numeric[] DEFAULT ARRAY[5,10,15,20,25,30,35,40,45,50,55,60,65,70,75,80,85,90,95,100],
  aux_weights numeric[] DEFAULT ARRAY[2.5,5]
) RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  best_weight numeric := stack_steps[1];
  min_diff numeric := abs(desired_kg - best_weight);
  current_diff numeric;
  step numeric;
  aux numeric;
  combined_weight numeric;
  total_aux numeric;
  is_overshoot boolean;
  best_is_overshoot boolean := best_weight > desired_kg;
BEGIN
  -- Try all stack steps alone
  FOREACH step IN ARRAY stack_steps LOOP
    current_diff := abs(desired_kg - step);
    is_overshoot := step > desired_kg;
    
    IF current_diff < min_diff OR 
       (current_diff = min_diff AND NOT is_overshoot AND best_is_overshoot) THEN
      min_diff := current_diff;
      best_weight := step;
      best_is_overshoot := is_overshoot;
    END IF;
  END LOOP;
  
  -- Try stack + individual aux weights
  FOREACH step IN ARRAY stack_steps LOOP
    FOREACH aux IN ARRAY aux_weights LOOP
      combined_weight := step + aux;
      current_diff := abs(desired_kg - combined_weight);
      is_overshoot := combined_weight > desired_kg;
      
      IF current_diff < min_diff OR 
         (current_diff = min_diff AND NOT is_overshoot AND best_is_overshoot) THEN
        min_diff := current_diff;
        best_weight := combined_weight;
        best_is_overshoot := is_overshoot;
      END IF;
    END LOOP;
  END LOOP;
  
  -- Try stack + sum of all aux weights
  total_aux := (SELECT SUM(aux_weight) FROM unnest(aux_weights) AS aux_weight);
  FOREACH step IN ARRAY stack_steps LOOP
    combined_weight := step + total_aux;
    current_diff := abs(desired_kg - combined_weight);
    is_overshoot := combined_weight > desired_kg;
    
    IF current_diff < min_diff OR 
       (current_diff = min_diff AND NOT is_overshoot AND best_is_overshoot) THEN
      min_diff := current_diff;
      best_weight := combined_weight;
      best_is_overshoot := is_overshoot;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'resolved_weight', best_weight,
    'residual_kg', desired_kg - best_weight,
    'achievable', min_diff < 2.5,
    'overshoot', best_weight > desired_kg
  );
END;
$$;