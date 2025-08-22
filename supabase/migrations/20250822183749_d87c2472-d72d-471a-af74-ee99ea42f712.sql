-- User fitness profile
create table if not exists public.user_fitness_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sex text check (sex in ('male','female','other')) null,
  bodyweight numeric null,
  height_cm numeric null,
  training_age_months int null,             -- lifting experience
  goal text check (goal in ('hypertrophy','strength','fat_loss','general')) default 'hypertrophy',
  injuries jsonb default '{}'::jsonb,       -- {"shoulder_left": "mild", "knee_right":"old"}
  prefer_short_rests boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.user_fitness_profile enable row level security;

create policy "own_profile" on public.user_fitness_profile
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- First-time 10RM seed
create table if not exists public.user_exercise_estimates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  type text check (type in ('rm10','rm5','other')) not null default 'rm10',
  estimated_weight numeric not null,
  unit text not null default 'kg',
  source text default 'user_prompt', -- or 'model', 'avg_peer'
  created_at timestamptz default now(),
  unique(user_id, exercise_id, type)
);

alter table public.user_exercise_estimates enable row level security;

create policy "own_estimates" on public.user_exercise_estimates
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Warmup quality enum
create type warmup_quality as enum ('not_enough','excellent','too_much');

-- Warm-up summary + rating (per exercise in a workout)
create table if not exists public.workout_exercise_feedback (
  workout_exercise_id uuid primary key
    references public.workout_exercises(id) on delete cascade,
  warmup_quality warmup_quality,
  warmup_total_reps int,          -- optional telemetry (not required)
  warmup_top_weight numeric,      -- optional telemetry
  notes text,
  created_at timestamptz default now()
);

alter table public.workout_exercise_feedback enable row level security;

create policy "own_we_feedback" on public.workout_exercise_feedback
  using (
    exists (select 1 from public.workout_exercises we
            join public.workouts w on w.id = we.workout_id
            where we.id = workout_exercise_feedback.workout_exercise_id
              and w.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.workout_exercises we
            join public.workouts w on w.id = we.workout_id
            where we.id = workout_exercise_feedback.workout_exercise_id
              and w.user_id = auth.uid())
  );

-- Add effort mapping as smallint to workout_sets if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workout_sets' AND column_name = 'effort_rating'
  ) THEN
    ALTER TABLE public.workout_sets ADD COLUMN effort_rating smallint;
    COMMENT ON COLUMN public.workout_sets.effort_rating IS 'Effort: -2=very_hard, -1=hard, 0=moderate, 1=easy, 2=very_easy';
  END IF;
END $$;