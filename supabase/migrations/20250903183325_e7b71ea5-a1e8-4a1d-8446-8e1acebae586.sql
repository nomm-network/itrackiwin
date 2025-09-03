-- ========== DROP OLD MENTOR/COACH TABLES ==========
DROP TABLE IF EXISTS public.mentor_categories CASCADE;
DROP TABLE IF EXISTS public.mentors CASCADE;

-- ========== PREREQS ==========
-- Enable pgcrypto/gen_random_uuid() if not already
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ========== ADD MISSING COLUMNS TO EXISTING LIFE_CATEGORIES ==========
-- Add name column if it doesn't exist (using display name from translations)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'life_categories' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE public.life_categories ADD COLUMN name TEXT;
        
        -- Populate name from translations or use slug as fallback
        UPDATE public.life_categories 
        SET name = COALESCE(
            (SELECT name FROM life_category_translations 
             WHERE category_id = life_categories.id AND language_code = 'en' 
             LIMIT 1),
            initcap(replace(slug, '_', ' '))
        );
        
        -- Make name NOT NULL after populating
        ALTER TABLE public.life_categories ALTER COLUMN name SET NOT NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'life_categories' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.life_categories ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
END $$;

-- ========== MENTOR ROLES LOOKUP ==========
CREATE TABLE IF NOT EXISTS public.mentor_roles (
  key TEXT PRIMARY KEY,          -- 'mentor' | 'coach'
  label TEXT NOT NULL
);

INSERT INTO public.mentor_roles (key, label) VALUES
  ('mentor','Online Mentor'),
  ('coach','In-Person Coach')
ON CONFLICT (key) DO NOTHING;

-- ========== CORE MENTOR TABLES ==========
CREATE TABLE IF NOT EXISTS public.mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL REFERENCES public.mentor_roles(key),
  life_category_id UUID NOT NULL REFERENCES public.life_categories(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT,
  hourly_rate_cents INTEGER CHECK (hourly_rate_cents IS NULL OR hourly_rate_cents >= 0),
  currency TEXT DEFAULT 'USD',
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  accepts_clients BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_key, life_category_id)
);

CREATE TABLE IF NOT EXISTS public.mentor_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mentor_id, tag)
);

-- A relationship between a mentor_profile and a client user
CREATE TABLE IF NOT EXISTS public.mentorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',     -- 'pending' | 'active' | 'paused' | 'ended'
  is_linked BOOLEAN NOT NULL DEFAULT TRUE,   -- true = templates/programs update live
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only one ACTIVE link between a mentor and a client
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_mentorship
  ON public.mentorships (mentor_id, client_user_id)
  WHERE status = 'active';

-- Mentor assigns templates to a client (via mentorship)
CREATE TABLE IF NOT EXISTS public.coach_assigned_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id UUID NOT NULL REFERENCES public.mentorships(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.workout_templates(id) ON DELETE CASCADE,
  is_linked BOOLEAN NOT NULL DEFAULT TRUE,   -- follow mentor updates?
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mentorship_id, template_id)
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_user ON public.mentor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_category ON public.mentor_profiles(life_category_id);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_role ON public.mentor_profiles(role_key);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_public ON public.mentor_profiles(is_public, is_approved);
CREATE INDEX IF NOT EXISTS idx_mentor_specialties_mentor ON public.mentor_specialties(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_client ON public.mentorships(client_user_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor ON public.mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_status ON public.mentorships(status);
CREATE INDEX IF NOT EXISTS idx_coach_assigned_templates_mentorship ON public.coach_assigned_templates(mentorship_id);

-- ========== TRIGGERS ==========
-- Auto-update updated_at timestamps
CREATE TRIGGER update_mentor_profiles_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_life_categories_updated_at
  BEFORE UPDATE ON public.life_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentorships_updated_at
  BEFORE UPDATE ON public.mentorships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ========== RLS ==========
ALTER TABLE public.life_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_assigned_templates ENABLE ROW LEVEL SECURITY;

-- life_categories (public read)
DROP POLICY IF EXISTS lc_public_read ON public.life_categories;
CREATE POLICY lc_public_read ON public.life_categories
  FOR SELECT
  USING (true);

-- mentor_roles (public read)
DROP POLICY IF EXISTS mr_public_read ON public.mentor_roles;
CREATE POLICY mr_public_read ON public.mentor_roles
  FOR SELECT
  USING (true);

-- mentor_profiles
DROP POLICY IF EXISTS mp_public_read ON public.mentor_profiles;
CREATE POLICY mp_public_read ON public.mentor_profiles
  FOR SELECT
  USING (is_public AND is_approved);

DROP POLICY IF EXISTS mp_owner_read ON public.mentor_profiles;
CREATE POLICY mp_owner_read ON public.mentor_profiles
  FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS mp_owner_ins ON public.mentor_profiles;
CREATE POLICY mp_owner_ins ON public.mentor_profiles
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS mp_owner_upd ON public.mentor_profiles;
CREATE POLICY mp_owner_upd ON public.mentor_profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS mp_owner_del ON public.mentor_profiles;
CREATE POLICY mp_owner_del ON public.mentor_profiles
  FOR DELETE
  USING (user_id = auth.uid());

-- mentor_specialties
DROP POLICY IF EXISTS ms_read ON public.mentor_specialties;
CREATE POLICY ms_read ON public.mentor_specialties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.id = mentor_id
        AND (
          (mp.is_public AND mp.is_approved) OR
          mp.user_id = auth.uid()
        )
    )
  );

DROP POLICY IF EXISTS ms_cud_owner ON public.mentor_specialties;
CREATE POLICY ms_cud_owner ON public.mentor_specialties
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.id = mentor_id AND mp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mentor_profiles mp
      WHERE mp.id = mentor_id AND mp.user_id = auth.uid()
    )
  );

-- mentorships
DROP POLICY IF EXISTS mship_read ON public.mentorships;
CREATE POLICY mship_read ON public.mentorships
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid())
    OR client_user_id = auth.uid()
  );

DROP POLICY IF EXISTS mship_insert ON public.mentorships;
CREATE POLICY mship_insert ON public.mentorships
  FOR INSERT
  WITH CHECK (
    -- Either the mentor owner creates it...
    EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid())
    -- ...or the client requests it (pending)
    OR (client_user_id = auth.uid() AND status = 'pending')
  );

DROP POLICY IF EXISTS mship_update ON public.mentorships;
CREATE POLICY mship_update ON public.mentorships
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid())
    OR client_user_id = auth.uid()
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid())
    OR client_user_id = auth.uid()
  );

DROP POLICY IF EXISTS mship_delete ON public.mentorships;
CREATE POLICY mship_delete ON public.mentorships
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.mentor_profiles mp WHERE mp.id = mentor_id AND mp.user_id = auth.uid())
    OR client_user_id = auth.uid()
  );

-- coach_assigned_templates
DROP POLICY IF EXISTS cat_read ON public.coach_assigned_templates;
CREATE POLICY cat_read ON public.coach_assigned_templates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mentorships ms
      JOIN public.mentor_profiles mp ON mp.id = ms.mentor_id
      WHERE ms.id = mentorship_id
        AND (mp.user_id = auth.uid() OR ms.client_user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS cat_cud_mentor ON public.coach_assigned_templates;
CREATE POLICY cat_cud_mentor ON public.coach_assigned_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.mentorships ms
      JOIN public.mentor_profiles mp ON mp.id = ms.mentor_id
      WHERE ms.id = mentorship_id AND mp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.mentorships ms
      JOIN public.mentor_profiles mp ON mp.id = ms.mentor_id
      WHERE ms.id = mentorship_id AND mp.user_id = auth.uid()
    )
  );

-- ========== PUBLIC VIEW ==========
CREATE OR REPLACE VIEW public.v_public_mentors AS
SELECT
  mp.id,
  mp.user_id,
  mr.key AS role_key,
  mr.label AS role_label,
  lc.slug AS category_slug,
  COALESCE(lc.name, initcap(replace(lc.slug, '_', ' '))) AS category_name,
  mp.headline,
  mp.bio,
  mp.hourly_rate_cents,
  mp.currency,
  mp.accepts_clients,
  mp.avatar_url,
  mp.created_at,
  (SELECT COUNT(*) FROM public.mentorships ms WHERE ms.mentor_id = mp.id AND ms.status = 'active') AS active_clients,
  ARRAY(
    SELECT ms.tag FROM public.mentor_specialties ms
    WHERE ms.mentor_id = mp.id ORDER BY ms.tag
  ) AS specialties
FROM public.mentor_profiles mp
JOIN public.mentor_roles mr ON mr.key = mp.role_key
JOIN public.life_categories lc ON lc.id = mp.life_category_id
WHERE mp.is_public AND mp.is_approved;