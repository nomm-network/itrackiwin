-- Requests to become gym owner/admin/staff
CREATE TABLE IF NOT EXISTS public.gym_role_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','admin','staff')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  message text,
  decided_by uuid REFERENCES auth.users(id),
  decided_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (gym_id, user_id, role)  -- one open req per role
);

ALTER TABLE public.gym_role_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY grr_read ON public.gym_role_requests
  FOR SELECT USING (
    user_id = auth.uid()
    OR public.is_superadmin_simple()
    OR public.is_gym_admin(gym_id)
  );

CREATE POLICY grr_insert_self ON public.gym_role_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- updates only via RPC
CREATE POLICY grr_block_update ON public.gym_role_requests
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

-- RPC: request a role
CREATE OR REPLACE FUNCTION public.request_gym_role(p_gym uuid, p_role text, p_msg text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE rid uuid := gen_random_uuid();
BEGIN
  IF p_role NOT IN ('owner','admin','staff') THEN 
    RAISE EXCEPTION 'Invalid role'; 
  END IF;
  
  INSERT INTO public.gym_role_requests(id, gym_id, user_id, role, message)
  VALUES (rid, p_gym, auth.uid(), p_role, p_msg)
  ON CONFLICT (gym_id, user_id, role) DO UPDATE SET 
    status='pending', 
    message=EXCLUDED.message, 
    decided_by=NULL, 
    decided_at=NULL;
    
  RETURN rid;
END$$;

GRANT EXECUTE ON FUNCTION public.request_gym_role(uuid,text,text) TO authenticated;

-- RPC: decide a role request (superadmin or current gym owner/admin)
CREATE OR REPLACE FUNCTION public.decide_gym_role_request(p_req uuid, p_action text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE 
  gid uuid; 
  uid uuid; 
  rrole text;
BEGIN
  IF p_action NOT IN ('approve','reject') THEN 
    RAISE EXCEPTION 'Invalid action'; 
  END IF;
  
  SELECT gym_id, user_id, role INTO gid, uid, rrole 
  FROM public.gym_role_requests 
  WHERE id=p_req;
  
  IF NOT FOUND THEN 
    RAISE EXCEPTION 'Request not found'; 
  END IF;

  IF NOT (public.is_superadmin_simple() OR public.is_gym_admin(gid)) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.gym_role_requests
    SET status = CASE WHEN p_action='approve' THEN 'approved' ELSE 'rejected' END,
        decided_by = auth.uid(), 
        decided_at = now()
  WHERE id = p_req;

  IF p_action='approve' THEN
    INSERT INTO public.gym_admins(gym_id, user_id, role)
    VALUES (gid, uid, rrole)
    ON CONFLICT (gym_id, user_id) DO UPDATE SET role = EXCLUDED.role;
  END IF;
END$$;

GRANT EXECUTE ON FUNCTION public.decide_gym_role_request(uuid,text) TO authenticated;