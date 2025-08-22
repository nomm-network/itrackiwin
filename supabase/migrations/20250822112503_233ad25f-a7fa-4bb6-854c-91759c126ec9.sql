-- Drop the old clone_template_to_workout function and recreate the correct one
DROP FUNCTION IF EXISTS public.clone_template_to_workout(uuid, uuid);

-- Recreate the function that properly calls start_workout
CREATE OR REPLACE FUNCTION public.clone_template_to_workout(p_template_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN public.start_workout(p_template_id);
END;
$function$;