-- Remove the problematic default and let the application handle setting owner_user_id
ALTER TABLE public.exercises 
  ALTER COLUMN owner_user_id DROP DEFAULT;