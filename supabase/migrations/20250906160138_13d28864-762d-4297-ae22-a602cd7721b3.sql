-- Step 6: Commissions UX + Marketplace prep (Corrected)

-- A) Ambassador Commissions UX

-- 1) Statement view (month-level, per agreement and totals)
CREATE OR REPLACE VIEW public.v_ambassador_statements AS
SELECT
  a.id as agreement_id,
  a.ambassador_id,
  a.gym_id,
  g.name as gym_name,
  a.battle_id,
  a.tier,
  a.percent,
  acc.year,
  acc.month,
  acc.gross_revenue,
  acc.commission_due,
  a.starts_at,
  a.ends_at,
  (make_date(acc.year, acc.month, 1) BETWEEN date_trunc('month', a.starts_at)::date
                                        AND COALESCE(date_trunc('month', a.ends_at)::date, '2099-12-31'::date)) as in_window
FROM public.ambassador_commission_agreements a
JOIN public.ambassador_commission_accruals acc ON acc.agreement_id = a.id
JOIN public.gyms g ON g.id = a.gym_id;

-- 2) Statement summary current & last month
CREATE OR REPLACE VIEW public.v_ambassador_statement_month AS
SELECT
  s.ambassador_id,
  s.year,
  s.month,
  SUM(s.commission_due) as commission_total
FROM public.v_ambassador_statements s
GROUP BY s.ambassador_id, s.year, s.month;

-- 3) CSV export RPC (ambassador self-serve)
CREATE OR REPLACE FUNCTION public.export_my_commissions_csv(p_year int, p_month int)
RETURNS text
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE 
  uid uuid := auth.uid();
  csv text;
BEGIN
  -- Only commissions for the calling ambassador
  WITH my_rows AS (
    SELECT gym_name, tier, percent, gross_revenue, commission_due
    FROM public.v_ambassador_statements s
    JOIN public.ambassador_profiles ap ON ap.id = s.ambassador_id
    WHERE ap.user_id = uid AND s.year = p_year AND s.month = p_month
    ORDER BY gym_name
  )
  SELECT string_agg(format('%s,%s,%.2f,%.2f,%.2f',
                           gym_name, tier, percent, gross_revenue, commission_due), E'\n')
    INTO csv
  FROM my_rows;
  
  RETURN COALESCE('Gym,Tier,Percent,Gross,Commission' || E'\n' || csv, 'Gym,Tier,Percent,Gross,Commission');
END$$;

GRANT EXECUTE ON FUNCTION public.export_my_commissions_csv(int,int) TO authenticated;

-- B) Ops Payouts (Superadmin)

-- 1) Payout export (all ambassadors, one month)
CREATE OR REPLACE FUNCTION public.export_payouts_csv(p_year int, p_month int)
RETURNS text
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE 
  csv text;
BEGIN
  IF NOT public.is_superadmin_simple() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  WITH rows AS (
    SELECT ap.user_id,
           u.email,
           s.ambassador_id,
           SUM(s.commission_due) as total_due
    FROM public.v_ambassador_statements s
    JOIN public.ambassador_profiles ap ON ap.id = s.ambassador_id
    LEFT JOIN auth.users u ON u.id = ap.user_id
    WHERE s.year = p_year AND s.month = p_month
    GROUP BY ap.user_id, u.email, s.ambassador_id
    ORDER BY total_due DESC
  )
  SELECT string_agg(format('%s,%s,%s,%.2f', user_id, COALESCE(email,''), ambassador_id, total_due), E'\n')
    INTO csv
  FROM rows;

  RETURN COALESCE('UserId,Email,AmbassadorId,TotalDue' || E'\n' || csv, 'UserId,Email,AmbassadorId,TotalDue');
END$$;

GRANT EXECUTE ON FUNCTION public.export_payouts_csv(int,int) TO authenticated;

-- C) Marketplace (Public)

-- 1) Public catalogs (read-only, SEO-friendly)

-- a) City catalog (gyms)
CREATE OR REPLACE VIEW public.v_marketplace_gyms AS
SELECT
  g.id,
  g.slug,
  g.name,
  g.city,
  g.country,
  g.photo_url,
  COALESCE(ga.active_members,0) as active_members,
  COALESCE(ga.active_coaches,0) as active_coaches
FROM public.gyms g
LEFT JOIN public.v_gym_activity ga ON ga.gym_id = g.id
WHERE g.status = 'active';

-- Add slug to mentor_profiles for SEO
ALTER TABLE public.mentor_profiles ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- b) Mentor categories join table
CREATE TABLE IF NOT EXISTS public.mentor_categories (
  mentor_profile_id uuid NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  category_key text NOT NULL,
  PRIMARY KEY (mentor_profile_id, category_key)
);

-- Enable RLS on mentor_categories
ALTER TABLE public.mentor_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentor_categories
CREATE POLICY "mc_read" ON public.mentor_categories
FOR SELECT USING (true);

CREATE POLICY "mc_mentor_manage" ON public.mentor_categories
FOR ALL TO authenticated 
USING (EXISTS (
  SELECT 1 FROM public.mentor_profiles mp 
  WHERE mp.id = mentor_categories.mentor_profile_id 
    AND mp.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.mentor_profiles mp 
  WHERE mp.id = mentor_categories.mentor_profile_id 
    AND mp.user_id = auth.uid()
));

-- c) Mentor catalog (by category/tags) - Fixed column names
CREATE OR REPLACE VIEW public.v_marketplace_mentors AS
SELECT
  mp.id as mentor_profile_id,
  mp.headline,
  mp.bio,
  mp.slug,
  mp.is_active,
  array_agg(mc.category_key ORDER BY mc.category_key) FILTER (WHERE mc.category_key IS NOT NULL) as categories
FROM public.mentor_profiles mp
LEFT JOIN public.mentor_categories mc ON mc.mentor_profile_id = mp.id
WHERE mp.is_active = true AND mp.is_public = true
GROUP BY mp.id, mp.headline, mp.bio, mp.slug, mp.is_active;

-- d) Local mentors (mentors with active memberships in a city) - Fixed column names
CREATE OR REPLACE VIEW public.v_marketplace_local_mentors AS
SELECT DISTINCT
  mp.id as mentor_profile_id,
  mp.headline,
  mp.slug,
  c.city,
  c.country
FROM public.mentor_profiles mp
JOIN public.gym_coach_memberships gcm ON gcm.mentor_id = mp.id AND gcm.status='active'
JOIN public.gyms g ON g.id = gcm.gym_id
JOIN public.cities c ON lower(c.city) = lower(g.city) AND lower(c.country)=lower(g.country)
WHERE mp.is_active = true AND mp.is_public = true;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ambassador_commission_accruals_agreement_year_month 
ON public.ambassador_commission_accruals(agreement_id, year, month);

CREATE INDEX IF NOT EXISTS idx_gyms_slug ON public.gyms(slug);
CREATE INDEX IF NOT EXISTS idx_mentor_profiles_slug ON public.mentor_profiles(slug);