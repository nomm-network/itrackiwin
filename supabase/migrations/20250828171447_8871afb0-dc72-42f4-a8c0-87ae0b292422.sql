-- Create enum for attribute scope
CREATE TYPE public.attr_scope AS ENUM ('global', 'movement', 'equipment');

-- Create movements table
CREATE TABLE public.movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipments table (separate from existing equipment table for this system)
CREATE TABLE public.equipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create attribute schemas table
CREATE TABLE public.attribute_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope attr_scope NOT NULL,
  scope_ref_id UUID NULL,
  title TEXT NOT NULL,
  schema_json JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.attribute_schemas 
ADD CONSTRAINT fk_movement_scope 
CHECK (
  (scope = 'movement' AND scope_ref_id IS NOT NULL) OR
  (scope = 'equipment' AND scope_ref_id IS NOT NULL) OR
  (scope = 'global' AND scope_ref_id IS NULL)
);

-- Add attribute_values_json to exercises table
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS attribute_values_json JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add movement_id and equipment_ref_id for this new system
ALTER TABLE public.exercises 
ADD COLUMN IF NOT EXISTS movement_id UUID REFERENCES public.movements(id),
ADD COLUMN IF NOT EXISTS equipment_ref_id UUID REFERENCES public.equipments(id);

-- Create indexes
CREATE INDEX idx_attribute_schemas_scope_ref ON public.attribute_schemas (scope, scope_ref_id) WHERE is_active;
CREATE INDEX idx_attribute_schemas_schema_json ON public.attribute_schemas USING gin (schema_json);
CREATE INDEX idx_exercises_attribute_values ON public.exercises USING gin (attribute_values_json);

-- Create function to get effective attribute schema
CREATE OR REPLACE FUNCTION public.get_effective_attribute_schema(p_movement_id UUID, p_equipment_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  s_global JSONB := COALESCE((
    SELECT schema_json
    FROM public.attribute_schemas
    WHERE scope = 'global' AND is_active = true
    ORDER BY updated_at DESC
    LIMIT 1
  ), '{"groups":[]}'::jsonb);

  s_movement JSONB := COALESCE((
    SELECT schema_json
    FROM public.attribute_schemas
    WHERE scope = 'movement' AND scope_ref_id = p_movement_id AND is_active = true
    ORDER BY updated_at DESC
    LIMIT 1
  ), '{"groups":[]}'::jsonb);

  s_equipment JSONB := COALESCE((
    SELECT schema_json
    FROM public.attribute_schemas
    WHERE scope = 'equipment' AND scope_ref_id = p_equipment_id AND is_active = true
    ORDER BY updated_at DESC
    LIMIT 1
  ), '{"groups":[]}'::jsonb);

  result JSONB;
BEGIN
  -- Merge schemas: global + equipment + movement (movement overrides equipment overrides global)
  result := jsonb_build_object('groups',
    COALESCE(s_global->'groups', '[]'::jsonb) ||
    COALESCE(s_equipment->'groups', '[]'::jsonb) ||
    COALESCE(s_movement->'groups', '[]'::jsonb)
  );

  RETURN result;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attribute_schemas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public read access to movements" 
ON public.movements FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage movements" 
ON public.movements FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Public read access to equipments" 
ON public.equipments FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage equipments" 
ON public.equipments FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Authenticated users can read attribute schemas" 
ON public.attribute_schemas FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage attribute schemas" 
ON public.attribute_schemas FOR ALL 
USING (is_admin(auth.uid()));

-- Insert seed data
INSERT INTO public.movements (name) VALUES 
('Press'), 
('Row'), 
('Squat'), 
('Pull'), 
('Hinge');

INSERT INTO public.equipments (name) VALUES 
('Barbell'), 
('Dumbbell'), 
('Cable'), 
('Machine'), 
('Bodyweight');

-- Add sample attribute schemas
INSERT INTO public.attribute_schemas (scope, scope_ref_id, title, schema_json)
SELECT 
  'movement'::attr_scope, 
  m.id, 
  'Press: Body/Bench', 
  '{
    "groups": [
      {
        "key": "body_bench",
        "label": "Body/Bench",
        "attributes": [
          {
            "key": "angle",
            "label": "Angle",
            "type": "enum",
            "values": [
              {"key": "decline", "label": "Decline"},
              {"key": "horizontal", "label": "Horizontal"},
              {"key": "incline", "label": "Incline"}
            ],
            "default": "horizontal"
          },
          {
            "key": "angle_degrees",
            "label": "Angle (°)",
            "type": "number",
            "min": -20,
            "max": 60,
            "step": 5,
            "nullable": true,
            "visible_if": {"angle": ["decline", "incline"]}
          }
        ]
      }
    ]
  }'::jsonb
FROM public.movements m WHERE m.name = 'Press';

INSERT INTO public.attribute_schemas (scope, scope_ref_id, title, schema_json)
SELECT 
  'equipment'::attr_scope, 
  e.id, 
  'Cable: Handles & Grips', 
  '{
    "groups": [
      {
        "key": "hands",
        "label": "Hands",
        "attributes": [
          {
            "key": "handle",
            "label": "Handle",
            "type": "enum",
            "values": [
              {"key": "rope", "label": "Rope"},
              {"key": "straight_bar", "label": "Straight Bar"},
              {"key": "d_handles", "label": "D-Handles"}
            ]
          },
          {
            "key": "grip_type",
            "label": "Grip",
            "type": "enum",
            "values": [
              {"key": "pronated", "label": "Pronated"},
              {"key": "supinated", "label": "Supinated"},
              {"key": "neutral", "label": "Neutral"}
            ]
          }
        ]
      }
    ]
  }'::jsonb
FROM public.equipments e WHERE e.name = 'Cable';