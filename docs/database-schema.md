# Database Schema Documentation

## Overview

The fitness application uses a PostgreSQL database hosted on Supabase with 144 tables supporting a comprehensive fitness tracking and management system.

## Core Tables Structure

### Exercise Management
- **exercises** - Core exercise definitions
- **exercises_translations** - Multi-language exercise names and descriptions
- **exercise_aliases** - Alternative names for exercises
- **exercise_equipment_variants** - Equipment variations for exercises
- **exercise_grip_effects** - Grip impact on muscle activation
- **exercise_grips** - Available grips for exercises
- **exercise_images** - Exercise demonstration images
- **exercise_similars** - Related/similar exercises

### Equipment System
- **equipment** - Equipment definitions and specifications
- **equipment_translations** - Multi-language equipment names
- **equipment_grip_defaults** - Default grips for equipment
- **equipment_handle_orientations** - Handle orientation options
- **gym_equipment** - Gym-specific equipment configurations
- **gym_equipment_availability** - Equipment availability per gym
- **gym_equipment_overrides** - Custom equipment settings per gym

### Body Part & Muscle System
- **body_parts** - Major body regions (arms, back, chest, core, legs)
- **body_parts_translations** - Multi-language body part names
- **muscle_groups** - Muscle group classifications
- **muscle_groups_translations** - Multi-language muscle group names
- **muscles** - Individual muscle definitions
- **muscles_translations** - Multi-language muscle names

### Workout System
- **workouts** - Workout sessions
- **workout_exercises** - Exercises within a workout
- **workout_sets** - Individual sets within exercises
- **workout_set_grips** - Grips used in specific sets
- **workout_set_metric_values** - Metric measurements for sets
- **workout_comments** - Comments on workouts
- **workout_likes** - Workout social interactions

### User Management
- **users** - Core user information
- **profiles** - Extended user profiles
- **user_roles** - Role-based access control
- **user_achievements** - Achievement tracking
- **user_settings** - User preferences
- **user_stats** - User statistics

### Gym Management
- **gyms** - Gym locations and information
- **gym_admins** - Gym administration roles
- **gym_aliases** - Alternative gym names
- **gym_plate_inventory** - Available plates per gym
- **user_gym_memberships** - User gym relationships

### Admin & Audit
- **admin_audit_log** - Administrative action logging
- **admin_check_rate_limit** - Rate limiting for admin checks
- **data_quality_reports** - Data quality monitoring

### Internationalization
- **languages** - Supported languages
- **text_translations** - General text translations

## Key Relationships

### Exercise-Equipment Relationships
- exercises → equipment (many-to-one)
- exercises → exercise_equipment_variants (one-to-many)
- equipment → equipment_grip_defaults (one-to-many)

### Body Part Hierarchy
- body_parts → muscle_groups (one-to-many)
- muscle_groups → muscles (one-to-many)
- exercises → muscle_groups (primary_muscle_id)

### Workout Structure
- users → workouts (one-to-many)
- workouts → workout_exercises (one-to-many)
- workout_exercises → workout_sets (one-to-many)

### Translation System
- Most core entities have corresponding translation tables
- Supports multi-language content delivery

## Data Types & Enums

### Custom Types
- `load_type`: dual_load, single_load, stack, none
- `load_medium`: bar, plates, band, other
- `weight_unit`: kg, lbs
- `exercise_skill_level`: low, medium, high
- `set_type`: warmup, normal, top_set, drop, amrap
- `app_role`: admin, superadmin

### Key Constraints
- Row Level Security (RLS) enabled on all tables
- UUID primary keys throughout
- Proper foreign key relationships
- Unique constraints on critical combinations

## Recent Schema Changes

1. **Handle System Removal** - Removed handle-related tables and columns
2. **Equipment-Grip Integration** - Enhanced equipment-grip compatibility system
3. **View Cleanup** - Updated materialized views to remove handle references
4. **RLS Policy Updates** - Maintained security policies during schema changes

## Security Model

- **Row Level Security** enabled on all tables
- **Role-based access** with admin and superadmin roles
- **User ownership** for user-specific data
- **Public read access** for reference data (exercises, equipment)
- **Admin-only write access** for core data

## Performance Considerations

- **Indexes** on frequently queried columns
- **Materialized views** for complex queries
- **Proper normalization** to reduce data duplication
- **Efficient RLS policies** to minimize query overhead