-- Step 2: Ambassador Program Scaffolding

-- 0) Cities/regions (for battles)
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country TEXT NOT NULL,
  region TEXT,              -- state/județ/district
  city TEXT NOT NULL,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1) Ambassador profile (tied to user)
CREATE TABLE IF NOT EXISTS public.ambassador_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'eligible' CHECK (status IN ('eligible','invited','active','suspended','ended')),
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2) Battle campaign (e.g., "Battle of Berlin")
CREATE TABLE IF NOT EXISTS public.battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,            -- "Battle of Berlin"
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','running','ended')),
  target_win_deals INT NOT NULL DEFAULT 2,    -- winners must reach this
  max_participants INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3) Invitations & participants
CREATE TABLE IF NOT EXISTS public.battle_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  ambassador_id UUID NOT NULL REFERENCES public.ambassador_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','expired')),
  invited_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS u_bi_battle_amb ON public.battle_invitations(battle_id, ambassador_id);

CREATE TABLE IF NOT EXISTS public.battle_participants (
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  ambassador_id UUID NOT NULL REFERENCES public.ambassador_profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (battle_id, ambassador_id)
);

-- 4) Gym deals signed during battle (proof of win)
CREATE TABLE IF NOT EXISTS public.ambassador_gym_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  ambassador_id UUID NOT NULL REFERENCES public.ambassador_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification','verified','rejected')),
  contract_url TEXT,             -- uploaded proof
  signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  UNIQUE (battle_id, gym_id)     -- a gym can count once per battle
);

-- 5) Post-win observer role (no changes to gym_admins table)
CREATE TABLE IF NOT EXISTS public.gym_observers (
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'ambassador_win',  -- provenance
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (gym_id, user_id)
);

-- 6) Commission scaffolding (5-year cap; two winners 25% / 20%)
CREATE TABLE IF NOT EXISTS public.ambassador_commission_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES public.ambassador_profiles(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('winner_1','winner_2')),
  percent NUMERIC(5,2) NOT NULL CHECK (percent > 0),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ GENERATED ALWAYS AS (starts_at + INTERVAL '5 years') STORED,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (ambassador_id, gym_id, battle_id)
);

-- Monthly accruals (actual $$ logic can be added later)
CREATE TABLE IF NOT EXISTS public.ambassador_commission_accruals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.ambassador_commission_agreements(id) ON DELETE CASCADE,
  year INT NOT NULL, 
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  gross_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (agreement_id, year, month)
);

-- Optional: ambassador visit/poster proof logs for ops
CREATE TABLE IF NOT EXISTS public.ambassador_gym_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL REFERENCES public.ambassador_profiles(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  photo_url TEXT
);

-- Enable RLS
ALTER TABLE public.ambassador_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_gym_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_observers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_commission_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_commission_accruals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_gym_visits ENABLE ROW LEVEL SECURITY;

-- Helper function for superadmin check
CREATE OR REPLACE FUNCTION public.is_superadmin_simple() 
RETURNS BOOLEAN
LANGUAGE SQL 
SECURITY DEFINER 
SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role='superadmin');
$$;

-- RLS Policies

-- Profiles
CREATE POLICY ap_sel ON public.ambassador_profiles
FOR SELECT USING (true);

CREATE POLICY ap_upsert_self ON public.ambassador_profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY ap_update_self ON public.ambassador_profiles
FOR UPDATE USING (user_id = auth.uid());

-- Battles (publicly visible while running)
CREATE POLICY battles_sel ON public.battles 
FOR SELECT USING (true);

-- Invitations: participant can read their own; staff (superadmin) can see all
CREATE POLICY bi_sel ON public.battle_invitations
FOR SELECT USING (
  public.is_superadmin_simple() OR
  EXISTS (SELECT 1 FROM public.ambassador_profiles ap WHERE ap.id = ambassador_id AND ap.user_id = auth.uid())
);

-- Writes via RPC only
CREATE POLICY bi_block_write ON public.battle_invitations 
FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- Participants: read if superadmin or you are the participant
CREATE POLICY bp_sel ON public.battle_participants
FOR SELECT USING (
  public.is_superadmin_simple() OR
  EXISTS (SELECT 1 FROM public.ambassador_profiles ap WHERE ap.id = ambassador_id AND ap.user_id = auth.uid())
);

CREATE POLICY bp_block_write ON public.battle_participants 
FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- Deals: read if superadmin, the ambassador, or admin of the gym
CREATE POLICY deals_sel ON public.ambassador_gym_deals
FOR SELECT USING (
  public.is_superadmin_simple() OR
  EXISTS (SELECT 1 FROM public.ambassador_profiles ap WHERE ap.id = ambassador_id AND ap.user_id = auth.uid()) OR
  public.is_gym_admin(gym_id)
);

CREATE POLICY deals_block_write ON public.ambassador_gym_deals 
FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- Gym observers: read if gym admin or you are the observer
CREATE POLICY obs_sel ON public.gym_observers
FOR SELECT USING (public.is_gym_admin(gym_id) OR user_id = auth.uid());

-- Commission agreements/accruals (read: superadmin or ambassador owner)
CREATE POLICY agr_sel ON public.ambassador_commission_agreements
FOR SELECT USING (
  public.is_superadmin_simple() OR
  EXISTS(SELECT 1 FROM public.ambassador_profiles ap WHERE ap.id = ambassador_id AND ap.user_id = auth.uid())
);

CREATE POLICY accr_sel ON public.ambassador_commission_accruals
FOR SELECT USING (
  public.is_superadmin_simple() OR
  EXISTS(
    SELECT 1 FROM public.ambassador_commission_agreements a
    WHERE a.id = agreement_id
      AND EXISTS (SELECT 1 FROM public.ambassador_profiles ap WHERE ap.id=a.ambassador_id AND ap.user_id=auth.uid())
  )
);

-- Visits: read your own or gym admin
CREATE POLICY visit_sel ON public.ambassador_gym_visits
FOR SELECT USING (
  public.is_superadmin_simple() OR
  EXISTS (SELECT 1 FROM public.ambassador_profiles ap WHERE ap.id=ambassador_id AND ap.user_id=auth.uid()) OR
  public.is_gym_admin(gym_id)
);

CREATE POLICY visit_insert_self ON public.ambassador_gym_visits
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ambassador_profiles ap WHERE ap.id=ambassador_id AND ap.user_id=auth.uid())
);

-- Core RPC Functions

-- 1) Invite top users (placeholder: you pass list of user_ids)
CREATE OR REPLACE FUNCTION public.battle_invite_users(p_battle UUID, p_user_ids UUID[])
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public AS $$
DECLARE 
  u_id UUID;
  amb_id UUID;
BEGIN
  -- Create ambassador profiles if missing, then invite
  FOREACH u_id IN ARRAY p_user_ids LOOP
    -- Get or create ambassador profile
    INSERT INTO ambassador_profiles(user_id, status)
    VALUES (u_id, 'invited')
    ON CONFLICT (user_id) DO UPDATE SET status = 'invited'
    RETURNING id INTO amb_id;
    
    IF amb_id IS NULL THEN
      SELECT id INTO amb_id FROM ambassador_profiles WHERE user_id = u_id;
    END IF;

    INSERT INTO battle_invitations(battle_id, ambassador_id, status)
    VALUES (p_battle, amb_id, 'pending')
    ON CONFLICT (battle_id, ambassador_id) DO NOTHING;
  END LOOP;
END$$;

GRANT EXECUTE ON FUNCTION public.battle_invite_users(UUID, UUID[]) TO authenticated;

-- 2) Ambassador accepts/declines invitation
CREATE OR REPLACE FUNCTION public.battle_respond_invite(p_invitation UUID, p_action TEXT)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public AS $$
DECLARE 
  amb UUID; 
  bid UUID;
BEGIN
  IF p_action NOT IN ('accept','decline') THEN 
    RAISE EXCEPTION 'Invalid action'; 
  END IF;

  SELECT ambassador_id, battle_id INTO amb, bid 
  FROM battle_invitations WHERE id = p_invitation;
  
  IF NOT EXISTS(SELECT 1 FROM ambassador_profiles ap WHERE ap.id = amb AND ap.user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not your invitation';
  END IF;

  UPDATE battle_invitations
  SET status = CASE WHEN p_action = 'accept' THEN 'accepted' ELSE 'declined' END,
      responded_at = now()
  WHERE id = p_invitation;

  IF p_action = 'accept' THEN
    INSERT INTO battle_participants(battle_id, ambassador_id) 
    VALUES(bid, amb)
    ON CONFLICT DO NOTHING;
    
    UPDATE ambassador_profiles SET status = 'active' WHERE id = amb;
  END IF;
END$$;

GRANT EXECUTE ON FUNCTION public.battle_respond_invite(UUID, TEXT) TO authenticated;

-- 3) Ambassador submits a gym deal during the battle
CREATE OR REPLACE FUNCTION public.ambassador_submit_gym_deal(
  p_battle UUID, p_gym UUID, p_contract_url TEXT
) 
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public AS $$
DECLARE 
  amb UUID; 
  rid UUID := gen_random_uuid();
BEGIN
  SELECT id INTO amb FROM ambassador_profiles WHERE user_id = auth.uid();
  IF amb IS NULL THEN 
    RAISE EXCEPTION 'Not an ambassador'; 
  END IF;

  INSERT INTO ambassador_gym_deals(id, battle_id, gym_id, ambassador_id, contract_url)
  VALUES (rid, p_battle, p_gym, amb, p_contract_url);
  
  RETURN rid;
END$$;

GRANT EXECUTE ON FUNCTION public.ambassador_submit_gym_deal(UUID, UUID, TEXT) TO authenticated;

-- 4) Staff verifies a deal (marks verified/rejected)
CREATE OR REPLACE FUNCTION public.verify_gym_deal(p_deal UUID, p_status TEXT)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public AS $$
BEGIN
  IF p_status NOT IN ('verified','rejected') THEN 
    RAISE EXCEPTION 'Invalid status'; 
  END IF;
  
  IF NOT public.is_superadmin_simple() THEN 
    RAISE EXCEPTION 'Not authorized'; 
  END IF;

  UPDATE ambassador_gym_deals
  SET status = p_status, verified_by = auth.uid(), verified_at = now()
  WHERE id = p_deal;
END$$;

GRANT EXECUTE ON FUNCTION public.verify_gym_deal(UUID, TEXT) TO authenticated;

-- 5) Declare winners & create commission agreements + observer roles
CREATE OR REPLACE FUNCTION public.declare_battle_winners(p_battle UUID)
RETURNS TABLE(ambassador_id UUID, rank INT, verified_deals INT) 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public AS $$
BEGIN
  IF NOT public.is_superadmin_simple() THEN 
    RAISE EXCEPTION 'Not authorized'; 
  END IF;

  -- Compute standings by verified deals desc, earliest win tie-breaker
  RETURN QUERY
  WITH standings AS (
    SELECT agd.ambassador_id,
           COUNT(*) FILTER (WHERE status = 'verified') AS vcount,
           MIN(verified_at) AS first_verified_at
    FROM ambassador_gym_deals agd
    WHERE battle_id = p_battle
    GROUP BY agd.ambassador_id
  ), ranked AS (
    SELECT s.ambassador_id, s.vcount,
           DENSE_RANK() OVER (ORDER BY s.vcount DESC, s.first_verified_at ASC) AS rnk
    FROM standings s
  )
  SELECT r.ambassador_id, r.rnk::INT, r.vcount::INT 
  FROM ranked r 
  WHERE r.rnk <= 2;
END$$;

GRANT EXECUTE ON FUNCTION public.declare_battle_winners(UUID) TO authenticated;

-- 6) After winners known, assign commissions & observer on each verified gym they brought
CREATE OR REPLACE FUNCTION public.grant_winner_benefits(
  p_battle UUID, p_winner1 UUID, p_winner2 UUID
) 
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public AS $$
DECLARE 
  g RECORD;
BEGIN
  -- Winner1 agreements @25%
  FOR g IN
    SELECT gym_id FROM ambassador_gym_deals
    WHERE battle_id = p_battle AND ambassador_id = p_winner1 AND status = 'verified'
  LOOP
    INSERT INTO ambassador_commission_agreements(ambassador_id, gym_id, battle_id, tier, percent)
    VALUES (p_winner1, g.gym_id, p_battle, 'winner_1', 25.00)
    ON CONFLICT DO NOTHING;

    INSERT INTO gym_observers(gym_id, user_id)
    VALUES (g.gym_id, (SELECT user_id FROM ambassador_profiles WHERE id = p_winner1))
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Winner2 agreements @20%
  FOR g IN
    SELECT gym_id FROM ambassador_gym_deals
    WHERE battle_id = p_battle AND ambassador_id = p_winner2 AND status = 'verified'
  LOOP
    INSERT INTO ambassador_commission_agreements(ambassador_id, gym_id, battle_id, tier, percent)
    VALUES (p_winner2, g.gym_id, p_battle, 'winner_2', 20.00)
    ON CONFLICT DO NOTHING;

    INSERT INTO gym_observers(gym_id, user_id)
    VALUES (g.gym_id, (SELECT user_id FROM ambassador_profiles WHERE id = p_winner2))
    ON CONFLICT DO NOTHING;
  END LOOP;

  UPDATE battles SET status = 'ended' WHERE id = p_battle;
END$$;

GRANT EXECUTE ON FUNCTION public.grant_winner_benefits(UUID, UUID, UUID) TO authenticated;