-- Enable gym equipment v2 feature flag
INSERT INTO public.app_flags (key, enabled) 
VALUES ('gym_equipment_v2', true)
ON CONFLICT (key) 
DO UPDATE SET enabled = true;