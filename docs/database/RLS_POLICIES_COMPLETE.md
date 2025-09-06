# Row Level Security (RLS) Policies Documentation

*Generated on: 2025-01-03*

## Overview
This document details all Row Level Security policies configured in the database.

## Policy Categories

### Public Access Policies
Tables with public read access:

#### Reference Data (Always Public)
```sql
-- Exercise system
achievements: "Achievements are viewable by everyone" (SELECT)
body_parts: "body_parts_select_all" (SELECT)  
body_parts_translations: "body_parts_translations_select_all" (SELECT)
bar_types: "bar_types_select_all" (SELECT)
equipment: "equipment_select_all" (SELECT)
equipment_translations: "equipment_translations_select_all" (SELECT)
exercises: "exercises_select_public_or_owned" (SELECT)
grips: "grips_select_all" (SELECT)
grips_translations: "grips_translations_select_all" (SELECT)

-- Life categories
life_categories: "Public read access" (SELECT)
life_category_translations: "Public read access" (SELECT)
life_subcategories: "Public read access" (SELECT)

-- Gym data
gyms: "Public gym access" (SELECT)
gym_equipment_availability: "Gym equipment is viewable by everyone" (SELECT)
```

### User-Owned Data Policies
Standard user ownership pattern:

#### Personal Data
```sql
-- User profiles and settings
profiles: "Users can view own profile" (SELECT)
profiles: "Users can update own profile" (UPDATE)
user_roles: "Users can view own roles" (SELECT)
user_settings: "Users can manage own settings" (ALL)

-- Health tracking
pre_workout_checkins: "Users can read their own checkins" (SELECT)
pre_workout_checkins: "Users can insert their own checkins" (INSERT)
readiness_checkins: "Users can manage their own checkins" (ALL)
cycle_events: "Users can manage their own cycle events" (ALL)
pain_events: "Users can manage their own pain events" (ALL)

-- Workout data
workouts: "Users can manage their own workouts" (ALL)
workout_templates: "Users can manage their own templates" (ALL)
personal_records: "Users can manage their own records" (ALL)

-- Preferences
user_equipment_preferences: "Users can manage preferences" (ALL)
user_muscle_priorities: "Users can manage priorities" (ALL)
user_pinned_subcategories: "Users can manage pinned categories" (ALL)
```

### Admin-Only Policies
Administrative access control:

#### System Management
```sql
-- Admin functions
achievements: "Admins can manage achievements" (ALL)
admin_audit_log: "Superadmins can view audit logs" (SELECT)
attribute_schemas: "Admins can manage attribute schemas" (ALL)
data_quality_reports: "Admins can view data quality reports" (SELECT)

-- Content management
carousel_images: "Admins can manage carousel images" (ALL)
exercise_aliases: "exercise_aliases_admin_manage" (ALL)
equipment_grip_defaults: "equipment_grip_defaults_admin_manage" (ALL)

-- Translation management
body_parts_translations: "body_parts_translations_admin_manage" (ALL)
equipment_translations: "equipment_translations_admin_manage" (ALL)
exercises_translations: "exercises_translations_admin_manage" (ALL)
grips_translations: "grips_translations_admin_manage" (ALL)
```

### Conditional Access Policies
Complex business logic:

#### Exercise System
```sql
-- Exercise ownership and public access
exercises: "exercises_select_public_or_owned" (SELECT)
  → (is_public = true) OR (owner_user_id = auth.uid())

exercises: "exercises_update_own_or_system" (UPDATE)
  → (owner_user_id = auth.uid()) OR ((owner_user_id IS NULL) AND authenticated)

exercises: "exercises_insert_authenticated" (INSERT)
  → authenticated AND ((owner_user_id = auth.uid()) OR (owner_user_id IS NULL))
```

#### Social Features
```sql
-- Challenge participation
challenges: "Public challenges are viewable by everyone" (SELECT)
  → (is_public = true) OR (auth.uid() = creator_id)

challenge_participants: "Users can view challenge participants" (SELECT)
  → true (public participation viewing)

-- Friendship system
friendships: "Users can view their own friendships" (SELECT)
  → (auth.uid() = requester_id) OR (auth.uid() = addressee_id)

friendships: "Users can update friendships they're involved in" (UPDATE)
  → (auth.uid() = requester_id) OR (auth.uid() = addressee_id)
```

#### Gym Management
```sql
-- Gym administration
gym_admins: "Gym owners can manage admins" (ALL)
  → EXISTS(SELECT 1 FROM gym_admins WHERE user_id = auth.uid() 
            AND gym_id = target_gym_id AND role = 'owner')

gym_equipment: "gym_equipment_admin_manage" (ALL)
  → EXISTS(SELECT 1 FROM gym_admins WHERE user_id = auth.uid() 
            AND gym_id = target_gym_id) OR is_admin(auth.uid())
```

#### Mentoring System
```sql
-- Coach access
coach_assigned_templates: "cat_cud_mentor" (ALL)
  → EXISTS(SELECT 1 FROM mentorships ms JOIN mentor_profiles mp 
           WHERE ms.id = mentorship_id AND mp.user_id = auth.uid())

coach_assigned_templates: "cat_read" (SELECT)
  → mentor OR client access to mentorship
```

### Security Function Dependencies

#### Core Security Functions
```sql
-- Role checking
has_role(_user_id uuid, _role app_role) → boolean
is_admin(_user_id uuid) → boolean

-- Rate limiting
is_admin_with_rate_limit(_user_id uuid) → boolean
```

#### Policy Usage Examples
```sql
-- Admin policies use role functions
"Admins can manage achievements": is_admin(auth.uid())
"Superadmins can view audit logs": has_role(auth.uid(), 'superadmin'::app_role)

-- User ownership pattern
"Users can manage their own data": auth.uid() = user_id

-- Conditional access
"Public or owned": (is_public = true) OR (owner_user_id = auth.uid())
```

## Policy Patterns

### 1. Public Reference Data
- No authentication required
- Read-only access
- System configuration data

### 2. User Ownership
- Standard pattern: `auth.uid() = user_id`
- User can manage their own data
- No access to other users' data

### 3. Role-Based Access
- Admin/superadmin roles
- Uses security definer functions
- Centralized permission checking

### 4. Contextual Access
- Business logic conditions
- Multiple ownership patterns
- Complex relationship-based access

### 5. Hierarchical Access
- Gym → Equipment → User access
- Mentorship → Template access
- Program → Block → Exercise access

## Security Considerations

### Best Practices Applied
1. **Principle of Least Privilege**: Users only access their data
2. **Defense in Depth**: Multiple security layers
3. **Explicit Denials**: No default access
4. **Audit Trails**: Admin actions logged

### Common Vulnerabilities Prevented
1. **Horizontal Privilege Escalation**: User can't access other users' data
2. **Vertical Privilege Escalation**: Non-admins can't access admin functions
3. **Data Leakage**: Private data properly isolated
4. **Injection Attacks**: Parameterized function calls

### Policy Testing
- Each policy should be tested with different user roles
- Edge cases around ownership changes
- Anonymous access verification
- Admin privilege verification

## Migration Considerations

### Adding New Tables
1. Enable RLS: `ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;`
2. Add appropriate policies based on data sensitivity
3. Test with different user roles
4. Document policy rationale

### Modifying Existing Policies
1. Understand current access patterns
2. Test changes in staging environment
3. Monitor for access denials
4. Update documentation

*This documentation reflects the current RLS policy configuration and security model.*