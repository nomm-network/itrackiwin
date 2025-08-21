-- Enable PostGIS extension for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Reference gyms table
CREATE TABLE public.gyms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT CHECK (provider IN ('google','foursquare','osm','manual')) NOT NULL,
  provider_place_id TEXT, -- e.g., Google place_id
  location GEOGRAPHY(POINT, 4326) NOT NULL, -- lat/lng
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  website TEXT,
  tz TEXT, -- optional: timezone
  equipment_profile JSONB DEFAULT '{}'::jsonb, -- dumbbells/plates/machines profile
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_place_id)
);

-- Optional alternate names / duplicates collapsing
CREATE TABLE public.gym_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  alias TEXT NOT NULL
);

-- User's relationship with a gym (membership / default)
CREATE TABLE public.user_gym_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  is_default BOOLEAN NOT NULL DEFAULT false,
  membership_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, gym_id)
);

-- Lightweight visit log to improve confidence / heuristics
CREATE TABLE public.user_gym_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT CHECK (source IN ('gps','manual','beacon')) NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  confidence NUMERIC CHECK (confidence BETWEEN 0 AND 1) NOT NULL DEFAULT 0.0
);

-- Useful indexes
CREATE INDEX gyms_location_gix ON public.gyms USING GIST (location);
CREATE INDEX gyms_name_trgm ON public.gyms USING GIN (name gin_trgm_ops);
CREATE INDEX user_gym_visits_user_time ON public.user_gym_visits(user_id, detected_at DESC);
CREATE INDEX user_gym_memberships_user ON public.user_gym_memberships(user_id);

-- Helper: find nearby gyms (meters)
CREATE OR REPLACE FUNCTION public.nearest_gyms(_lat DOUBLE PRECISION, _lng DOUBLE PRECISION, _radius_m INTEGER DEFAULT 1200)
RETURNS TABLE (
  gym_id UUID,
  name TEXT,
  distance_m DOUBLE PRECISION,
  address TEXT,
  confidence NUMERIC
) LANGUAGE sql STABLE AS $$
  SELECT
    g.id,
    g.name,
    ST_Distance(g.location, ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography) as distance_m,
    g.address,
    -- naive confidence from distance (tweak later)
    GREATEST(0, 1 - (ST_Distance(g.location, ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography) / _radius_m))::numeric as confidence
  FROM public.gyms g
  WHERE ST_DWithin(g.location, ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography, _radius_m)
  ORDER BY distance_m ASC
  LIMIT 10;
$$;

-- Enable RLS on all tables
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gym_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gym_visits ENABLE ROW LEVEL SECURITY;

-- RLS policies for gyms (public read, admin manage)
CREATE POLICY "Gyms are viewable by everyone" 
ON public.gyms FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage gyms" 
ON public.gyms FOR ALL 
USING (is_admin(auth.uid()));

-- RLS policies for gym_aliases
CREATE POLICY "Gym aliases are viewable by everyone" 
ON public.gym_aliases FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage gym aliases" 
ON public.gym_aliases FOR ALL 
USING (is_admin(auth.uid()));

-- RLS policies for user_gym_memberships
CREATE POLICY "Users can view their own gym memberships" 
ON public.user_gym_memberships FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own gym memberships" 
ON public.user_gym_memberships FOR ALL 
USING (auth.uid() = user_id);

-- RLS policies for user_gym_visits
CREATE POLICY "Users can view their own gym visits" 
ON public.user_gym_visits FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own gym visits" 
ON public.user_gym_visits FOR ALL 
USING (auth.uid() = user_id);

-- Utility function: promote the most frequent gym as default
CREATE OR REPLACE FUNCTION public.promote_frequent_gym(_user_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  top_gym UUID;
BEGIN
  SELECT gym_id
  INTO top_gym
  FROM public.user_gym_visits
  WHERE user_id = _user_id AND gym_id IS NOT NULL
  GROUP BY gym_id
  ORDER BY count(*) DESC
  LIMIT 1;

  IF top_gym IS NOT NULL THEN
    UPDATE public.user_gym_memberships
    SET is_default = (gym_id = top_gym)
    WHERE user_id = _user_id;
  END IF;
END;
$$;