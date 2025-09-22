-- WORKOUTS TABLE SCHEMA
CREATE TABLE public.workouts (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    template_id uuid,
    program_id uuid,
    started_at timestamp with time zone DEFAULT now(),
    ended_at timestamp with time zone,
    title text,
    notes text,
    perceived_exertion integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workouts_pkey PRIMARY KEY (id)
);

-- RLS POLICIES
-- Users can view their own workouts
CREATE POLICY "Users can manage their own workouts" ON public.workouts
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- INDEXES
CREATE INDEX idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX idx_workouts_started_at ON public.workouts(started_at);