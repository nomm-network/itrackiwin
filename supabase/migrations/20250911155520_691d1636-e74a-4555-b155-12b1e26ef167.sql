-- Enable gym equipment v2 feature flag
INSERT INTO public.app_flags (key, enabled, description) 
VALUES ('gym_equipment_v2', true, 'Enable gym equipment v2 with smart weight resolution')
ON CONFLICT (key) 
DO UPDATE SET enabled = true;