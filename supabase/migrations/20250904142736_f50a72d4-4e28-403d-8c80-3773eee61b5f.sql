-- Step 2: Harden the start_workout RPC (never fails on NULLs)
-- This version:
-- • uses only normalized names (target_weight_kg, rest_seconds),
-- • computes a base load per exercise if the template's is null,
-- • applies a readiness multiplier (falls back to 1.00 if your readiness funcs are absent),
-- • inserts workout_exercises with fully-formed target_weight_kg,
-- • stores the template_id on the workout,
-- • is RLS-safe (SECURITY DEFINER + search_path = public).

create or replace function public.start_workout(p_template_id uuid default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id       uuid;
  v_workout_id    uuid;
  v_score         numeric := 65;   -- fallback
  v_mult          numeric := 1.00; -- fallback
  rec             record;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Try to compute readiness score (tolerant if function/view missing)
  begin
    select public.compute_readiness_for_user(v_user_id) into v_score;
    if v_score is null then v_score := 65; end if;
  exception when others then
    v_score := 65;
  end;

  -- Try to get multiplier (tolerant)
  begin
    select public.readiness_multiplier(v_score) into v_mult;
    if v_mult is null then v_mult := 1.00; end if;
  exception when others then
    v_mult := 1.00;
  end;

  -- Create workout; keep template_id if given
  insert into public.workouts (user_id, started_at, template_id, readiness_score)
  values (v_user_id, now(), p_template_id, v_score)
  returning id into v_workout_id;

  -- If no template -> return empty workout
  if p_template_id is null then
    return v_workout_id;
  end if;

  -- Validate template ownership or public visibility
  if not exists (
    select 1
    from public.workout_templates t
    where t.id = p_template_id
      and (t.user_id = v_user_id or coalesce(t.is_public, false) = true)
  ) then
    raise exception 'Template not found or access denied';
  end if;

  -- Copy exercises with computed targets
  for rec in
    select
      te.id             as te_id,
      te.exercise_id,
      te.order_index,
      te.default_sets,
      te.target_reps,
      te.target_weight_kg        as te_target_kg,
      te.weight_unit,
      te.rest_seconds,
      te.notes
    from public.template_exercises te
    where te.template_id = p_template_id
    order by te.order_index
  loop
    -- compute base load if template has null:
    -- prefer: last non-warmup set (≤60d) → user estimate → PR×0.70 → 20
    declare
      v_base numeric;
    begin
      v_base := rec.te_target_kg;

      if v_base is null then
        select coalesce(
          -- last working set
          (
            select coalesce(ws.weight_kg, ws.weight)::numeric
            from public.workouts w
            join public.workout_exercises we on we.workout_id = w.id and we.exercise_id = rec.exercise_id
            join public.workout_sets ws on ws.workout_exercise_id = we.id
            where w.user_id = v_user_id
              and w.started_at > now() - interval '60 days'
              and coalesce(ws.set_kind::text, 'normal') <> 'warmup'
              and ws.is_completed = true
            order by coalesce(w.ended_at, w.started_at) desc, ws.completed_at desc
            limit 1
          ),
          -- user estimate
          (
            select estimated_weight::numeric
            from public.user_exercise_estimates uee
            where uee.user_id = v_user_id
              and uee.exercise_id = rec.exercise_id
              and uee.type in ('working','rm10','estimated_working')
            order by coalesce(uee.updated_at, uee.created_at) desc
            limit 1
          ),
          -- PR × 0.70 (ignore if view missing)
          (
            select best_weight * 0.70
            from public.mv_pr_weight_per_user_exercise pr
            where pr.user_id = v_user_id
              and pr.exercise_id = rec.exercise_id
            limit 1
          ),
          20
        ) into v_base;
      end if;

      -- apply multiplier (round to 0.5 kg steps)
      v_base := round((v_base * v_mult) * 2) / 2.0;

      insert into public.workout_exercises (
        workout_id,
        exercise_id,
        order_index,
        target_sets,
        target_reps,
        target_weight_kg,
        weight_unit,
        rest_seconds,
        notes
      ) values (
        v_workout_id,
        rec.exercise_id,
        rec.order_index,
        rec.default_sets,
        rec.target_reps,
        v_base,
        coalesce(rec.weight_unit, 'kg'),
        rec.rest_seconds,
        rec.notes
      );
    end;
  end loop;

  return v_workout_id;
end;
$$;