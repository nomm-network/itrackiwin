-- Seed default presets for training focus
INSERT INTO public.training_focus_presets (focus, rep_min, rep_max, pct1rm_min, pct1rm_max, rest_main_min, rest_main_max, warmup_pattern, progression)
VALUES
('muscle',   6, 12, 0.65, 0.80, 60,  90,  '{"steps":[{"pct":0.35,"reps":10},{"pct":0.55,"reps":8},{"pct":0.7,"reps":5}]}'::jsonb, 'double_progression'),
('strength', 1, 5,  0.80, 0.95, 150, 300, '{"steps":[{"pct":0.40,"reps":5},{"pct":0.60,"reps":3},{"pct":0.75,"reps":2},{"pct":0.85,"reps":1}]}'::jsonb, 'percent_1rm'),
('general',  12,20, 0.50, 0.65, 30,  60,  '{"steps":[{"pct":0.30,"reps":12},{"pct":0.50,"reps":10}]}'::jsonb, 'rep_targets'),
('power',    3, 6,  0.70, 0.85, 120, 180, '{"steps":[{"pct":0.40,"reps":5},{"pct":0.60,"reps":3},{"pct":0.75,"reps":2}]}'::jsonb, 'percent_1rm')
ON CONFLICT (focus) DO NOTHING;

-- Seed default goal tuning
INSERT INTO public.weight_goal_tuning(goal, rest_multiplier, volume_multiplier, intensity_shift) 
VALUES
('lose',     0.85, 1.00, -0.02),
('maintain', 1.00, 1.00,  0.00),
('recomp',   0.95, 1.00,  0.00),
('gain',     1.00, 1.05,  0.01)
ON CONFLICT (goal) DO NOTHING;

-- Migrate existing data from user_profile_fitness to user_fitness_profile
INSERT INTO public.user_fitness_profile (
  user_id,
  primary_weight_goal,
  training_focus,
  experience,
  days_per_week,
  preferred_session_minutes,
  bodyweight,
  height_cm,
  injuries,
  created_at,
  updated_at
)
SELECT 
  user_id,
  CASE 
    WHEN goal = 'lose' THEN 'lose'::primary_weight_goal
    WHEN goal = 'maintain' THEN 'maintain'::primary_weight_goal
    WHEN goal = 'body_recomposition' THEN 'recomp'::primary_weight_goal
    WHEN goal = 'gain' THEN 'gain'::primary_weight_goal
    ELSE 'recomp'::primary_weight_goal
  END,
  CASE 
    WHEN training_goal = 'hypertrophy' THEN 'muscle'::training_focus
    WHEN training_goal = 'strength' THEN 'strength'::training_focus
    WHEN training_goal = 'conditioning' THEN 'general'::training_focus
    ELSE 'muscle'::training_focus
  END,
  CASE 
    WHEN experience_level = 'new' THEN 'new'::experience_level
    WHEN experience_level = 'returning' THEN 'returning'::experience_level
    WHEN experience_level = 'intermediate' THEN 'intermediate'::experience_level
    WHEN experience_level = 'advanced' THEN 'advanced'::experience_level
    ELSE 'returning'::experience_level
  END,
  days_per_week,
  preferred_session_minutes,
  bodyweight,
  COALESCE(height_cm, height), -- Use height_cm if available, fallback to height
  COALESCE(injuries::jsonb, '[]'::jsonb), -- Convert array to jsonb
  created_at,
  updated_at
FROM public.user_profile_fitness
ON CONFLICT (user_id) DO UPDATE SET
  primary_weight_goal = EXCLUDED.primary_weight_goal,
  training_focus = EXCLUDED.training_focus,
  experience = EXCLUDED.experience,
  days_per_week = EXCLUDED.days_per_week,
  preferred_session_minutes = EXCLUDED.preferred_session_minutes,
  bodyweight = EXCLUDED.bodyweight,
  height_cm = EXCLUDED.height_cm,
  injuries = EXCLUDED.injuries,
  updated_at = EXCLUDED.updated_at;