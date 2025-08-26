-- Drop redundant warmup_feedback column since feedback is stored in warmup_plan JSON
ALTER TABLE workout_exercises DROP COLUMN IF EXISTS warmup_feedback;