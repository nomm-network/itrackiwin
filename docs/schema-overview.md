# Database Schema Overview

## 📊 Database Statistics
- **Database**: Supabase PostgreSQL
- **Schema**: public
- **Total Tables**: 88+ base tables
- **Total Views**: 20+ views
- **Total Functions**: 200+ functions
- **Generated**: {{ current_date }}

## 🏗️ Core System Areas

### 🏃‍♂️ Exercise & Fitness System
The heart of the application - comprehensive exercise database with equipment, movements, and tracking.

**Core Tables:**
- `exercises` - Main exercise definitions
- `equipment` - Gym equipment catalog
- `muscle_groups` - Body muscle mapping
- `movements` - Movement patterns
- `workout_*` - Workout tracking system

### 👥 User Management
User profiles, authentication, and role-based access control.

**Core Tables:**
- `users` - User profiles and settings
- `user_roles` - Role-based access control
- `user_preferences` - User customization
- `friendships` - Social connections

### 🏋️‍♀️ Workout System
Comprehensive workout planning, execution, and tracking.

**Core Tables:**
- `workouts` - Workout sessions
- `workout_exercises` - Exercises in workouts
- `workout_sets` - Individual set tracking
- `workout_templates` - Reusable workout plans

### 🏢 Gym Management
Multi-gym support with equipment tracking and management.

**Core Tables:**
- `gyms` - Gym locations
- `gym_equipment` - Equipment inventory
- `gym_admins` - Gym management roles
- `gym_memberships` - User-gym relationships

### 🎯 Coach & Mentorship
Professional coaching and mentorship system.

**Core Tables:**
- `mentors` - Coach profiles
- `mentorships` - Coach-client relationships
- `mentor_categories` - Coaching specializations

### 🏆 Gamification
Achievements, challenges, and social features.

**Core Tables:**
- `achievements` - Achievement definitions
- `user_achievements` - User progress tracking
- `challenges` - Community challenges
- `leaderboards` - Competition tracking

### 💰 Business & Commerce
Ambassador program, commissions, and revenue tracking.

**Core Tables:**
- `ambassador_*` - Ambassador program tables
- `battle_*` - Competition system
- `gym_monthly_revenue` - Revenue tracking

## 🔗 Key Relationships

### Exercise System Relationships
```
exercises -> equipment (equipment_id)
exercises -> muscle_groups (primary_muscle_id)
exercises -> movements (movement_id)
exercises -> body_parts (body_part_id)
```

### Workout System Relationships
```
workouts -> users (user_id)
workout_exercises -> workouts (workout_id)
workout_exercises -> exercises (exercise_id)
workout_sets -> workout_exercises (workout_exercise_id)
```

### User System Relationships
```
users -> auth.users (id)
user_roles -> users (user_id)
user_preferences -> users (user_id)
```

### Gym System Relationships
```
gym_equipment -> gyms (gym_id)
gym_equipment -> equipment (equipment_id)
gym_admins -> gyms (gym_id)
gym_admins -> users (user_id)
```

## 🛡️ Security Features

### Row Level Security (RLS)
- All user tables have RLS enabled
- Policies ensure users can only access their own data
- Admin roles have elevated permissions
- Gym admins have facility-specific permissions

### Authentication Integration
- Seamless integration with Supabase Auth
- Automatic user profile creation on signup
- Role-based access control
- Session management

## 📈 Performance Features

### Indexes
- Optimized indexes on frequently queried columns
- Composite indexes for complex queries
- GIN indexes for JSONB data

### Materialized Views
- Pre-computed aggregate data
- Refresh strategies for real-time updates
- Performance optimization for dashboard queries

## 🔧 Custom Types & Enums

### Exercise System Types
- `exercise_skill_level` - beginner, intermediate, advanced
- `load_type` - dual_load, single_load, stack, none
- `weight_unit` - kg, lbs
- `set_type` - warmup, normal, top_set, drop, amrap

### User System Types
- `app_role` - user, admin, superadmin
- `gender` - male, female, other, prefer_not_to_say
- `metric_value_type` - number, text, boolean, enum

### Business Types
- `subscription_status` - active, canceled, past_due
- `mentor_type` - fitness, life, business
- `battle_status` - draft, active, completed

## 🔄 Triggers & Automation

### Automatic Timestamps
- `updated_at` columns automatically maintained
- `created_at` defaults to current timestamp

### Data Validation
- Custom validation triggers
- Foreign key constraints
- Check constraints for data integrity

### Business Logic Triggers
- Automatic user profile creation
- Exercise naming automation
- Achievement progress tracking

## 📊 Data Flow Architecture

### User Journey
1. **Registration** → `auth.users` → `users` (via trigger)
2. **Profile Setup** → User preferences and gym selection
3. **Workout Planning** → Template creation and exercise selection
4. **Workout Execution** → Real-time set tracking
5. **Progress Analysis** → Aggregated statistics and achievements

### Data Processing Pipeline
1. **Input Validation** → Triggers and constraints
2. **Business Logic** → Custom functions and procedures
3. **Aggregation** → Materialized views and summaries
4. **Reporting** → Admin dashboards and analytics