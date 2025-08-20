-- Clean up orphaned translation records before adding foreign keys

-- Remove orphaned body_parts_translations
DELETE FROM public.body_parts_translations 
WHERE body_part_id NOT IN (SELECT id FROM public.body_parts);

-- Remove orphaned muscle_groups_translations  
DELETE FROM public.muscle_groups_translations 
WHERE muscle_group_id NOT IN (SELECT id FROM public.muscle_groups);

-- Remove orphaned muscles_translations
DELETE FROM public.muscles_translations 
WHERE muscle_id NOT IN (SELECT id FROM public.muscles);

-- Remove orphaned equipment_translations
DELETE FROM public.equipment_translations 
WHERE equipment_id NOT IN (SELECT id FROM public.equipment);

-- Remove orphaned muscle_groups 
DELETE FROM public.muscle_groups 
WHERE body_part_id NOT IN (SELECT id FROM public.body_parts);

-- Remove orphaned muscles
DELETE FROM public.muscles 
WHERE muscle_group_id NOT IN (SELECT id FROM public.muscle_groups);

-- Now add foreign key constraints
ALTER TABLE public.body_parts_translations 
ADD CONSTRAINT fk_body_parts_translations_body_part_id 
FOREIGN KEY (body_part_id) REFERENCES public.body_parts(id) ON DELETE CASCADE;

ALTER TABLE public.muscle_groups_translations 
ADD CONSTRAINT fk_muscle_groups_translations_muscle_group_id 
FOREIGN KEY (muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE CASCADE;

ALTER TABLE public.muscles_translations 
ADD CONSTRAINT fk_muscles_translations_muscle_id 
FOREIGN KEY (muscle_id) REFERENCES public.muscles(id) ON DELETE CASCADE;

ALTER TABLE public.equipment_translations 
ADD CONSTRAINT fk_equipment_translations_equipment_id 
FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;

ALTER TABLE public.muscle_groups 
ADD CONSTRAINT fk_muscle_groups_body_part_id 
FOREIGN KEY (body_part_id) REFERENCES public.body_parts(id) ON DELETE CASCADE;

ALTER TABLE public.muscles 
ADD CONSTRAINT fk_muscles_muscle_group_id 
FOREIGN KEY (muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE CASCADE;