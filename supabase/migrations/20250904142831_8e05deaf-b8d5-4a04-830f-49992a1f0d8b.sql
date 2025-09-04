-- Step 1: Backfill template targets (fixed - correct column names)
with candidates as (
  select
    te.id                                as te_id,
    te.exercise_id,
    wt.user_id                           as owner_id,

    -- 1) last working set within 60 days
    (
      select coalesce(ws.weight_kg, ws.weight)::numeric
      from public.workouts w
      join public.workout_exercises we on we.workout_id = w.id and we.exercise_id = te.exercise_id
      join public.workout_sets ws on ws.workout_exercise_id = we.id
      where w.user_id = wt.user_id
        and w.started_at > now() - interval '60 days'
        and ws.is_completed = true
      order by coalesce(w.ended_at, w.started_at) desc
      limit 1
    )                                     as last_working_kg,

    -- 2) user estimate (rm10/working/etc) 
    (
      select estimated_weight::numeric
      from public.user_exercise_estimates uee
      where uee.user_id = wt.user_id
        and uee.exercise_id = te.exercise_id
        and uee.type in ('working','rm10','estimated_working')
      order by coalesce(uee.updated_at, uee.created_at) desc
      limit 1
    )                                     as estimate_kg,

    -- 3) PR × 0.70 (tolerant if view doesn't exist)
    (
      select best_weight * 0.70
      from public.mv_pr_weight_per_user_exercise pr
      where pr.user_id = wt.user_id
        and pr.exercise_id = te.exercise_id
      limit 1
    )                                     as pr70_kg
  from public.template_exercises te
  join public.workout_templates wt on wt.id = te.template_id
  where te.target_weight_kg is null
)
update public.template_exercises te
set target_weight_kg = round(
  coalesce(c.last_working_kg, c.estimate_kg, c.pr70_kg, 20)::numeric
, 1)
from candidates c
where te.id = c.te_id
  and te.target_weight_kg is null;