-- Step 3: Coach-Gym Workflow + QR Onboarding + City Directory

-- 1) Coach ↔ Client links (optionally scoped to a gym)
CREATE TABLE IF NOT EXISTS public.coach_client_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL, -- training location (optional)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','ended','rejected')),
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (coach_user_id, client_user_id, COALESCE(gym_id, '00000000-0000-0000-0000-000000000000'::uuid))
);

-- 2) Gym membership (client belongs to a gym)
CREATE TABLE IF NOT EXISTS public.user_gym_memberships (
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','pending')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (gym_id, user_id)
);

-- 3) Join codes / QR invites (coach/client/gym staff)
CREATE TABLE IF NOT EXISTS public.join_codes (
  code TEXT PRIMARY KEY,                     -- short slug you print in QR
  kind TEXT NOT NULL CHECK (kind IN ('gym_member','coach_to_gym','client_to_coach')),
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  coach_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  max_uses INT NOT NULL DEFAULT 100,
  uses INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT join_codes_scope CHECK (
    (kind='gym_member' AND gym_id IS NOT NULL AND coach_user_id IS NULL) OR
    (kind='coach_to_gym' AND gym_id IS NOT NULL AND coach_user_id IS NULL) OR
    (kind='client_to_coach' AND coach_user_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.coach_client_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gym_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- coach_client_links: read if you are coach or client; gym admins can see links for their gym
CREATE POLICY ccl_read ON public.coach_client_links
FOR SELECT USING (
  coach_user_id = auth.uid()
  OR client_user_id = auth.uid()
  OR (gym_id IS NOT NULL AND public.is_gym_admin(gym_id))
);

-- insert via RPC only (block direct)
CREATE POLICY ccl_block_write ON public.coach_client_links
FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- user_gym_memberships: read your own or gym admin
CREATE POLICY ugm_read ON public.user_gym_memberships
FOR SELECT USING (user_id = auth.uid() OR public.is_gym_admin(gym_id));

CREATE POLICY ugm_insert_self ON public.user_gym_memberships
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY ugm_update_admin ON public.user_gym_memberships
FOR UPDATE USING (public.is_gym_admin(gym_id)) WITH CHECK (public.is_gym_admin(gym_id));

-- join_codes: read for gym admins (their gym) and creators; inserts via RPC
CREATE POLICY jc_read ON public.join_codes
FOR SELECT USING (
  created_by = auth.uid() OR
  (gym_id IS NOT NULL AND public.is_gym_admin(gym_id))
);

CREATE POLICY jc_block_write ON public.join_codes
FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- Core RPC Functions

-- 1) Create join code (for posters/QR)
CREATE OR REPLACE FUNCTION public.create_join_code(
  p_kind TEXT,
  p_gym UUID DEFAULT NULL,
  p_coach UUID DEFAULT NULL,
  p_max_uses INT DEFAULT 100,
  p_ttl_hours INT DEFAULT 2160  -- 90 days
) 
RETURNS TEXT
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public AS $$
DECLARE 
  v_code TEXT := encode(gen_random_bytes(4),'hex'); -- 8-char
BEGIN
  IF p_kind NOT IN ('gym_member','coach_to_gym','client_to_coach') THEN
    RAISE EXCEPTION 'Invalid kind';
  END IF;

  IF p_kind IN ('gym_member','coach_to_gym') AND (p_gym IS NULL OR NOT public.is_gym_admin(p_gym)) THEN
    RAISE EXCEPTION 'Only gym admins can create gym codes';
  END IF;

  INSERT INTO public.join_codes(code, kind, gym_id, coach_user_id, created_by, max_uses, expires_at)
  VALUES (v_code, p_kind, p_gym, p_coach, auth.uid(), COALESCE(p_max_uses,100), now() + make_interval(hours => p_ttl_hours));

  RETURN v_code;
END$$;

GRANT EXECUTE ON FUNCTION public.create_join_code(TEXT, UUID, UUID, INT, INT) TO authenticated;

-- 2) Redeem join code (single endpoint → does the right thing)
CREATE OR REPLACE FUNCTION public.redeem_join_code(p_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public AS $$
DECLARE 
  r RECORD;
BEGIN
  SELECT * INTO r FROM public.join_codes WHERE code = p_code;
  IF NOT FOUND THEN 
    RAISE EXCEPTION 'Invalid code'; 
  END IF;
  
  IF r.expires_at IS NOT NULL AND r.expires_at < now() THEN 
    RAISE EXCEPTION 'Code expired'; 
  END IF;
  
  IF r.uses >= r.max_uses THEN 
    RAISE EXCEPTION 'Code limit reached'; 
  END IF;

  IF r.kind = 'gym_member' THEN
    INSERT INTO public.user_gym_memberships(gym_id, user_id)
    VALUES (r.gym_id, auth.uid())
    ON CONFLICT (gym_id, user_id) DO UPDATE SET status='active', joined_at=EXCLUDED.joined_at;

  ELSIF r.kind = 'coach_to_gym' THEN
    -- leverage request flow from Step 1 if you prefer; otherwise auto-pending
    INSERT INTO public.gym_coach_memberships(gym_id, mentor_id, status, requested_by)
    SELECT r.gym_id, mp.id, 'pending', auth.uid()
    FROM public.mentors mp
    WHERE mp.user_id = auth.uid()
    ON CONFLICT DO NOTHING;

  ELSIF r.kind = 'client_to_coach' THEN
    INSERT INTO public.coach_client_links(coach_user_id, client_user_id, status, requested_by)
    VALUES (r.coach_user_id, auth.uid(), 'pending', auth.uid())
    ON CONFLICT DO NOTHING;
  END IF;

  UPDATE public.join_codes SET uses = uses + 1 WHERE code = p_code;
  RETURN r.kind;
END$$;

GRANT EXECUTE ON FUNCTION public.redeem_join_code(TEXT) TO authenticated;

-- 3) Coach–Client: accept/decline/end
CREATE OR REPLACE FUNCTION public.decide_coach_client_link(p_link UUID, p_action TEXT, p_gym UUID DEFAULT NULL)
RETURNS VOID
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public AS $$
DECLARE 
  C RECORD;
BEGIN
  IF p_action NOT IN ('accept','reject','end') THEN 
    RAISE EXCEPTION 'Invalid action'; 
  END IF;
  
  SELECT * INTO C FROM public.coach_client_links WHERE id = p_link;
  IF NOT FOUND THEN 
    RAISE EXCEPTION 'Link not found'; 
  END IF;

  -- Only coach can accept/reject/end (or client ends)
  IF NOT (C.coach_user_id = auth.uid() OR (p_action='end' AND C.client_user_id = auth.uid())) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.coach_client_links
  SET status = CASE p_action
                 WHEN 'accept' THEN 'active'
                 WHEN 'reject' THEN 'rejected'
                 WHEN 'end' THEN 'ended'
               END,
      gym_id = CASE WHEN p_action='accept' THEN COALESCE(p_gym, C.gym_id) ELSE C.gym_id END,
      decided_by = auth.uid(),
      decided_at = now()
  WHERE id = p_link;
END$$;

GRANT EXECUTE ON FUNCTION public.decide_coach_client_link(UUID, TEXT, UUID) TO authenticated;

-- Views for Directory & Coach Ops
CREATE OR REPLACE VIEW public.v_city_gyms_with_stats AS
SELECT
  g.id AS gym_id,
  g.name,
  g.city,
  g.country,
  g.photo_url,
  COUNT(DISTINCT ugm.user_id) AS members_count,
  COUNT(DISTINCT gcm.mentor_id) FILTER (WHERE gcm.status='approved') AS active_coaches
FROM public.gyms g
LEFT JOIN public.user_gym_memberships ugm ON ugm.gym_id = g.id AND ugm.status='active'
LEFT JOIN public.gym_coach_memberships gcm ON gcm.gym_id = g.id
GROUP BY g.id;

CREATE OR REPLACE VIEW public.v_coach_clients AS
SELECT
  ccl.id,
  ccl.coach_user_id,
  ccl.client_user_id,
  ccl.gym_id,
  ccl.status,
  ccl.created_at,
  g.name AS gym_name
FROM public.coach_client_links ccl
LEFT JOIN public.gyms g ON g.id = ccl.gym_id;