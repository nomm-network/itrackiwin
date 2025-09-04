-- Verify the backfill worked - check if all NULL target weights are fixed
select wt.name as template,
       te.id as template_exercise_id,
       te.exercise_id,
       te.target_reps,
       te.target_weight_kg
from public.template_exercises te
join public.workout_templates wt on wt.id = te.template_id
order by wt.name;