-- Create user record for current authenticated user
INSERT INTO public.users (id, is_pro, nickname)
VALUES ('f3024241-c467-4d6a-8315-44928316cfa9', false, NULL)
ON CONFLICT (id) DO NOTHING;

-- Update the trigger to handle user creation better
CREATE OR REPLACE FUNCTION public.ensure_user_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user record if it doesn't exist
  INSERT INTO public.users (id, is_pro)
  VALUES (NEW.id, false)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_user_record();

-- Also create trigger for ensuring user exists on authentication
CREATE OR REPLACE FUNCTION public.create_user_if_not_exists()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;