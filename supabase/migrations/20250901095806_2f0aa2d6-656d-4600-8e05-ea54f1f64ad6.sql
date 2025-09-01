-- Step 1: Migrate defaults from Handle world to Equipment+Grip world

BEGIN;

-- 1) Ensure target table exists
CREATE TABLE IF NOT EXISTS public.equipment_grip_defaults (
  equipment_id uuid NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  grip_id      uuid NOT NULL REFERENCES public.grips(id) ON DELETE CASCADE,
  is_default   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (equipment_id, grip_id)
);

-- 2) Migrate allowed grips per equipment from old handle mappings
--    Logic: any (equipment, handle) that allowed a grip => that grip is allowed on that equipment.
--    If any row in old equipment_handle_grips said is_default=true, we keep that as default.
WITH by_handle AS (
  SELECT
    he.equipment_id,
    hgc.grip_id,
    bool_or(COALESCE(ehg.is_default, false)) AS is_default_any
  FROM public.handle_equipment he
  JOIN public.handle_grip_compatibility hgc ON hgc.handle_id = he.handle_id
  LEFT JOIN public.equipment_handle_grips ehg
         ON ehg.equipment_id = he.equipment_id
        AND ehg.handle_id    = he.handle_id
        AND ehg.grip_id      = hgc.grip_id
  GROUP BY he.equipment_id, hgc.grip_id
)
INSERT INTO public.equipment_grip_defaults (equipment_id, grip_id, is_default)
SELECT b.equipment_id, b.grip_id, b.is_default_any
FROM by_handle b
LEFT JOIN public.equipment_grip_defaults egd
  ON egd.equipment_id = b.equipment_id AND egd.grip_id = b.grip_id
WHERE egd.equipment_id IS NULL;

-- 3) Guarantee at least one default per equipment that has any grips
WITH cte AS (
  SELECT
    equipment_id,
    bool_or(is_default) AS has_default
  FROM public.equipment_grip_defaults
  GROUP BY equipment_id
)
UPDATE public.equipment_grip_defaults egd
SET is_default = true
FROM cte
WHERE cte.equipment_id = egd.equipment_id
  AND cte.has_default = false
  AND egd.grip_id = (
    SELECT grip_id
    FROM public.equipment_grip_defaults x
    WHERE x.equipment_id = egd.equipment_id
    ORDER BY x.grip_id
    LIMIT 1
  );

-- 4) Backfill exercises.default_grip_ids when empty
UPDATE public.exercises e
SET default_grip_ids = COALESCE(ARRAY(
  SELECT g.id
  FROM public.grips g
  JOIN public.equipment_grip_defaults egd
    ON egd.grip_id = g.id
  WHERE egd.equipment_id = e.equipment_id
    AND egd.is_default = true
), ARRAY[]::uuid[])
WHERE (e.default_grip_ids IS NULL OR array_length(e.default_grip_ids,1) IS NULL);

COMMIT;