-- First, ensure users table has proper RLS policies for reading own data
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Enable RLS on users table if not already enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create proper RLS policies for users table
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create or replace the trigger function to ensure user record exists
CREATE OR REPLACE FUNCTION public.ensure_user_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert user record if it doesn't exist
  INSERT INTO public.users (id, is_pro)
  VALUES (NEW.id, false)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users to ensure user record exists
DROP TRIGGER IF EXISTS on_auth_user_created_ensure_record ON auth.users;
CREATE TRIGGER on_auth_user_created_ensure_record
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_user_record();

-- Also create a function to create user record for existing users
CREATE OR REPLACE FUNCTION public.create_user_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NOT NULL THEN
    INSERT INTO public.users (id, is_pro)
    VALUES (current_user_id, false)
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$;

-- Call the function to create record for current user if needed
SELECT public.create_user_if_not_exists();