-- Preview what will be configured (no writes)
with base as (
  select
    e.id,
    e.slug,
    coalesce(e.custom_display_name, e.display_name) as name,
    lower(coalesce(e.display_name, e.slug, '')) as n
  from public.exercises e
),
-- Guess movement pattern from the name
pattern_guess as (
  select
    b.id,
    case
      when b.n ~ '(bench|push-?up|dip|chest press)'                       then 'horizontal_push'
      when b.n ~ '(overhead|ohp|shoulder press|military press)'            then 'vertical_push'
      when b.n ~ '(row|seated row|cable row)'                               then 'horizontal_pull'
      when b.n ~ '(pull-?up|chin-?up|pulldown)'                             then 'vertical_pull'
      when b.n ~ '(deadlift|rdl|hip hinge|good ?morning|back extension)'    then 'hinge'
      when b.n ~ '(squat|leg press|hack squat)'                             then 'squat'
      when b.n ~ '(lunge|split squat|step-?up|rear foot|bulgarian)'         then 'lunge'
      when b.n ~ '(carry|farmer)'                                           then 'carry'
      when b.n ~ '(plank|rollout|dead bug|hollow|side plank|anti-rotation)' then 'core'
      else null
    end as pattern_key
  from base b
),
-- Guess primary muscle from the name
primary_muscle_guess as (
  select
    b.id,
    case
      when b.n ~ '(chest|bench|fly)'                                        then 'chest'
      when b.n ~ '(lat|pull-?up|chin-?up|pulldown|row)'                     then 'lats'
      when b.n ~ '(shoulder|overhead|ohp|deltoid|lateral raise)'            then 'delts'
      when b.n ~ '(triceps?)'                                               then 'triceps'
      when b.n ~ '(biceps?)'                                                then 'biceps'
      when b.n ~ '(squat|quad|leg extension)'                                then 'quadriceps'
      when b.n ~ '(hamstring|leg curl|rdl|good ?morning)'                    then 'hamstrings'
      when b.n ~ '(glute|hip thrust|bridge|kickback)'                        then 'glutes'
      when b.n ~ '(calf|calves)'                                            then 'calves'
      when b.n ~ '(ab|core|plank|oblique|anti-rotation|crunch)'              then 'abdominals'
      else null
    end as muscle_key
  from base b
),
-- Resolve guessed keys to IDs from your reference tables
pattern_resolved as (
  select
    pg.id,
    mp.id as movement_pattern_id
  from pattern_guess pg
  left join public.movement_patterns mp
    on lower(coalesce(mp.display_name, mp.name, mp.slug)) = pg.pattern_key
),
primary_muscle_resolved as (
  select
    pmg.id,
    m.id as primary_muscle_id
  from primary_muscle_guess pmg
  left join public.muscles m
    on lower(coalesce(m.display_name, m.name, m.slug)) = pmg.muscle_key
),
-- Choose a default Olympic bar type if you have one
bar_pick as (
  select bt.id as default_bar_type_id
  from public.bar_types bt
  where lower(coalesce(bt.display_name, bt.name, bt.slug)) ~ '(olympic|20 ?kg|standard)'
  order by bt.id asc
  limit 1
),
calc as (
  select
    b.id, b.slug, b.name,
    -- effort_mode
    case
      when b.n ~ '(treadmill|row(er)?|bike|elliptical|assault|airdyne|concept ?2|ski|stair|stepmill)'
        then 'time'
      when b.n ~ '(carry|farmer)'
        then 'distance'
      when b.n ~ '(erg|concept ?2)'
        then 'distance'  -- or 'time' depending on your convention
      else 'reps'
    end as effort_mode_new,

    -- load_mode
    case
      when b.n ~ '(treadmill|row(er)?|bike|elliptical|assault|airdyne|concept ?2|ski|stair|stepmill)'
        then 'machine_level'
      when b.n ~ '(assisted|assist machine)'
        then 'external_assist'
      when b.n ~ '(pull-?up|chin-?up|dip|push-?up|muscle-?up)'
        then 'bodyweight_plus_optional'
      when b.n ~ '(banded|band)'
        then 'band_level'
      when b.n ~ '(barbell|smith)'
        then 'external_added'
      when b.n ~ '(dumbbell|kettlebell|kb|cable|machine|selectorized|plate-?loaded)'
        then 'external_added'
      else 'external_added'
    end as load_mode_new,

    -- flags
    (b.n ~ '(barbell|smith)')                                             as is_bar_loaded_new,
    (b.n ~ '(single-?arm|single-?leg|unilateral|split squat|bulgarian)')  as is_unilateral_new,
    (b.n ~ '(pull-?up|chin-?up|lat pulldown|row|barbell|cable)')          as allows_grips_new
  from base b
)
select
  c.id, c.slug, c.name,
  c.effort_mode_new, c.load_mode_new,
  c.is_bar_loaded_new, c.is_unilateral_new, c.allows_grips_new,
  pr.movement_pattern_id,
  pm.primary_muscle_id
from calc c
left join pattern_resolved pr on pr.id = c.id
left join primary_muscle_resolved pm on pm.id = c.id
order by c.name;