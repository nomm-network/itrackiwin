-- WORKOUT-RELATED ENUM TYPES

-- Load Type Enum
CREATE TYPE public.load_type AS ENUM (
    'single_load',
    'dual_load', 
    'stack',
    'none'
);

-- Weight Unit Enum
CREATE TYPE public.weight_unit AS ENUM (
    'kg',
    'lbs'
);

-- Subscription Status Enum
CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'paused', 
    'cancelled',
    'expired'
);

-- Coach Type Enum
CREATE TYPE public.coach_type AS ENUM (
    'ai',
    'human'
);

-- Load Medium Enum
CREATE TYPE public.load_medium AS ENUM (
    'weight_plates',
    'weight_stack', 
    'bodyweight',
    'resistance_bands',
    'other'
);

-- Handle Orientation Enum
CREATE TYPE public.handle_orientation AS ENUM (
    'parallel',
    'perpendicular',
    'angled'
);

-- App Role Enum
CREATE TYPE public.app_role AS ENUM (
    'admin',
    'superadmin'
);

-- Attribute Scope Enum  
CREATE TYPE public.attribute_scope AS ENUM (
    'exercise',
    'equipment',
    'muscle',
    'body_part'
);