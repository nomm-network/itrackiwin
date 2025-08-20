-- Enable RLS on exercises table (it has policies but RLS wasn't enabled)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;