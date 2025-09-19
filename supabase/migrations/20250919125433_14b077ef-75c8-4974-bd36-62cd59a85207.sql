-- 1) Create user_body_metrics table for historical weight/height tracking
CREATE TABLE IF NOT EXISTS public.user_body_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  weight_kg NUMERIC,
  height_cm NUMERIC,
  source TEXT DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_body_metrics_user_ts
  ON public.user_body_metrics (user_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_body_metrics_user_weight_ts
  ON public.user_body_metrics (user_id, recorded_at DESC)
  WHERE weight_kg IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_body_metrics_user_height_ts
  ON public.user_body_metrics (user_id, recorded_at DESC)
  WHERE height_cm IS NOT NULL;

-- 3) Enable RLS and create policies
ALTER TABLE public.user_body_metrics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can read their body metrics" ON public.user_body_metrics;
DROP POLICY IF EXISTS "Users can insert their body metrics" ON public.user_body_metrics;
DROP POLICY IF EXISTS "Users can update their body metrics" ON public.user_body_metrics;
DROP POLICY IF EXISTS "Users can delete their body metrics" ON public.user_body_metrics;

CREATE POLICY "Users can read their body metrics"
  ON public.user_body_metrics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their body metrics"
  ON public.user_body_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their body metrics"
  ON public.user_body_metrics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their body metrics"
  ON public.user_body_metrics FOR DELETE
  USING (auth.uid() = user_id);