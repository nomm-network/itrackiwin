# Row Level Security (RLS) Policies

Complete documentation of all RLS policies ensuring data security and user privacy.

## 🛡️ Security Overview

All user-facing tables have RLS enabled with policies that ensure:
- Users can only access their own data
- Admins have elevated permissions for management
- Gym admins have facility-specific access
- Public data is appropriately accessible

## 👤 User Data Policies

### Standard User Access Pattern
```sql
-- Users see only their own records
CREATE POLICY "Users can view own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- Users can modify only their own records  
CREATE POLICY "Users can update own data" ON table_name
  FOR UPDATE USING (auth.uid() = user_id);
```

### Key Tables with User Isolation:
- `users` - Profile data
- `workouts` - Workout sessions
- `user_achievements` - Achievement progress
- `friendships` - Social connections
- `user_preferences` - Settings and customization

## 👑 Admin Access Policies

### Superadmin Full Access
```sql
CREATE POLICY "Superadmins can manage all data" ON table_name
  FOR ALL USING (has_role(auth.uid(), 'superadmin'));
```

### Admin Management Access  
```sql
CREATE POLICY "Admins can manage data" ON table_name
  FOR ALL USING (is_admin(auth.uid()));
```

### Tables with Admin Policies:
- `achievements` - System achievements
- `equipment` - Exercise equipment catalog
- `exercises` - Exercise database
- `data_quality_reports` - System monitoring

## 🏢 Gym-Specific Policies

### Gym Admin Access
```sql
CREATE POLICY "Gym admins can manage gym data" ON table_name
  FOR ALL USING (is_gym_admin(gym_id));
```

### Gym-Related Tables:
- `gym_equipment` - Equipment inventory
- `gym_memberships` - Member management
- `gym_role_requests` - Access requests

## 🔐 Special Access Patterns

### Ambassador System
- `ambassador_profiles` - Self-management only
- `ambassador_commission_accruals` - View own earnings
- `ambassador_gym_deals` - View own deals

### Coach/Mentor System
- `mentors` - Self-managed profiles
- `mentorships` - Both mentor and client can view
- `coach_assigned_templates` - Mentor can assign, both can view

### Public Data Access
```sql
-- Public read access for reference data
CREATE POLICY "Public read access" ON table_name
  FOR SELECT USING (true);
```

### Tables with Public Read:
- `exercises` (public exercises)
- `equipment` - Equipment catalog
- `muscle_groups` - Body muscle reference
- `movements` - Exercise movements

## 🚫 Restricted Operations

### Read-Only Tables
Some tables are read-only for users:
- `admin_audit_log` - System audit trail
- `data_quality_reports` - System monitoring
- `battle_*` tables - Admin-managed competitions

### System-Only Insert
```sql
CREATE POLICY "System can insert" ON table_name
  FOR INSERT WITH CHECK (true);
-- No SELECT/UPDATE/DELETE for users
```

## 🔄 Complex Policy Examples

### Exercise Ownership
```sql
-- Users can view public exercises or own private exercises
CREATE POLICY "View public or owned exercises" ON exercises
  FOR SELECT USING (
    is_public = true OR owner_user_id = auth.uid()
  );
```

### Gym Membership Validation
```sql
-- Users can only join gyms they have access to
CREATE POLICY "Valid gym membership" ON user_gym_memberships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM gyms 
      WHERE id = gym_id AND is_public = true
    ) OR is_gym_admin(gym_id)
  );
```

### Social Features
```sql
-- Friends can view each other's public workout data
CREATE POLICY "Friends can view workouts" ON workouts
  FOR SELECT USING (
    user_id = auth.uid() OR  -- Own data
    (is_public = true AND EXISTS (  -- Friend's public data
      SELECT 1 FROM friendships 
      WHERE status = 'accepted' 
        AND ((requester_id = auth.uid() AND addressee_id = user_id) OR
             (requester_id = user_id AND addressee_id = auth.uid()))
    ))
  );
```

## 🛠️ Policy Management

### Security Functions Used
- `auth.uid()` - Current authenticated user
- `has_role(user_id, role)` - Role-based access
- `is_admin(user_id)` - Admin privilege check
- `is_gym_admin(gym_id)` - Gym-specific admin check
- `is_superadmin_simple()` - Superadmin check

### Performance Considerations
- Policies use indexes on user_id, gym_id columns
- Security definer functions prevent recursive policy calls
- Materialized views bypass RLS for aggregated data

### Testing & Validation
- All policies tested with different user roles
- Edge cases handled (deleted users, expired memberships)
- Performance impact measured and optimized