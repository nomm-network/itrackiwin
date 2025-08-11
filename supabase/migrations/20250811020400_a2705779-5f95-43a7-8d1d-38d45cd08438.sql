-- Create public bucket for exercise images (idempotent)
insert into storage.buckets (id, name, public)
values ('exercise-images', 'exercise-images', true)
on conflict (id) do nothing;

-- Storage policies for exercise-images bucket (create only if missing)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Exercise images are publicly readable'
  ) THEN
    CREATE POLICY "Exercise images are publicly readable"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'exercise-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can upload their own exercise images'
  ) THEN
    CREATE POLICY "Users can upload their own exercise images"
      ON storage.objects FOR INSERT
      WITH CHECK (
        bucket_id = 'exercise-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can update their own exercise images'
  ) THEN
    CREATE POLICY "Users can update their own exercise images"
      ON storage.objects FOR UPDATE
      USING (
        bucket_id = 'exercise-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete their own exercise images'
  ) THEN
    CREATE POLICY "Users can delete their own exercise images"
      ON storage.objects FOR DELETE
      USING (
        bucket_id = 'exercise-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
      );
  END IF;
END $$;

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
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'exercise_images' AND policyname = 'exercise_images_owner_select'
  ) THEN
    CREATE POLICY exercise_images_owner_select
      ON public.exercise_images FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'exercise_images' AND policyname = 'exercise_images_owner_modify'
  ) THEN
    CREATE POLICY exercise_images_owner_modify
      ON public.exercise_images FOR ALL
      USING (
        user_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.exercises e
          WHERE e.id = exercise_images.exercise_id AND e.owner_user_id = auth.uid()
        )
      )
      WITH CHECK (
        user_id = auth.uid()
        AND EXISTS (
          SELECT 1 FROM public.exercises e
          WHERE e.id = exercise_images.exercise_id AND e.owner_user_id = auth.uid()
        )
      );
  END IF;
END $$;