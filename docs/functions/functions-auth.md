# Authentication & User Functions

Database functions related to user authentication, roles, and user management.

## 🔐 Authentication Functions

### `handle_new_user()`
**Purpose**: Automatically creates user profile when new user signs up  
**Type**: Trigger Function  
**Returns**: `trigger`  

```sql
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  INSERT INTO public.users (id, is_pro)
  VALUES (NEW.id, false);
  RETURN NEW;
END;
$$;
```

**Usage**: Triggered automatically on `auth.users` INSERT
- Creates corresponding `users` table record
- Sets default `is_pro` to false
- Maintains referential integrity between auth and profile data

---

## 👥 Role & Permission Functions

### `has_role(user_id uuid, role app_role)`
**Purpose**: Check if user has specific role  
**Returns**: `boolean`  
**Security**: SECURITY DEFINER to bypass RLS

```sql
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT exists (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
```

**Parameters**:
- `_user_id`: UUID of user to check
- `_role`: Role to verify (`admin`, `moderator`, `user`)

**Usage Examples**:
```sql
-- Check if user is admin
SELECT has_role(auth.uid(), 'admin');

-- Use in RLS policy
CREATE POLICY "Admins can view all data"
  ON some_table FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
```

### `is_admin(user_id uuid)`
**Purpose**: Check if user has admin privileges  
**Returns**: `boolean`

```sql
-- Implementation inferred from RLS policies
SELECT has_role(user_id, 'admin') OR has_role(user_id, 'superadmin');
```

### `is_superadmin_simple()`
**Purpose**: Check if current user is superadmin  
**Returns**: `boolean`

```sql
-- Implementation inferred from usage
SELECT has_role(auth.uid(), 'superadmin');
```

---

## 🏢 Gym Access Functions

### `is_gym_admin(gym_id uuid)`
**Purpose**: Check if current user is admin of specific gym  
**Returns**: `boolean`  

```sql
-- Implementation inferred from RLS policies
SELECT EXISTS (
  SELECT 1 FROM gym_admins ga
  WHERE ga.gym_id = $1 
    AND ga.user_id = auth.uid()
    AND ga.role IN ('admin', 'owner')
);
```

**Parameters**:
- `gym_id`: UUID of gym to check admin access for

**Usage**: Used in RLS policies for gym-specific data access

---

## 📊 User Preference Functions

### `is_pro_user(user_id uuid)`
**Purpose**: Check if user has pro subscription  
**Returns**: `boolean`  
**Security**: SECURITY DEFINER

```sql
CREATE OR REPLACE FUNCTION public.is_pro_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public 
AS $$
  SELECT COALESCE(is_pro, false)
  FROM public.users
  WHERE id = user_id;
$$;
```

**Parameters**:
- `user_id`: UUID of user to check pro status

**Usage**: 
- Feature gating for premium functionality
- Subscription validation
- UI conditional rendering

---

## 🔒 Rate Limiting Functions

### Admin Check Rate Limiting
**Purpose**: Prevent abuse of admin privilege checks  
**Implementation**: Uses `admin_check_rate_limit` table

**Related Tables**:
- `admin_check_rate_limit`: Tracks admin check frequency per user

**Logic**:
1. Track admin privilege checks per user per time window
2. Limit frequency to prevent abuse
3. Automatically clean up old rate limit records

---

## 🛡️ Security Features

### Security Definer Pattern
Many authentication functions use `SECURITY DEFINER` to:
- Bypass RLS policies when checking permissions
- Prevent recursive policy evaluation
- Ensure consistent privilege checking

### RLS Integration
Authentication functions are designed for use in:
- Row Level Security policies
- Application-level access control
- API endpoint authorization

### Audit Trail
User actions are tracked through:
- `admin_audit_log` for administrative actions
- Automatic timestamping on user tables
- Session tracking capabilities

---

## 📋 Function Categories Summary

| Category | Functions | Purpose |
|----------|-----------|---------|
| **User Creation** | `handle_new_user()` | Auto-create user profiles |
| **Role Checking** | `has_role()`, `is_admin()`, `is_superadmin_simple()` | Permission validation |
| **Gym Access** | `is_gym_admin()` | Facility-specific permissions |
| **Subscriptions** | `is_pro_user()` | Premium feature access |
| **Security** | Rate limiting functions | Abuse prevention |

---

## 🔄 Usage Patterns

### In RLS Policies
```sql
-- User can only see their own data
CREATE POLICY "Users see own data" ON table_name
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all data  
CREATE POLICY "Admins see all" ON table_name
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- Gym admins see gym data
CREATE POLICY "Gym admins see gym data" ON table_name
  FOR SELECT USING (is_gym_admin(gym_id));
```

### In Application Logic
```sql
-- Check user permissions before sensitive operations
SELECT CASE 
  WHEN has_role(auth.uid(), 'admin') THEN 'admin_dashboard'
  WHEN is_pro_user(auth.uid()) THEN 'pro_features'
  ELSE 'basic_features'
END;
```

### Trigger Usage
```sql
-- Automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```