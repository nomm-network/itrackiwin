-- Add missing foreign key constraints for movements and movement_patterns translations
ALTER TABLE movements_translations 
ADD CONSTRAINT fk_movements_translations_movement_id 
FOREIGN KEY (movement_id) REFERENCES movements(id) ON DELETE CASCADE;

ALTER TABLE movement_patterns_translations 
ADD CONSTRAINT fk_movement_patterns_translations_movement_pattern_id 
FOREIGN KEY (movement_pattern_id) REFERENCES movement_patterns(id) ON DELETE CASCADE;