-- WORKOUT_SETS TABLE SCHEMA
CREATE TABLE public.workout_sets (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    workout_exercise_id uuid NOT NULL,
    set_index integer NOT NULL,
    set_kind text DEFAULT 'working'::text,
    weight_kg numeric,
    weight numeric, -- legacy column
    weight_unit text DEFAULT 'kg'::text,
    reps integer,
    duration_seconds integer,
    distance numeric,
    rpe integer,
    notes text,
    is_completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    load_meta jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workout_sets_pkey PRIMARY KEY (id),
    CONSTRAINT workout_sets_workout_exercise_id_fkey FOREIGN KEY (workout_exercise_id) REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
    CONSTRAINT workout_sets_rpe_check CHECK ((rpe >= 1) AND (rpe <= 10))
);

-- RLS POLICIES
-- Users can manage sets for their own workout exercises
CREATE POLICY "Users can manage sets for their own workout exercises" ON public.workout_sets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workout_exercises we
            JOIN public.workouts w ON w.id = we.workout_id
            WHERE we.id = workout_sets.workout_exercise_id 
            AND w.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workout_exercises we
            JOIN public.workouts w ON w.id = we.workout_id
            WHERE we.id = workout_sets.workout_exercise_id 
            AND w.user_id = auth.uid()
        )
    );

-- INDEXES
CREATE INDEX idx_workout_sets_workout_exercise_id ON public.workout_sets(workout_exercise_id);
CREATE INDEX idx_workout_sets_set_index ON public.workout_sets(set_index);
CREATE INDEX idx_workout_sets_completed_at ON public.workout_sets(completed_at);