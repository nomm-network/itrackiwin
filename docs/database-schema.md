# Database Schema Documentation

## Weight Resolution System Tables

### Core Tables

#### `app_flags`
Feature flag management for safe rollouts.

```sql
CREATE TABLE app_flags (
  key text PRIMARY KEY,
  enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Policies**: Admin manage, authenticated read

#### `weight_resolution_log`
Telemetry and monitoring for weight resolution system.

```sql
CREATE TABLE weight_resolution_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  exercise_id uuid,
  gym_id uuid,
  desired_weight numeric NOT NULL,
  resolved_weight numeric NOT NULL,
  implement text NOT NULL,
  resolution_source text NOT NULL,
  feature_version text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

**Policies**: Users can insert own logs, admins can view all

### Enhanced Equipment Tables

#### `user_gym_plates` (Enhanced)
Extended with mixed-unit support.

**New Columns**:
- `native_unit weight_unit` - Original unit of the plate
- `label text` - Custom labeling (e.g., "Competition", "Bumper")
- `color text` - Color identification

**Unique Constraint**: `(user_gym_id, native_unit, weight, label, color)`

#### `user_gym_dumbbells` (Enhanced)
Extended with mixed-unit support.

**New Columns**:
- `native_unit weight_unit` - Original unit of the dumbbell

#### `user_gym_miniweights` (Enhanced)
Extended with mixed-unit support.

**New Columns**:
- `native_unit weight_unit` - Original unit of the micro plates

#### `workouts` (Enhanced)
Extended with resolution tracking.

**New Columns**:
- `unit weight_unit` - Session unit for this workout
- `resolution_source text` - How weights were resolved

---

## Database Functions

### `sum_plates_mixed_units(plate_weights_kg, plate_units, display_unit)`
Sums plates across mixed units with proper conversions.

**Returns**: `(total_kg, total_display, unit_display)`

### `calculate_mixed_unit_increment(gym_id, load_type, display_unit)`
Calculates minimum weight increment for mixed-unit inventories.

**Parameters**:
- `gym_id uuid` - Target gym
- `load_type text` - 'dual_load', 'single_load', or 'stack'
- `display_unit weight_unit` - Desired return unit

**Returns**: `numeric` - Minimum increment in display unit

### `is_feature_enabled(flag_key)`
Checks if a feature flag is enabled.

**Parameters**:
- `flag_key text` - Feature flag identifier

**Returns**: `boolean`

---

## Views

### `v_gym_inventory_mixed_units`
Unified view of gym inventory with native and converted weights.

```sql
SELECT 
  id,
  user_gym_id,
  gym_id,
  item_type,
  native_weight,
  native_unit,
  converted_weight,
  converted_unit,
  quantity,
  label,
  color
FROM (plates UNION dumbbells)
```

---

## Indexes

### Performance Indexes
- `idx_weight_resolution_log_user_exercise` on `(user_id, exercise_id, created_at)`
- `idx_app_flags_key_enabled` on `(key, enabled)`
- `idx_plates_mixed_unit_lookup` on `(user_gym_id, native_unit, weight)`

### Unique Constraints
- `user_gym_plates_unique_mixed_unit` on `(user_gym_id, native_unit, weight, label, color)`

---

## Row Level Security Policies

### `app_flags`
- **SELECT**: Authenticated users
- **ALL**: Admins only

### `weight_resolution_log`
- **INSERT**: Users (own records only)
- **SELECT**: Admins (all records), Users (own records)

### Equipment Tables
- **ALL**: Users (own gym equipment only)
- **SELECT**: Users (gym members)

---

## Migration Notes

### Safe Migration Patterns
1. **Additive Only**: New columns with defaults, no destructive changes
2. **Feature Flags**: All new functionality behind flags
3. **Backward Compatibility**: Old queries continue to work
4. **Idempotent**: Migrations can be run multiple times safely

### Rollback Strategy
1. **Disable Feature Flag**: Immediate rollback to v1 system
2. **Data Integrity**: All original data preserved
3. **Performance**: No performance impact on disabled features

---

*Generated: 2025-01-11*
*Schema Version: 1.2 (Mixed Units + Feature Flags)*