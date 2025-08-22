-- =========================================================
-- RLS POLICIES FOR NEW TABLES
-- =========================================================

-- gym_machines: read for gym members, write for gym admins
ALTER TABLE public.gym_machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gym members can view machines" ON public.gym_machines
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_gym_memberships ugm 
    WHERE ugm.user_id = auth.uid() AND ugm.gym_id = gym_machines.gym_id
  )
);

CREATE POLICY "Gym admins can manage machines" ON public.gym_machines
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.gym_admins ga 
    WHERE ga.user_id = auth.uid() AND ga.gym_id = gym_machines.gym_id
  )
);

-- gym_machine_usage_stats: system updates only
ALTER TABLE public.gym_machine_usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can update usage stats" ON public.gym_machine_usage_stats
FOR ALL
USING (true)
WITH CHECK (true);

-- gym_admins: view your own admin roles
ALTER TABLE public.gym_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own admin roles" ON public.gym_admins
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Gym owners can manage admins" ON public.gym_admins
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.gym_admins ga 
    WHERE ga.user_id = auth.uid() 
      AND ga.gym_id = gym_admins.gym_id 
      AND ga.role = 'owner'
  )
);

-- user_prioritized_muscle_groups: own data only
ALTER TABLE public.user_prioritized_muscle_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own muscle priorities" ON public.user_prioritized_muscle_groups
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- experience_level_configs: readable by all
ALTER TABLE public.experience_level_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Experience configs are readable by all authenticated users" ON public.experience_level_configs
FOR SELECT
TO authenticated
USING (true);

-- Add updated_at trigger for new tables
CREATE TRIGGER update_experience_level_configs_updated_at
BEFORE UPDATE ON public.experience_level_configs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gym_machines_updated_at
BEFORE UPDATE ON public.gym_machines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();