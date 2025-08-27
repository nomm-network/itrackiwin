-- Enable RLS on tables that are missing it (critical security fix)
ALTER TABLE public.muscles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY;

-- Add basic RLS policies for system data
CREATE POLICY "Muscles are viewable by everyone" 
ON public.muscles FOR SELECT USING (true);

CREATE POLICY "Muscle groups are viewable by everyone" 
ON public.muscle_groups FOR SELECT USING (true);

-- Admin-only modification policies
CREATE POLICY "Admins can manage muscles" 
ON public.muscles FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage muscle groups" 
ON public.muscle_groups FOR ALL USING (is_admin(auth.uid()));