-- Migration to standardize handle_equipment table naming and ensure compatibility tables exist

BEGIN;

-- 1) Ensure target table exists (create if neither table existed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='handle_equipment'
  ) THEN
    CREATE TABLE public.handle_equipment (
      handle_id   uuid NOT NULL,
      equipment_id uuid NOT NULL,
      is_default  boolean NOT NULL DEFAULT false,
      created_at  timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT handle_equipment_pk PRIMARY KEY (handle_id, equipment_id),
      CONSTRAINT handle_equipment_handle_fk FOREIGN KEY (handle_id) REFERENCES public.handles(id) ON DELETE CASCADE,
      CONSTRAINT handle_equipment_equipment_fk FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE
    );
  END IF;
END$$;

-- 2) If an old misnamed table exists and the correct one did not previously,
-- try a straight rename (fast path). If both exist, we'll do a merge instead.
DO $$
DECLARE
  has_equipment_handle boolean;
  has_handle_equipment boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='equipment_handle'
  ) INTO has_equipment_handle;

  SELECT EXISTS(
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema='public' AND table_name='handle_equipment'
  ) INTO has_handle_equipment;

  IF has_equipment_handle AND NOT has_handle_equipment THEN
    -- No correct table existed; just rename the bad one.
    EXECUTE 'ALTER TABLE public.equipment_handle RENAME TO handle_equipment';
  END IF;
END$$;

-- 3) If BOTH exist, merge data from equipment_handle -> handle_equipment (dedupe by PK), then drop old.
DO $$
DECLARE
  both_exist boolean;
BEGIN
  SELECT (
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='equipment_handle')
    AND
    EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='handle_equipment')
  ) INTO both_exist;

  IF both_exist THEN
    -- Try to insert any missing rows from the old table into the new one.
    EXECUTE $SQL$
      INSERT INTO public.handle_equipment (handle_id, equipment_id, is_default, created_at)
      SELECT 
        eh.handle_id,
        eh.equipment_id,
        COALESCE(eh.is_default, false) AS is_default,
        COALESCE(eh.created_at, now()) AS created_at
      FROM public.equipment_handle eh
      ON CONFLICT (handle_id, equipment_id) DO NOTHING
    $SQL$;

    -- Drop the misnamed table after merge
    EXECUTE 'DROP TABLE public.equipment_handle';
  END IF;
END$$;

-- 4) Final sanity: ensure primary key & FKs exist on handle_equipment (idempotent).
DO $$
BEGIN
  -- PK
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.handle_equipment'::regclass 
      AND contype = 'p'
  ) THEN
    ALTER TABLE public.handle_equipment
      ADD CONSTRAINT handle_equipment_pk PRIMARY KEY (handle_id, equipment_id);
  END IF;

  -- FK to handles
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.handle_equipment'::regclass 
      AND conname = 'handle_equipment_handle_fk'
  ) THEN
    ALTER TABLE public.handle_equipment
      ADD CONSTRAINT handle_equipment_handle_fk
      FOREIGN KEY (handle_id) REFERENCES public.handles(id) ON DELETE CASCADE;
  END IF;

  -- FK to equipment
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'public.handle_equipment'::regclass 
      AND conname = 'handle_equipment_equipment_fk'
  ) THEN
    ALTER TABLE public.handle_equipment
      ADD CONSTRAINT handle_equipment_equipment_fk
      FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE;
  END IF;
END$$;

-- 5) Ensure handle_grip_compatibility table exists with proper structure
CREATE TABLE IF NOT EXISTS public.handle_grip_compatibility (
  handle_id uuid NOT NULL,
  grip_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT handle_grip_compatibility_pk PRIMARY KEY (handle_id, grip_id),
  CONSTRAINT handle_grip_compatibility_handle_fk FOREIGN KEY (handle_id) REFERENCES public.handles(id) ON DELETE CASCADE,
  CONSTRAINT handle_grip_compatibility_grip_fk FOREIGN KEY (grip_id) REFERENCES public.grips(id) ON DELETE CASCADE
);

-- 6) Ensure equipment_handle_grips table exists (for three-way mapping)
CREATE TABLE IF NOT EXISTS public.equipment_handle_grips (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL,
  handle_id uuid NOT NULL,
  grip_id uuid NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT equipment_handle_grips_pk PRIMARY KEY (id),
  CONSTRAINT equipment_handle_grips_unique UNIQUE (equipment_id, handle_id, grip_id),
  CONSTRAINT equipment_handle_grips_equipment_fk FOREIGN KEY (equipment_id) REFERENCES public.equipment(id) ON DELETE CASCADE,
  CONSTRAINT equipment_handle_grips_handle_fk FOREIGN KEY (handle_id) REFERENCES public.handles(id) ON DELETE CASCADE,
  CONSTRAINT equipment_handle_grips_grip_fk FOREIGN KEY (grip_id) REFERENCES public.grips(id) ON DELETE CASCADE
);

-- 7) Add RLS policies for the compatibility tables
ALTER TABLE public.handle_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handle_grip_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_handle_grips ENABLE ROW LEVEL SECURITY;

-- Select policies (public read)
CREATE POLICY IF NOT EXISTS "handle_equipment_select_all" ON public.handle_equipment FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "handle_grip_compatibility_select_all" ON public.handle_grip_compatibility FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "equipment_handle_grips_select_all" ON public.equipment_handle_grips FOR SELECT USING (true);

-- Admin management policies
CREATE POLICY IF NOT EXISTS "handle_equipment_admin_manage" ON public.handle_equipment FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY IF NOT EXISTS "handle_grip_compatibility_admin_manage" ON public.handle_grip_compatibility FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));
CREATE POLICY IF NOT EXISTS "equipment_handle_grips_admin_manage" ON public.equipment_handle_grips FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

COMMIT;