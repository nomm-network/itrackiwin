-- EXERCISES TABLE SCHEMA
CREATE TABLE public.exercises (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    slug text,
    display_name text,
    custom_display_name text,
    owner_user_id uuid,
    image_url text,
    equipment_id uuid,
    primary_muscle_id uuid,
    body_part_id uuid,
    movement_pattern text,
    loading_hint text,
    is_unilateral boolean DEFAULT false,
    allows_grips boolean,
    load_type load_type DEFAULT 'single_load'::load_type,
    effort_mode text DEFAULT 'reps'::text, -- 'reps', 'time', 'distance', 'calories'
    load_mode text DEFAULT 'free_weight'::text, -- 'bodyweight_plus_optional', 'external_added', 'external_assist', 'machine_level', 'free_weight', 'none', 'band_level'
    attribute_values_json jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT exercises_pkey PRIMARY KEY (id),
    CONSTRAINT exercises_equipment_id_fkey FOREIGN KEY (equipment_id) REFERENCES public.equipment(id),
    CONSTRAINT exercises_primary_muscle_id_fkey FOREIGN KEY (primary_muscle_id) REFERENCES public.muscles(id),
    CONSTRAINT exercises_body_part_id_fkey FOREIGN KEY (body_part_id) REFERENCES public.body_parts(id)
);

-- RLS POLICIES
-- Everyone can read exercises, users can manage their own
CREATE POLICY "Everyone can read exercises" ON public.exercises
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own exercises" ON public.exercises
    FOR ALL USING (auth.uid() = owner_user_id)
    WITH CHECK (auth.uid() = owner_user_id);

-- INDEXES
CREATE INDEX idx_exercises_slug ON public.exercises(slug);
CREATE INDEX idx_exercises_equipment_id ON public.exercises(equipment_id);
CREATE INDEX idx_exercises_primary_muscle_id ON public.exercises(primary_muscle_id);
CREATE INDEX idx_exercises_effort_mode ON public.exercises(effort_mode);
CREATE INDEX idx_exercises_load_mode ON public.exercises(load_mode);