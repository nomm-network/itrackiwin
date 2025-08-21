-- Phase 9: Gamification & Achievement System (Fixed)

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL, -- workout, social, streak, milestone
  points INTEGER NOT NULL DEFAULT 0,
  criteria JSONB NOT NULL, -- flexible criteria storage
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress JSONB, -- for tracking partial progress
  UNIQUE(user_id, achievement_id)
);

-- Create user stats table for tracking various metrics
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  workout_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_workouts INTEGER NOT NULL DEFAULT 0,
  total_exercises INTEGER NOT NULL DEFAULT 0,
  total_volume DECIMAL NOT NULL DEFAULT 0,
  last_workout_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create streaks table for detailed streak tracking
CREATE TABLE public.streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- workout, habit, etc
  current_count INTEGER NOT NULL DEFAULT 0,
  longest_count INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, type)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Achievements policies (public read, admin write)
CREATE POLICY "Achievements are viewable by everyone" 
ON public.achievements 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage achievements" 
ON public.achievements 
FOR ALL 
USING (is_admin(auth.uid()));

-- User achievements policies
CREATE POLICY "Users can view all user achievements" 
ON public.user_achievements 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own achievements" 
ON public.user_achievements 
FOR ALL 
USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can view their own stats" 
ON public.user_stats 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
ON public.user_stats 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" 
ON public.user_stats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Streaks policies
CREATE POLICY "Users can view their own streaks" 
ON public.streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own streaks" 
ON public.streaks 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update user stats
CREATE OR REPLACE FUNCTION public.update_user_stats_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for user stats and streaks
CREATE TRIGGER update_user_stats_updated_at
BEFORE UPDATE ON public.user_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_user_stats_timestamp();

CREATE TRIGGER update_streaks_updated_at
BEFORE UPDATE ON public.streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_user_stats_timestamp();

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION public.check_achievements(p_user_id UUID)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Insert default achievements
INSERT INTO public.achievements (title, description, icon, category, points, criteria) VALUES
('First Workout', 'Complete your first workout', '🎯', 'workout', 50, '{"type": "count", "target": 1}'),
('Workout Warrior', 'Complete 10 workouts', '💪', 'workout', 100, '{"type": "count", "target": 10}'),
('Century Club', 'Complete 100 workouts', '🏆', 'workout', 500, '{"type": "count", "target": 100}'),
('Consistent Champion', 'Maintain a 7-day workout streak', '🔥', 'streak', 200, '{"type": "streak", "target": 7}'),
('Streak Master', 'Maintain a 30-day workout streak', '⚡', 'streak', 1000, '{"type": "streak", "target": 30}'),
('Social Butterfly', 'Make your first friend', '👥', 'social', 75, '{"type": "friends", "target": 1}'),
('Level Up', 'Reach level 5', '📈', 'milestone', 150, '{"type": "level", "target": 5}');