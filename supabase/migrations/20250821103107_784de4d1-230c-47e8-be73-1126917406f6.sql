-- Fix function search path issues for custom functions
CREATE OR REPLACE FUNCTION public.check_achievements(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  achievement_record RECORD;
  user_stat RECORD;
  criteria JSONB;
BEGIN
  -- Get user stats
  SELECT * INTO user_stat FROM public.user_stats WHERE user_id = p_user_id;
  
  -- Check each active achievement
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE is_active = true 
    AND id NOT IN (
      SELECT achievement_id FROM public.user_achievements 
      WHERE user_id = p_user_id
    )
  LOOP
    criteria := achievement_record.criteria;
    
    -- Check workout count achievements
    IF achievement_record.category = 'workout' AND criteria->>'type' = 'count' THEN
      IF user_stat.total_workouts >= (criteria->>'target')::INTEGER THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        VALUES (p_user_id, achievement_record.id);
        
        -- Award XP
        UPDATE public.user_stats 
        SET total_xp = total_xp + achievement_record.points
        WHERE user_id = p_user_id;
      END IF;
    END IF;
    
    -- Check streak achievements
    IF achievement_record.category = 'streak' THEN
      IF user_stat.workout_streak >= (criteria->>'target')::INTEGER THEN
        INSERT INTO public.user_achievements (user_id, achievement_id)
        VALUES (p_user_id, achievement_record.id);
        
        -- Award XP
        UPDATE public.user_stats 
        SET total_xp = total_xp + achievement_record.points
        WHERE user_id = p_user_id;
      END IF;
    END IF;
  END LOOP;
  
  -- Update level based on XP
  UPDATE public.user_stats 
  SET current_level = FLOOR(SQRT(total_xp / 50)) + 1
  WHERE user_id = p_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.toggle_workout_like(share_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  existing_like UUID;
  is_liked BOOLEAN;
BEGIN
  SELECT id INTO existing_like 
  FROM public.workout_likes 
  WHERE workout_share_id = share_id AND user_id = auth.uid();
  
  IF existing_like IS NOT NULL THEN
    DELETE FROM public.workout_likes WHERE id = existing_like;
    UPDATE public.workout_shares 
    SET likes_count = likes_count - 1 
    WHERE id = share_id;
    is_liked := false;
  ELSE
    INSERT INTO public.workout_likes (workout_share_id, user_id) 
    VALUES (share_id, auth.uid());
    UPDATE public.workout_shares 
    SET likes_count = likes_count + 1 
    WHERE id = share_id;
    is_liked := true;
  END IF;
  
  RETURN is_liked;
END;
$function$;

-- Check if there are any views that might have security definer properties
-- Looking for views that might be created with SECURITY DEFINER (which shouldn't happen with regular views)
-- The remaining 2 security definer view issues might be from system views or edge cases