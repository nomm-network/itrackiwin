-- WORKOUT_EXERCISES TABLE SCHEMA
CREATE TABLE public.workout_exercises (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    workout_id uuid NOT NULL,
    exercise_id uuid NOT NULL,
    order_index integer DEFAULT 1,
    notes text,
    target_sets integer DEFAULT 3,
    target_reps_min integer,
    target_reps_max integer,
    target_weight_kg numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT workout_exercises_pkey PRIMARY KEY (id),
    CONSTRAINT workout_exercises_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE,
    CONSTRAINT workout_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);

-- RLS POLICIES
-- Users can manage workout exercises for their own workouts
CREATE POLICY "Users can manage workout exercises for their own workouts" ON public.workout_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workouts w 
            WHERE w.id = workout_exercises.workout_id 
            AND w.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.workouts w 
            WHERE w.id = workout_exercises.workout_id 
            AND w.user_id = auth.uid()
        )
    );

-- INDEXES
CREATE INDEX idx_workout_exercises_workout_id ON public.workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise_id ON public.workout_exercises(exercise_id);
CREATE INDEX idx_workout_exercises_order_index ON public.workout_exercises(order_index);