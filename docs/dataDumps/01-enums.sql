-- Enumerations referenced by your current columns
-- This exports all enum values used by the schema to avoid invalid inserts

select t.typname as enum_type, e.enumlabel as value
from pg_type t
join pg_enum e on t.oid = e.enumtypid
where t.typname in (
  -- exercises
  (select atttypid::regtype::text from pg_attribute
    where attrelid = 'public.exercises'::regclass and attname = 'effort_mode'),
  (select atttypid::regtype::text from pg_attribute
    where attrelid = 'public.exercises'::regclass and attname = 'load_mode'),
  (select atttypid::regtype::text from pg_attribute
    where attrelid = 'public.exercises'::regclass and attname = 'exercise_skill_level'),
  -- equipment
  (select atttypid::regtype::text from pg_attribute
    where attrelid = 'public.equipment'::regclass and attname = 'load_type'),
  (select atttypid::regtype::text from pg_attribute
    where attrelid = 'public.equipment'::regclass and attname = 'load_medium'),
  (select atttypid::regtype::text from pg_attribute
    where attrelid = 'public.equipment'::regclass and attname = 'default_stack_unit'),
  -- workout_sets (for UI logging)
  (select atttypid::regtype::text from pg_attribute
    where attrelid = 'public.workout_sets'::regclass and attname = 'effort')
)
order by enum_type, e.enumsortorder;

-- Expected output: CSV/JSON with columns: enum_type, value
-- This prevents inserting invalid enum values during bulk exercise creation