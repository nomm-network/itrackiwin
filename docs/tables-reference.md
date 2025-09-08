# Tables Reference

Complete reference for all database tables with columns, types, and constraints.

## 📋 Table of Contents
1. [Achievement System](#achievement-system)
2. [Admin & Audit](#admin--audit)
3. [Ambassador System](#ambassador-system)
4. [Exercise System](#exercise-system)
5. [User System](#user-system)
6. [Workout System](#workout-system)
7. [Gym System](#gym-system)
8. [Coach System](#coach-system)
9. [Challenge System](#challenge-system)
10. [Miscellaneous](#miscellaneous)

---

## Achievement System

### `achievements`
System-wide achievement definitions.
```sql
CREATE TABLE achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  points INTEGER(32,0) NOT NULL DEFAULT 0,
  criteria JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

---

## Admin & Audit

### `admin_audit_log`
Audit trail for administrative actions.
```sql
CREATE TABLE admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  target_user_id UUID,
  performed_by UUID,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `admin_check_rate_limit`
Rate limiting for admin operations.
```sql
CREATE TABLE admin_check_rate_limit (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  check_count INTEGER(32,0) DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

---

## Ambassador System

### `ambassador_profiles`
Ambassador user profiles.
```sql
CREATE TABLE ambassador_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'eligible'::text,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### `ambassador_commission_agreements`
Commission agreements for ambassadors.
```sql
CREATE TABLE ambassador_commission_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL,
  gym_id UUID NOT NULL,
  battle_id UUID NOT NULL,
  tier TEXT NOT NULL,
  percent NUMERIC(5,2) NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### `ambassador_commission_accruals`
Monthly commission calculations.
```sql
CREATE TABLE ambassador_commission_accruals (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL,
  year INTEGER(32,0) NOT NULL,
  month INTEGER(32,0) NOT NULL,
  gross_revenue NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_due NUMERIC(12,2) NOT NULL DEFAULT 0,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### `ambassador_gym_deals`
Gym partnership deals.
```sql
CREATE TABLE ambassador_gym_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL,
  gym_id UUID NOT NULL,
  ambassador_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_verification'::text,
  contract_url TEXT,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE
);
```

### `ambassador_gym_visits`
Ambassador gym visit tracking.
```sql
CREATE TABLE ambassador_gym_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  ambassador_id UUID NOT NULL,
  gym_id UUID NOT NULL,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  photo_url TEXT
);
```

---

## Exercise System

### `exercises`
Main exercise database - comprehensive exercise definitions.
```sql
CREATE TABLE exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  display_name TEXT,
  custom_display_name TEXT,
  equipment_id UUID NOT NULL,
  equipment_ref_id UUID,
  primary_muscle_id UUID,
  secondary_muscle_group_ids UUID[],
  body_part_id UUID,
  movement_id UUID,
  movement_pattern_id UUID,
  is_public BOOLEAN NOT NULL DEFAULT true,
  owner_user_id UUID,
  popularity_rank INTEGER,
  tags TEXT[] DEFAULT '{}'::text[],
  image_url TEXT,
  thumbnail_url TEXT,
  source_url TEXT,
  loading_hint TEXT,
  configured BOOLEAN NOT NULL DEFAULT false,
  is_unilateral BOOLEAN DEFAULT false,
  allows_grips BOOLEAN DEFAULT true,
  is_bar_loaded BOOLEAN NOT NULL DEFAULT false,
  default_bar_type_id UUID,
  default_bar_weight NUMERIC,
  default_grip_ids UUID[] DEFAULT '{}'::uuid[],
  load_type load_type,
  contraindications JSONB DEFAULT '[]'::jsonb,
  complexity_score SMALLINT DEFAULT 3,
  exercise_skill_level exercise_skill_level DEFAULT 'medium'::exercise_skill_level,
  capability_schema JSONB DEFAULT '{}'::jsonb,
  attribute_values_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  name_version INTEGER DEFAULT 1,
  name_locale TEXT DEFAULT 'en'::text,
  display_name_tsv TSVECTOR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `equipment`
Exercise equipment catalog.
```sql
CREATE TABLE equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  slug TEXT,
  equipment_type TEXT NOT NULL DEFAULT 'machine'::text,
  kind TEXT,
  load_type load_type DEFAULT 'none'::load_type,
  load_medium load_medium DEFAULT 'other'::load_medium,
  weight_kg NUMERIC,
  default_bar_weight_kg NUMERIC,
  default_side_min_plate_kg NUMERIC,
  default_single_min_increment_kg NUMERIC,
  default_stack JSONB DEFAULT '[]'::jsonb,
  configured BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `muscle_groups`
Body muscle group definitions.
```sql
CREATE TABLE muscle_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  slug TEXT,
  parent_id UUID,
  is_primary BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `movements`
Exercise movement definitions.
```sql
CREATE TABLE movements (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `movement_patterns`
Movement pattern classifications.
```sql
CREATE TABLE movement_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `body_parts`
Body part classifications.
```sql
CREATE TABLE body_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

---

## User System

### `users`
User profiles and preferences.
```sql
CREATE TABLE users (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  username TEXT,
  display_name TEXT,
  profile_image_url TEXT,
  birth_date DATE,
  gender gender,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  timezone TEXT DEFAULT 'UTC'::text,
  language_preference TEXT DEFAULT 'en'::text,
  units_weight weight_unit DEFAULT 'kg'::weight_unit,
  units_distance distance_unit DEFAULT 'km'::distance_unit,
  is_pro BOOLEAN NOT NULL DEFAULT false,
  subscription_id TEXT,
  subscription_status subscription_status,
  subscription_end_date DATE,
  trial_end_date DATE,
  privacy_workout_visibility privacy_level DEFAULT 'friends'::privacy_level,
  privacy_profile_visibility privacy_level DEFAULT 'public'::privacy_level,
  show_in_leaderboards BOOLEAN DEFAULT true,
  allow_friend_requests BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

### `user_roles`
Role-based access control.
```sql
CREATE TABLE user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

### `friendships`
User social connections.
```sql
CREATE TABLE friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL,
  addressee_id UUID NOT NULL,
  status friendship_status NOT NULL DEFAULT 'pending'::friendship_status,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

---

## Workout System

### `workouts`
Workout session records.
```sql
CREATE TABLE workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gym_id UUID,
  template_id UUID,
  name TEXT,
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_duration_minutes INTEGER,
  total_volume_kg NUMERIC(10,2),
  total_sets INTEGER DEFAULT 0,
  readiness_score NUMERIC(3,1),
  post_workout_rating INTEGER,
  post_workout_notes TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `workout_exercises`
Exercises within a workout.
```sql
CREATE TABLE workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  order_index INTEGER NOT NULL,
  target_sets INTEGER,
  target_reps INTEGER,
  target_weight_kg NUMERIC(6,2),
  weight_unit weight_unit DEFAULT 'kg'::weight_unit,
  notes TEXT,
  is_superset BOOLEAN DEFAULT false,
  superset_group_id UUID,
  rest_seconds INTEGER,
  attribute_values_json JSONB DEFAULT '{}'::jsonb,
  readiness_adjusted_from UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `workout_sets`
Individual set tracking.
```sql
CREATE TABLE workout_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  workout_exercise_id UUID NOT NULL,
  set_index INTEGER NOT NULL,
  set_kind set_type DEFAULT 'normal'::set_type,
  target_reps INTEGER,
  target_weight_kg NUMERIC(6,2),
  reps INTEGER,
  weight_kg NUMERIC(6,2),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_personal_record BOOLEAN DEFAULT false,
  rpe NUMERIC(2,1),
  rest_seconds INTEGER,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `workout_templates`
Reusable workout plans.
```sql
CREATE TABLE workout_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  is_public BOOLEAN NOT NULL DEFAULT false,
  estimated_duration_minutes INTEGER,
  difficulty_level INTEGER DEFAULT 3,
  equipment_requirements TEXT[],
  muscle_groups_targeted UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `template_exercises`
Exercises in workout templates.
```sql
CREATE TABLE template_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  order_index INTEGER NOT NULL,
  default_sets INTEGER DEFAULT 3,
  target_reps INTEGER,
  target_weight_kg NUMERIC(6,2),
  weight_unit weight_unit DEFAULT 'kg'::weight_unit,
  rest_seconds INTEGER DEFAULT 120,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

---

## Gym System

### `gyms`
Gym location and information.
```sql
CREATE TABLE gyms (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website_url TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  timezone TEXT,
  opening_hours JSONB,
  amenities TEXT[],
  membership_types JSONB,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `gym_equipment`
Equipment available at gyms.
```sql
CREATE TABLE gym_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL,
  equipment_id UUID NOT NULL,
  quantity INTEGER DEFAULT 1,
  condition equipment_condition DEFAULT 'good'::equipment_condition,
  notes TEXT,
  is_available BOOLEAN DEFAULT true,
  added_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `gym_admins`
Gym management roles.
```sql
CREATE TABLE gym_admins (
  gym_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role gym_role NOT NULL DEFAULT 'staff'::gym_role,
  permissions TEXT[] DEFAULT '{}'::text[],
  assigned_by UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `gym_memberships`
User gym memberships.
```sql
CREATE TABLE gym_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gym_id UUID NOT NULL,
  membership_type TEXT,
  status membership_status NOT NULL DEFAULT 'active'::membership_status,
  start_date DATE NOT NULL,
  end_date DATE,
  monthly_fee NUMERIC(8,2),
  payment_method TEXT,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

---

## Coach System

### `mentors`
Coach/mentor profiles.
```sql
CREATE TABLE mentors (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mentor_type mentor_type NOT NULL,
  bio TEXT,
  experience_years INTEGER,
  specializations TEXT[],
  certifications TEXT[],
  hourly_rate NUMERIC(8,2),
  availability_schedule JSONB,
  is_public BOOLEAN NOT NULL DEFAULT true,
  is_accepting_clients BOOLEAN DEFAULT true,
  gym_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `mentorships`
Coach-client relationships.
```sql
CREATE TABLE mentorships (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL,
  client_user_id UUID NOT NULL,
  status mentorship_status NOT NULL DEFAULT 'pending'::mentorship_status,
  start_date DATE,
  end_date DATE,
  hourly_rate NUMERIC(8,2),
  total_sessions INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

---

## Challenge System

### `challenges`
Community challenges.
```sql
CREATE TABLE challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  target_unit TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `challenge_participants`
User participation in challenges.
```sql
CREATE TABLE challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL,
  user_id UUID NOT NULL,
  current_value NUMERIC DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

---

## Miscellaneous

### `languages`
Supported languages for internationalization.
```sql
CREATE TABLE languages (
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  native_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `life_categories`
Life category system for holistic tracking.
```sql
CREATE TABLE life_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

### `life_subcategories`
Sub-categories for life tracking.
```sql
CREATE TABLE life_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL,
  slug TEXT,
  display_order INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

---

**Note**: This reference includes the most important tables. The complete database contains additional specialized tables for metrics, translations, equipment profiles, and system configurations.

**Data Types Used:**
- `UUID` - Universally unique identifier
- `TEXT` - Variable-length character string
- `INTEGER` - Signed four-byte integer
- `NUMERIC(p,s)` - Exact numeric with precision and scale
- `BOOLEAN` - Boolean (true/false)
- `TIMESTAMP WITH TIME ZONE` - Date and time with timezone
- `JSONB` - Binary JSON
- `ARRAY` - Array types
- Custom enums for specific domains