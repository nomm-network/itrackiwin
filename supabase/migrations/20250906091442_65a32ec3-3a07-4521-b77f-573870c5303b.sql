-- Migration B: RLS and policies (separate from table creation)

-- Enable RLS on both tables
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_clients ENABLE ROW LEVEL SECURITY;

-- BASIC GRANTS (RLS will still apply)
GRANT SELECT ON public.mentors TO authenticated, anon;   -- browse directory if policies allow
GRANT SELECT ON public.mentor_clients TO authenticated;

-- POLICIES: mentors
DROP POLICY IF EXISTS mentors_public_browse ON public.mentors;
CREATE POLICY mentors_public_browse
  ON public.mentors FOR SELECT
  USING (is_public = true);

DROP POLICY IF EXISTS mentors_owner_full ON public.mentors;
CREATE POLICY mentors_owner_full
  ON public.mentors FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- POLICIES: mentor_clients
DROP POLICY IF EXISTS mentor_clients_owner ON public.mentor_clients;
CREATE POLICY mentor_clients_owner
  ON public.mentor_clients FOR ALL
  USING ( auth.uid() = client_user_id
       OR auth.uid() IN (SELECT m.user_id FROM public.mentors m WHERE m.id = mentor_id) )
  WITH CHECK ( auth.uid() = client_user_id
            OR auth.uid() IN (SELECT m.user_id FROM public.mentors m WHERE m.id = mentor_id) );