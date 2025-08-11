-- Create public bucket for exercise images (idempotent)
insert into storage.buckets (id, name, public)
values ('exercise-images', 'exercise-images', true)
on conflict (id) do nothing;

-- Storage policies for exercise-images bucket
create policy if not exists "Exercise images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'exercise-images');

create policy if not exists "Users can upload their own exercise images"
  on storage.objects for insert
  with check (
    bucket_id = 'exercise-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can update their own exercise images"
  on storage.objects for update
  using (
    bucket_id = 'exercise-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy if not exists "Users can delete their own exercise images"
  on storage.objects for delete
  using (
    bucket_id = 'exercise-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create table to track multiple images per exercise
create table if not exists public.exercise_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  exercise_id uuid not null,
  url text not null,
  path text not null,
  is_primary boolean not null default false,
  order_index int not null default 1,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.exercise_images enable row level security;

-- Indexes
create index if not exists idx_exercise_images_exercise on public.exercise_images (exercise_id);
create index if not exists idx_exercise_images_user on public.exercise_images (user_id);
create index if not exists idx_exercise_images_order on public.exercise_images (exercise_id, order_index);

-- Policies: Only owner can manage and view their images, and only for their own exercises
create policy if not exists "exercise_images_owner_select"
  on public.exercise_images for select
  using (user_id = auth.uid());

create policy if not exists "exercise_images_owner_modify"
  on public.exercise_images for all
  using (
    user_id = auth.uid()
    and exists (
      select 1 from public.exercises e
      where e.id = exercise_images.exercise_id and e.owner_user_id = auth.uid()
    )
  )
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.exercises e
      where e.id = exercise_images.exercise_id and e.owner_user_id = auth.uid()
    )
  );