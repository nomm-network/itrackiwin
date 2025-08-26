-- Add warmup feedback and target columns to workout_exercises
ALTER TABLE workout_exercises 
  ADD COLUMN IF NOT EXISTS warmup_feedback text CHECK (warmup_feedback IN ('not_enough','excellent','too_much')),
  ADD COLUMN IF NOT EXISTS warmup_feedback_at timestamptz,
  ADD COLUMN IF NOT EXISTS target_origin text,
  ADD COLUMN IF NOT EXISTS warmup_updated_at timestamptz;