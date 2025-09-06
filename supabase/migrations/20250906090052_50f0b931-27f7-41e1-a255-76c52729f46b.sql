-- Step 1c: Create mentors table with explicit schema reference

CREATE TABLE IF NOT EXISTS public.mentors (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL,
  mentor_kind        public.mentor_type NOT NULL,
  life_category_id   uuid NULL,
  display_name       text,
  bio                text,
  hourly_rate        numeric(10,2),
  currency           text DEFAULT 'USD',
  is_active          boolean NOT NULL DEFAULT true,
  accepting_clients  boolean NOT NULL DEFAULT true,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

-- Add foreign key constraints separately
ALTER TABLE public.mentors 
ADD CONSTRAINT fk_mentors_user_id 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.mentors 
ADD CONSTRAINT fk_mentors_life_category_id 
FOREIGN KEY (life_category_id) REFERENCES public.life_categories(id) ON DELETE SET NULL;

-- Add unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_mentors_unique_user_kind_category 
ON public.mentors (user_id, mentor_kind, COALESCE(life_category_id, '00000000-0000-0000-0000-000000000000'::uuid));