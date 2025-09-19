-- Equipment export (FK target for exercises.equipment_id)
-- All equipment rows with essential fields for exercise mapping

select
  id,
  slug,
  equipment_type,
  kind,
  load_type,          -- enum
  load_medium,        -- enum
  weight_kg,
  default_bar_weight_kg,
  default_single_min_increment_kg,
  default_side_min_plate_kg,
  default_stack_unit, -- enum
  default_stack_weights,
  configured,
  notes
from public.equipment
order by slug nulls last, created_at asc;

-- Expected output: Full CSV with all equipment rows
-- CG will use the 'id' column to reference equipment in exercise inserts
-- Keep all UUIDs exactly as returned for FK references