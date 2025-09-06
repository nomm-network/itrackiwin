-- Fix security issue by adding proper RLS policy to the view
-- Only allow admins to access the user overview
CREATE POLICY "Admins can view user overview"
ON public.v_admin_users_overview
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));

-- Add RLS policies for mentor_category_assignments for admins
CREATE POLICY "Admins can manage mentor assignments"
ON public.mentor_category_assignments
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'superadmin'::app_role));