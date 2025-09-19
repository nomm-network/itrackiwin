-- Updated exercise configuration with correct column references
begin;

-- Parameters (tweak if you use a different default bar weight)
with params as (
  select 20.0::numeric as default_olympic_bar_weight
),

-- Lowercased names for pattern/muscle matching
base as (
  select
    e.id,
    lower(coalesce(e.display_name, e.slug, '')) as n
  from public.exercises e
),

-- Guess movement pattern
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
      when b.n ~ '(plank|rollout|dead bug|hollow|side plank|anti-rotation)' then 'rotation'
      else null
    end as pattern_key
  from base b
),
-- Guess primary muscle
primary_muscle_guess as (
  select
    b.id,
    case
      when b.n ~ '(chest|bench|fly)'                                        then 'mid_chest'
      when b.n ~ '(lat|pull-?up|chin-?up|pulldown|row)'                     then 'lats'
      when b.n ~ '(shoulder|overhead|ohp|deltoid|lateral raise)'            then 'front_delts'
      when b.n ~ '(triceps?)'                                               then 'triceps_lateral_head'
      when b.n ~ '(biceps?)'                                                then 'biceps_long_head'
      when b.n ~ '(squat|quad|leg extension)'                                then 'rectus_femoris'
      when b.n ~ '(hamstring|leg curl|rdl|good ?morning)'                    then 'biceps_femoris'
      when b.n ~ '(glute|hip thrust|bridge|kickback)'                        then 'gluteus_maximus'
      when b.n ~ '(calf|calves)'                                            then 'gastrocnemius'
      when b.n ~ '(ab|core|plank|oblique|anti-rotation|crunch)'              then 'upper_abs'
      else null
    end as muscle_key
  from base b
),
-- Resolve guessed keys to IDs
pattern_resolved as (
  select
    pg.id,
    mp.id as movement_pattern_id
  from pattern_guess pg
  left join public.movement_patterns mp
    on lower(mp.slug) = pg.pattern_key
),
primary_muscle_resolved as (
  select
    pmg.id,
    m.id as primary_muscle_id
  from primary_muscle_guess pmg
  left join public.muscles m
    on lower(m.slug) = pmg.muscle_key
),
-- Pick default Olympic bar type (if present)
bar_pick as (
  select bt.id as default_bar_type_id
  from public.bar_types bt
  where lower(bt.name) ~ '(olympic|20 ?kg|standard)'
  order by bt.id asc
  limit 1
),
-- Compute new values per row
calc as (
  select
    b.id,
    -- effort_mode
    case
      when b.n ~ '(treadmill|row(er)?|bike|elliptical|assault|airdyne|concept ?2|ski|stair|stepmill)'
        then 'time'
      when b.n ~ '(carry|farmer)'
        then 'distance'
      when b.n ~ '(erg|concept ?2)'
        then 'distance'
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
),
-- 1) set core fields (overwrite all)
apply_core as (
  update public.exercises e
  set
    effort_mode     = calc.effort_mode_new::public.effort_mode,
    load_mode       = calc.load_mode_new::public.load_mode,
    is_bar_loaded   = calc.is_bar_loaded_new,
    is_unilateral   = calc.is_unilateral_new,
    allows_grips    = calc.allows_grips_new,
    configured      = true
  from calc
  where e.id = calc.id
  returning e.id
),
-- 2) set pattern & primary muscle (overwrite; ignoring NULLs if no match)
apply_refs as (
  update public.exercises e
  set
    movement_pattern_id = pr.movement_pattern_id,
    primary_muscle_id   = pm.primary_muscle_id
  from pattern_resolved pr
  left join primary_muscle_resolved pm on pm.id = pr.id
  where e.id = pr.id
  returning e.id
),
-- 3) set default bar data when bar-loaded
apply_bar as (
  update public.exercises e
  set
    default_bar_weight  = coalesce(e.default_bar_weight,  p.default_olympic_bar_weight)
  from params p
  where e.id in (select id from apply_core)
    and e.is_bar_loaded is true
  returning e.id
)
select
  (select count(*) from apply_core) as core_rows,
  (select count(*) from apply_refs) as ref_rows,
  (select count(*) from apply_bar)  as bar_rows;

commit;