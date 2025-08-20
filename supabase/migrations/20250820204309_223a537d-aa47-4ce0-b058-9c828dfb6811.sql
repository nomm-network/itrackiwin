-- Create grips translations table
CREATE TABLE public.grips_translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grip_id UUID NOT NULL,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(grip_id, language_code)
);

-- Enable RLS
ALTER TABLE public.grips_translations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "grips_translations_select_all" 
ON public.grips_translations 
FOR SELECT 
USING (true);

CREATE POLICY "grips_translations_admin_manage" 
ON public.grips_translations 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_grips_translations_updated_at
BEFORE UPDATE ON public.grips_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial English translations for existing grips
INSERT INTO public.grips_translations (grip_id, language_code, name, description)
SELECT 
  id,
  'en' as language_code,
  name,
  description
FROM public.grips
WHERE description IS NOT NULL
ON CONFLICT (grip_id, language_code) DO NOTHING;