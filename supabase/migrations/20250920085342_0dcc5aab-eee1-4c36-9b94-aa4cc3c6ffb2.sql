-- Update start_workout function to reliably copy template exercises
create or replace function public.start_workout(p_template_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id       uuid := auth.uid();
  v_workout_id    uuid;
  v_template_name text;
  rec             record;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Optional: pick template name for workout title
  if p_template_id is not null then
    select name
      into v_template_name
    from workout_templates
    where id = p_template_id
      and (user_id = v_user_id or is_public = true)
    limit 1;

    if v_template_name is null then
      raise exception 'Template not found or access denied';
    end if;
  end if;

  insert into workouts (user_id, started_at, template_id, title)
  values (v_user_id, now(), p_template_id, coalesce(v_template_name, 'Workout'))
  returning id into v_workout_id;

  -- If no template, done
  if p_template_id is null then
    return v_workout_id;
  end if;

  -- Copy ALL template_exercises in order
  for rec in
    select te.exercise_id,
           coalesce(te.order_index, 9999) as order_index,
           coalesce(te.default_sets, 3)   as target_sets,
           te.target_reps,
           te.target_weight_kg,
           coalesce(te.weight_unit, 'kg') as weight_unit,
           coalesce(te.attribute_values_json, '{}'::jsonb) as attribute_values_json
    from template_exercises te
    where te.template_id = p_template_id
    order by order_index nulls last
  loop
    insert into workout_exercises (
      workout_id,
      exercise_id,
      order_index,
      target_sets,
      target_reps,
      target_weight_kg,
      weight_unit,
      attribute_values_json
    )
    values (
      v_workout_id,
      rec.exercise_id,
      rec.order_index,
      rec.target_sets,
      rec.target_reps,
      rec.target_weight_kg,
      rec.weight_unit,
      rec.attribute_values_json
    );
  end loop;

  return v_workout_id;
end;
$$;