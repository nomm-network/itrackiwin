-- Step 5: Analytics & Ops - KPI Views and Commission System (Fixed)

-- 1) Gym activity (members, coaches, sessions) - Updated without direct gym_id in workouts
CREATE OR REPLACE VIEW public.v_gym_activity AS
SELECT
  g.id as gym_id,
  g.name,
  COUNT(DISTINCT ugm.user_id) FILTER (WHERE ugm.status='active') as active_members,
  COUNT(DISTINCT gcm.mentor_profile_id) FILTER (WHERE gcm.status='active') as active_coaches,
  COUNT(DISTINCT w.id) FILTER (WHERE w.started_at >= now() - interval '7 days' AND ugm_w.gym_id = g.id) as workouts_7d,
  COUNT(DISTINCT w.id) FILTER (WHERE w.started_at >= now() - interval '30 days' AND ugm_w.gym_id = g.id) as workouts_30d
FROM public.gyms g
LEFT JOIN public.user_gym_memberships ugm ON ugm.gym_id=g.id
LEFT JOIN public.gym_coach_memberships gcm ON gcm.gym_id=g.id
LEFT JOIN public.workouts w ON w.user_id = ugm.user_id
LEFT JOIN public.user_gym_memberships ugm_w ON ugm_w.user_id = w.user_id AND ugm_w.gym_id = g.id
GROUP BY g.id, g.name;

-- 2) Exercise popularity per gym - Updated to use user gym memberships
CREATE OR REPLACE VIEW public.v_gym_top_exercises AS
SELECT
  ugm.gym_id,
  we.exercise_id,
  e.display_name as exercise_name,
  COUNT(*) as usages_30d
FROM public.workout_exercises we
JOIN public.workouts w ON w.id = we.workout_id
JOIN public.exercises e ON e.id = we.exercise_id
JOIN public.user_gym_memberships ugm ON ugm.user_id = w.user_id AND ugm.status = 'active'
WHERE w.started_at >= now() - interval '30 days'
GROUP BY ugm.gym_id, we.exercise_id, e.display_name;

-- 3) Equipment configuration completeness
CREATE OR REPLACE VIEW public.v_gym_equipment_completeness AS
SELECT
  g.id as gym_id,
  COUNT(*) FILTER (WHERE geo.id IS NOT NULL) as overrides_count,
  COUNT(ed.*) as defaults_available,
  ROUND(100.0 * COUNT(*) FILTER (WHERE geo.id IS NOT NULL) / NULLIF(COUNT(ed.*),0), 1) as overrides_coverage_pct
FROM public.gyms g
CROSS JOIN public.equipment_defaults ed
LEFT JOIN public.gym_equipment_overrides geo
  ON geo.gym_id=g.id AND geo.equipment_slug=ed.slug
GROUP BY g.id;

-- 4) Poster proof freshness (max photo per gym)
CREATE OR REPLACE VIEW public.v_gym_poster_freshness AS
SELECT
  g.id as gym_id,
  MAX(agv.visited_at) FILTER (WHERE agv.photo_url IS NOT NULL) as last_poster_proof_at
FROM public.gyms g
LEFT JOIN public.ambassador_gym_visits agv ON agv.gym_id=g.id
GROUP BY g.id;

-- 5) Ambassador performance summary
CREATE OR REPLACE VIEW public.v_ambassador_summary AS
SELECT
  ap.id as ambassador_id,
  ap.user_id,
  COUNT(DISTINCT agd.gym_id) FILTER (WHERE agd.status='verified') as verified_deals_total,
  COUNT(*) FILTER (WHERE agv.visited_at >= date_trunc('month', now())) as visits_mtd,
  MAX(agv.visited_at) as last_visit_at
FROM public.ambassador_profiles ap
LEFT JOIN public.ambassador_gym_deals agd ON agd.ambassador_id=ap.id
LEFT JOIN public.ambassador_gym_visits agv ON agv.ambassador_id=ap.id
GROUP BY ap.id, ap.user_id;

-- 6) Commission summary (month and last month)
CREATE OR REPLACE VIEW public.v_ambassador_commission_summary AS
WITH cur AS (
  SELECT a.ambassador_id, SUM(commission_due) as commission_mtd
  FROM public.ambassador_commission_accruals a
  WHERE (date_trunc('month', make_date(a.year, a.month, 1)) = date_trunc('month', now()))
  GROUP BY ambassador_id
),
prev AS (
  SELECT a.ambassador_id, SUM(commission_due) as commission_prev
  FROM public.ambassador_commission_accruals a
  WHERE (date_trunc('month', make_date(a.year, a.month, 1)) = date_trunc('month', now() - interval '1 month'))
  GROUP BY ambassador_id
)
SELECT
  COALESCE(cur.ambassador_id, prev.ambassador_id) as ambassador_id,
  COALESCE(cur.commission_mtd, 0) as commission_mtd,
  COALESCE(prev.commission_prev, 0) as commission_last_month
FROM cur
FULL JOIN prev ON prev.ambassador_id = cur.ambassador_id;

-- 7) Gyms needing poster check
CREATE OR REPLACE VIEW public.v_gyms_needing_poster_check AS
SELECT
  g.id as gym_id,
  g.name,
  COALESCE(pf.last_poster_proof_at, '1900-01-01'::timestamptz) as last_poster_proof_at,
  now() - COALESCE(pf.last_poster_proof_at, '1900-01-01') as age
FROM public.gyms g
LEFT JOIN public.v_gym_poster_freshness pf ON pf.gym_id=g.id
WHERE COALESCE(pf.last_poster_proof_at, '1900-01-01') < now() - interval '60 days';

-- 8) Revenue attribution table (placeholder)
CREATE TABLE IF NOT EXISTS public.gym_monthly_revenue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id),
  year int NOT NULL,
  month int NOT NULL CHECK (month BETWEEN 1 AND 12),
  gross_revenue numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (gym_id, year, month)
);

-- Enable RLS on revenue table
ALTER TABLE public.gym_monthly_revenue ENABLE ROW LEVEL SECURITY;

-- RLS policies for revenue table
CREATE POLICY "gmr_read" ON public.gym_monthly_revenue
FOR SELECT USING (is_superadmin_simple() OR is_gym_admin(gym_id));

CREATE POLICY "gmr_block_write" ON public.gym_monthly_revenue
FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- 9) Commission accruals calculation function
CREATE OR REPLACE FUNCTION public.run_commission_accruals(p_year int, p_month int)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
DECLARE 
  r record; 
  agr record; 
  base_month date := make_date(p_year, p_month, 1);
  gross numeric; 
  due numeric;
BEGIN
  FOR r IN SELECT * FROM public.gym_monthly_revenue WHERE year=p_year AND month=p_month LOOP
    -- for every agreement active in this month
    FOR agr IN
      SELECT *
      FROM public.ambassador_commission_agreements a
      WHERE a.gym_id = r.gym_id
        AND a.starts_at <= (base_month + interval '1 month' - interval '1 day')
        AND (a.ends_at IS NULL OR a.ends_at >= base_month)
    LOOP
      gross := r.gross_revenue;
      due := round(gross * (agr.percent/100.0), 2);

      INSERT INTO public.ambassador_commission_accruals(agreement_id, year, month, gross_revenue, commission_due)
      VALUES (agr.id, p_year, p_month, gross, due)
      ON CONFLICT (agreement_id, year, month) DO UPDATE
      SET gross_revenue = EXCLUDED.gross_revenue,
          commission_due = EXCLUDED.commission_due,
          computed_at = now();
    END LOOP;
  END LOOP;
END$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.run_commission_accruals(int,int) TO authenticated;