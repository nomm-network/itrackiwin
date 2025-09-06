-- a) table for user exercise estimates
create table if not exists public.user_exercise_estimates (
  user_id uuid not null default auth.uid(),
  exercise_id uuid not null,
  est_10rm_kg numeric not null check (est_10rm_kg > 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

-- Enable RLS
alter table public.user_exercise_estimates enable row level security;

-- RLS policies
create policy "Users can manage their own exercise estimates"
on public.user_exercise_estimates
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- b) upsert rpc
create or replace function public.upsert_user_exercise_estimate(
  p_exercise_id uuid,
  p_est_10rm_kg numeric
) returns void
language plpgsql security definer set search_path=public as $$
begin
  insert into public.user_exercise_estimates (user_id, exercise_id, est_10rm_kg)
  values (auth.uid(), p_exercise_id, p_est_10rm_kg)
  on conflict (user_id, exercise_id)
  do update set est_10rm_kg = excluded.est_10rm_kg, updated_at = now();
end; $$;

-- c) fetch for a template
create or replace function public.get_template_estimates(
  p_template_id uuid
) returns table(
  exercise_id uuid,
  exercise_name text,
  est_10rm_kg numeric
)
language sql security definer set search_path=public as $$
  select te.exercise_id,
         e.display_name as exercise_name,
         uee.est_10rm_kg
  from public.template_exercises te
  join public.exercises e on e.id = te.exercise_id
  left join public.user_exercise_estimates uee
    on uee.user_id = auth.uid() and uee.exercise_id = te.exercise_id
  where te.template_id = p_template_id
  order by te.order_index;
$$;