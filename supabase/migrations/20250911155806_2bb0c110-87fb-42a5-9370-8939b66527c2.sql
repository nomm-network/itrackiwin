-- Fix get_equipment_profile function
DROP FUNCTION IF EXISTS public.get_equipment_profile(uuid, uuid);

CREATE OR REPLACE FUNCTION public.get_equipment_profile(
  p_equipment_id uuid,
  p_user_gym_id uuid DEFAULT NULL
)
RETURNS TABLE(
  plate_profile_id uuid,
  stack_profile_id uuid
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- First check for gym-specific override
  IF p_user_gym_id IS NOT NULL THEN
    SELECT ugep.plate_profile_id, ugep.stack_profile_id
    INTO plate_profile_id, stack_profile_id
    FROM public.user_gym_equipment_profiles ugep
    WHERE ugep.user_gym_id = p_user_gym_id 
      AND ugep.equipment_id = p_equipment_id;
    
    IF FOUND THEN
      RETURN NEXT;
      RETURN;
    END IF;
  END IF;
  
  -- Fallback to global equipment profiles
  SELECT 
    (SELECT ep1.profile_id FROM public.equipment_profiles ep1 
     WHERE ep1.equipment_id = p_equipment_id AND ep1.profile_type = 'plate' LIMIT 1),
    (SELECT ep2.profile_id FROM public.equipment_profiles ep2 
     WHERE ep2.equipment_id = p_equipment_id AND ep2.profile_type = 'stack' LIMIT 1)
  INTO plate_profile_id, stack_profile_id;
  
  RETURN NEXT;
END;
$$;