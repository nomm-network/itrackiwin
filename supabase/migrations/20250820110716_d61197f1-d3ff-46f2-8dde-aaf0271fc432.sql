-- Add foreign key constraints for translation tables

-- Add foreign key for body_parts_translations
ALTER TABLE public.body_parts_translations 
ADD CONSTRAINT fk_body_parts_translations_body_part_id 
FOREIGN KEY (body_part_id) REFERENCES public.body_parts(id) ON DELETE CASCADE;

-- Add foreign key for muscle_groups_translations  
ALTER TABLE public.muscle_groups_translations 
ADD CONSTRAINT fk_muscle_groups_translations_muscle_group_id 
FOREIGN KEY (muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE CASCADE;

-- Add foreign key for muscles_translations
ALTER TABLE public.muscles_translations 
ADD CONSTRAINT fk_muscles_translations_muscle_id 
FOREIGN KEY (muscle_id) REFERENCES public.muscles(id) ON DELETE CASCADE;

-- Add foreign key for equipment_translations
ALTER TABLE public.equipment_translations 
ADD CONSTRAINT fk_equipment_translations_equipment_id 
FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;

-- Add foreign key for muscle_groups to body_parts
ALTER TABLE public.muscle_groups 
ADD CONSTRAINT fk_muscle_groups_body_part_id 
FOREIGN KEY (body_part_id) REFERENCES public.body_parts(id) ON DELETE CASCADE;

-- Add foreign key for muscles to muscle_groups
ALTER TABLE public.muscles 
ADD CONSTRAINT fk_muscles_muscle_group_id 
FOREIGN KEY (muscle_group_id) REFERENCES public.muscle_groups(id) ON DELETE CASCADE;