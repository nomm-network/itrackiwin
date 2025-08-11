-- 1) Roles: enum + user_roles + helpers + seed superadmin

-- Enum for app roles
CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'mentor', 'user');

-- user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check role (security definer to bypass RLS safely)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = _role
  );
$$;

-- Optional helper: is_admin (admin or superadmin)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'superadmin');
$$;

-- Policies for user_roles
-- Allow everyone to read their own roles
CREATE POLICY user_roles_select_own
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- Allow admins to read all roles
CREATE POLICY user_roles_admin_select_all
ON public.user_roles
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Allow admins to insert/update/delete roles with restriction that only superadmin can grant superadmin
CREATE POLICY user_roles_admin_manage
ON public.user_roles
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (
  CASE WHEN role = 'superadmin' THEN public.has_role(auth.uid(), 'superadmin') ELSE public.is_admin(auth.uid()) END
);

-- Seed SuperAdmin for the owner email
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'superadmin'::public.app_role
FROM auth.users u
WHERE u.email = 'solmyr09@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 2) Life categories and subcategories
CREATE TABLE public.life_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon text,
  color text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.life_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY life_categories_select_all
ON public.life_categories
FOR SELECT
USING (true);

-- Only admins can modify categories
CREATE POLICY life_categories_admin_manage
ON public.life_categories
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Subcategories
CREATE TABLE public.life_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.life_categories(id) ON DELETE CASCADE,
  slug text,
  name text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);

ALTER TABLE public.life_subcategories ENABLE ROW LEVEL SECURITY;

-- Everyone can read subcategories
CREATE POLICY life_subcategories_select_all
ON public.life_subcategories
FOR SELECT
USING (true);

-- Only admins can modify subcategories
CREATE POLICY life_subcategories_admin_manage
ON public.life_subcategories
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Seed the 6 top-level life categories (slugs aligned with existing UI)
INSERT INTO public.life_categories (slug, name, display_order)
VALUES
  ('health', 'Health', 1),
  ('mind', 'Mind', 2),
  ('relationships', 'Relationships', 3),
  ('wealth', 'Wealth', 4),
  ('purpose', 'Purpose', 5),
  ('lifestyle', 'Lifestyle', 6)
ON CONFLICT (slug) DO NOTHING;

-- 3) Per-user category preferences (order + priority)
CREATE TABLE public.user_category_prefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid NOT NULL REFERENCES public.life_categories(id) ON DELETE CASCADE,
  display_order int NOT NULL DEFAULT 0,
  priority int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, category_id)
);

ALTER TABLE public.user_category_prefs ENABLE ROW LEVEL SECURITY;

-- Owner can read their prefs
CREATE POLICY user_category_prefs_select_own
ON public.user_category_prefs
FOR SELECT
USING (user_id = auth.uid());

-- Owner can upsert/update/delete their prefs
CREATE POLICY user_category_prefs_manage_own
ON public.user_category_prefs
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER trg_user_category_prefs_updated_at
BEFORE UPDATE ON public.user_category_prefs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) User pinned subcategories (max 3 via trigger)
CREATE TABLE public.user_pinned_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subcategory_id uuid NOT NULL REFERENCES public.life_subcategories(id) ON DELETE CASCADE,
  pinned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, subcategory_id)
);

CREATE INDEX idx_user_pinned_subcategories_user_id ON public.user_pinned_subcategories(user_id);

ALTER TABLE public.user_pinned_subcategories ENABLE ROW LEVEL SECURITY;

-- Owner can read their pins
CREATE POLICY user_pinned_subcategories_select_own
ON public.user_pinned_subcategories
FOR SELECT
USING (user_id = auth.uid());

-- Owner can modify their pins
CREATE POLICY user_pinned_subcategories_manage_own
ON public.user_pinned_subcategories
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Trigger to enforce max 3 pins per user
CREATE OR REPLACE FUNCTION public.enforce_max_pins()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (SELECT COUNT(*) FROM public.user_pinned_subcategories WHERE user_id = NEW.user_id) >= 3 THEN
      RAISE EXCEPTION 'Maximum 3 pinned subcategories allowed per user';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_user_pinned_subcategories_before_insert
BEFORE INSERT ON public.user_pinned_subcategories
FOR EACH ROW EXECUTE FUNCTION public.enforce_max_pins();

-- 5) Mentors and their categories (minimal fields)
CREATE TABLE public.mentors (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  bio text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- Everyone can view mentors
CREATE POLICY mentors_select_all
ON public.mentors
FOR SELECT
USING (true);

-- Mentor owner or admins can manage
CREATE POLICY mentors_manage_owner_or_admin
ON public.mentors
FOR ALL
USING (user_id = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (user_id = auth.uid() OR public.is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER trg_mentors_updated_at
BEFORE UPDATE ON public.mentors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mentor categories (link mentors to life categories)
CREATE TABLE public.mentor_categories (
  mentor_id uuid NOT NULL REFERENCES public.mentors(user_id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.life_categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (mentor_id, category_id)
);

ALTER TABLE public.mentor_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view mentor-category links
CREATE POLICY mentor_categories_select_all
ON public.mentor_categories
FOR SELECT
USING (true);

-- Mentor owner or admins can manage links
CREATE POLICY mentor_categories_manage_owner_or_admin
ON public.mentor_categories
FOR ALL
USING (mentor_id = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (mentor_id = auth.uid() OR public.is_admin(auth.uid()));
