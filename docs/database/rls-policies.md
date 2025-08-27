# Row Level Security (RLS) Policies

## Policy Patterns Overview

### 1. User Ownership Pattern
Most user-specific data uses this pattern:
```sql
-- SELECT: Users can view their own data
POLICY "Users can view their own X" ON table_name
FOR SELECT USING (auth.uid() = user_id);

-- INSERT: Users can create their own data
POLICY "Users can create their own X" ON table_name
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can modify their own data
POLICY "Users can update their own X" ON table_name
FOR UPDATE USING (auth.uid() = user_id);

-- DELETE: Users can delete their own data
POLICY "Users can delete their own X" ON table_name
FOR DELETE USING (auth.uid() = user_id);
```

### 2. Public Read Pattern
Reference data that should be readable by all:
```sql
POLICY "Table is viewable by everyone" ON table_name
FOR SELECT USING (true);
```

### 3. Admin Management Pattern
Administrative data managed by admins:
```sql
POLICY "Admins can manage X" ON table_name
FOR ALL USING (is_admin(auth.uid()));
```

## Exercise System Policies

### Core Exercise Tables

#### exercises
```sql
-- Public exercises and user's own exercises are viewable
POLICY "exercises_select_public_or_owned" ON exercises
FOR SELECT USING ((is_public = true) OR (owner_user_id = auth.uid()));

-- Users can only create their own exercises
POLICY "exercises_insert_own" ON exercises
FOR INSERT WITH CHECK (owner_user_id = auth.uid());

-- Users can only update their own exercises
POLICY "exercises_update_own" ON exercises
FOR UPDATE USING (owner_user_id = auth.uid())
WITH CHECK (owner_user_id = auth.uid());

-- Users can only delete their own exercises
POLICY "exercises_delete_own" ON exercises
FOR DELETE USING (owner_user_id = auth.uid());
```

#### exercises_translations
```sql
-- Everyone can read translations
POLICY "exercises_translations_select_all" ON exercises_translations
FOR SELECT USING (true);

-- Only admins can manage translations
POLICY "exercises_translations_admin_manage" ON exercises_translations
FOR ALL USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
```

### Reference Tables (Public Read, Admin Write)

#### equipment
```sql
POLICY "equipment_select_all" ON equipment
FOR SELECT USING (true);

POLICY "equipment_mutate_auth" ON equipment
FOR ALL USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');
```

#### handles, grips, body_parts
Similar pattern - public read, admin write:
```sql
POLICY "grips_select_all" ON grips
FOR SELECT USING (true);

POLICY "grips_admin_manage" ON grips
FOR ALL USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));
```

### Exercise Relationship Tables

#### exercise_handles, exercise_grips, etc.
```sql
-- Public read for exercise configurations
POLICY "exercise_handles_select_all" ON exercise_handles
FOR SELECT USING (true);

-- Admin management
POLICY "exercise_handles_admin_manage" ON exercise_handles
FOR ALL USING (is_admin(auth.uid()));
```

## Workout System Policies

### Core Workout Tables

#### workouts
```sql
-- Users can only access their own workouts
POLICY "Users can manage their own workouts" ON workouts
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### workout_exercises
```sql
-- Access through workout ownership
POLICY "Users can manage workout exercises for their workouts" ON workout_exercises
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM workouts w 
    WHERE w.id = workout_exercises.workout_id 
    AND w.user_id = auth.uid()
  )
);
```

#### workout_sets
```sql
-- Access through workout exercise chain
POLICY "Users can manage sets for their workout exercises" ON workout_sets
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = workout_sets.workout_exercise_id
    AND w.user_id = auth.uid()
  )
);
```

### Template System

#### workout_templates
```sql
POLICY "Users can manage their own templates" ON workout_templates
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### template_exercises
```sql
-- Access through template ownership
POLICY "Users can manage exercises in their templates" ON template_exercises
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM workout_templates t
    WHERE t.id = template_exercises.template_id
    AND t.user_id = auth.uid()
  )
);
```

## Performance & Tracking Policies

### personal_records
```sql
POLICY "Users can manage their own personal records" ON personal_records
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### readiness_checkins
```sql
POLICY "Users can manage their own readiness checkins" ON readiness_checkins
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### auto_deload_triggers
```sql
POLICY "Users can manage their own auto deload triggers" ON auto_deload_triggers
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## User & Social Policies

### User Profile & Roles

#### user_profile_fitness
```sql
POLICY "Users can manage their own fitness profile" ON user_profile_fitness
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

#### user_roles
```sql
-- Users can view their own roles
POLICY "Users can view their own roles" ON user_roles
FOR SELECT USING (auth.uid() = user_id);

-- Only superadmins can manage roles
POLICY "Superadmins can manage user roles" ON user_roles
FOR ALL USING (has_role(auth.uid(), 'superadmin'))
WITH CHECK (has_role(auth.uid(), 'superadmin'));
```

### Social Features

#### friendships
```sql
-- Users can view friendships they're involved in
POLICY "Users can view their own friendships" ON friendships
FOR SELECT USING (
  (auth.uid() = requester_id) OR (auth.uid() = addressee_id)
);

-- Users can create friendship requests
POLICY "Users can create friendship requests" ON friendships
FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Users can update friendships they're involved in
POLICY "Users can update friendships they're involved in" ON friendships
FOR UPDATE USING (
  (auth.uid() = requester_id) OR (auth.uid() = addressee_id)
);
```

#### challenges
```sql
-- Public challenges viewable by all, private by creator
POLICY "Public challenges are viewable by everyone" ON challenges
FOR SELECT USING (
  (is_public = true) OR (auth.uid() = creator_id)
);

-- Users can create challenges
POLICY "Users can create challenges" ON challenges
FOR INSERT WITH CHECK (auth.uid() = creator_id);
```

#### challenge_participants
```sql
-- Anyone can view participants
POLICY "Users can view challenge participants" ON challenge_participants
FOR SELECT USING (true);

-- Users can join challenges
POLICY "Users can join challenges" ON challenge_participants
FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Health & Tracking Policies

### cycle_events
```sql
POLICY "Users can manage their own cycle events" ON cycle_events
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### metric_entries
```sql
POLICY "Users can manage their own metric entries" ON metric_entries
FOR ALL USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

## Admin & System Policies

### Admin Tables

#### admin_audit_log
```sql
-- Only superadmins can view audit logs
POLICY "Superadmins can view audit logs" ON admin_audit_log
FOR SELECT USING (has_role(auth.uid(), 'superadmin'));

-- System can insert audit logs
POLICY "System can insert audit logs" ON admin_audit_log
FOR INSERT WITH CHECK (true);
```

#### coach_logs
```sql
-- Users can view their own coach logs
POLICY "Users can view their own coach logs" ON coach_logs
FOR SELECT USING (auth.uid() = user_id);

-- Admins can manage all coach logs
POLICY "Admins can manage coach logs" ON coach_logs
FOR ALL USING (is_admin(auth.uid()));
```

### Data Quality

#### data_quality_reports
```sql
-- Admins can view reports
POLICY "Admins can view data quality reports" ON data_quality_reports
FOR SELECT USING (is_admin(auth.uid()));

-- System can insert reports
POLICY "System can insert data quality reports" ON data_quality_reports
FOR INSERT WITH CHECK (true);
```

## Gym Management Policies

### gym_admins
```sql
-- Users can view their own admin roles
POLICY "Users can view their own admin roles" ON gym_admins
FOR SELECT USING (user_id = auth.uid());

-- Gym owners can manage admins
POLICY "Gym owners can manage admins" ON gym_admins
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM gym_admins ga
    WHERE ga.user_id = auth.uid()
    AND ga.gym_id = gym_admins.gym_id
    AND ga.role = 'owner'
  )
);
```

## Special Access Functions

### is_admin(user_id)
```sql
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = $1
    AND ur.role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### has_role(user_id, role_name)
```sql
CREATE OR REPLACE FUNCTION has_role(user_id uuid, role_name app_role)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = $1
    AND ur.role = $2
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### can_mutate_workout_set(workout_exercise_id)
```sql
CREATE OR REPLACE FUNCTION can_mutate_workout_set(_we_id uuid)
RETURNS boolean AS $$
DECLARE
  u uuid := auth.uid();
BEGIN
  IF u IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM workout_exercises we
    JOIN workouts w ON w.id = we.workout_id
    WHERE we.id = _we_id
      AND w.user_id = u
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Security Notes

1. **User Authentication**: All user-specific policies depend on `auth.uid()` being non-null
2. **Cascading Access**: Child tables inherit access through parent relationships
3. **Admin Roles**: Admin functions use `SECURITY DEFINER` to access role tables
4. **Public Data**: Reference data (exercises, equipment) is publicly readable
5. **System Operations**: Some operations (audit logs, data quality) allow system access
6. **Gym Isolation**: Gym-specific data is isolated by gym membership/ownership