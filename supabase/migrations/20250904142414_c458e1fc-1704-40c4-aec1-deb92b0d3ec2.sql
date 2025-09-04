-- Step 0: Sanity check - see what's NULL
-- How many template exercises have no target today?
select wt.name as template,
       te.id as template_exercise_id,
       te.exercise_id,
       te.target_reps,
       te.target_weight_kg
from public.template_exercises te
join public.workout_templates wt on wt.id = te.template_id
where te.target_weight_kg is null
order by wt.name;