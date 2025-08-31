-- Remove duplicate constraint - keep only one
ALTER TABLE public.personal_records DROP CONSTRAINT IF EXISTS personal_records_user_id_exercise_id_kind_grip_key;