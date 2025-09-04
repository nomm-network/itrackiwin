-- Update readiness_score to 69 for all workouts
UPDATE workouts 
SET readiness_score = 69 
WHERE readiness_score IS NULL OR readiness_score != 69;