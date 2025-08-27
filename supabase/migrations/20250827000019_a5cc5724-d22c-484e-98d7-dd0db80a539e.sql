-- 2.1. Bar catalog (if not already filled)
insert into bar_types (name, default_weight, unit) values
  ('Olympic Bar 20 kg', 20, 'kg'),
  ('Women''s Bar 15 kg', 15, 'kg'),
  ('Technique Bar 7 kg', 7, 'kg'),
  ('Trap/Hex Bar 25 kg', 25, 'kg')
on conflict (name) do nothing;

-- 2.2. Workout-exercise preferences (optional override per exercise instance)
alter table workout_exercises
  add column if not exists bar_type_id uuid null references bar_types(id),
  add column if not exists load_entry_mode text null check (load_entry_mode in ('total','one_side'));

-- 2.3. Per-set payload: what the user entered + normalized totals
alter table workout_sets
  add column if not exists bar_type_id uuid null references bar_types(id),
  add column if not exists load_entry_mode text null check (load_entry_mode in ('total','one_side')),
  add column if not exists load_one_side_kg numeric null,       -- what user typed if 'one_side'
  add column if not exists total_weight_kg numeric null;        -- canonical total incl. bar

-- 2.4. Helpful index (queries by exercise quickly)
create index if not exists idx_workout_sets_total_by_ex on workout_sets (workout_exercise_id, total_weight_kg);

-- 3. Server-side helper to normalize totals
create or replace function compute_total_weight(
  p_entry_mode text,
  p_value numeric,                 -- if 'total' → total; if 'one_side' → one side plates
  p_bar_weight numeric,            -- from bar_types or gym_equipment
  p_is_symmetrical boolean default true
) returns numeric language sql immutable as $$
  select case
    when p_entry_mode = 'total' then coalesce(p_value,0)
    when p_entry_mode = 'one_side' then coalesce(p_bar_weight,0) + case when coalesce(p_is_symmetrical,true) then 2 else 1 end * coalesce(p_value,0)
    else null
  end;
$$;