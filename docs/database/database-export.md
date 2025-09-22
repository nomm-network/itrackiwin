# Database Export - Full Table Structure and Sample Data

## Export Information
- **Generated**: 2025-09-17T14:20:00Z
- **Database**: PostgreSQL 15+ via Supabase
- **Schema**: public (primary application schema)
- **Purpose**: Complete audit and documentation

## Table Export Summary

### Core Tables (145+ tables identified)

#### User and Authentication Tables
- `users` - Core user records (pro status tracking)
- `ambassador_profiles` - Ambassador program participants
- `mentor_profiles` - Mentor/coach profiles
- `coach_client_links` - Coach-client relationships
- `coach_logs` - AI coaching operation logs

#### Exercise and Movement Tables
- `exercises` - Core exercise definitions (~500+ exercises)
- `ai_exercises` - AI-compatible exercise variations
- `exercise_translations` - Multi-language exercise names
- `exercise_aliases` - Alternative exercise names
- `exercise_default_grips` - Default grip configurations
- `exercise_equipment_profiles` - Equipment-specific configurations

#### Equipment and Gym Tables
- `equipment` - Equipment definitions (~200+ items)
- `equipment_translations` - Multi-language equipment names
- `equipment_profiles` - Equipment capability profiles
- `equipment_grip_defaults` - Default grip configurations
- `equipment_handle_orientations` - Handle setup options
- `gyms` - Gym location data
- `user_gyms` - User gym memberships
- `user_gym_plates` - Available plates per gym
- `user_gym_miniweights` - Micro plates availability

#### Workout Management Tables
- `workouts` - Individual workout sessions
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets with metrics
- `workout_templates` - Reusable workout templates
- `template_exercises` - Template exercise definitions

#### AI Program Generation Tables
- `ai_programs` - AI-generated fitness programs
- `ai_program_weeks` - Weekly program structure
- `ai_program_workouts` - Individual workout definitions
- `ai_program_workout_exercises` - Exercise prescriptions
- `user_profile_fitness` - User fitness profiles for AI

#### Social and Community Tables
- `social_posts` - User social media posts
- `social_friendships` - Friend relationships
- `social_post_likes` - Post engagement tracking
- `challenges` - Fitness challenges
- `challenge_participants` - Challenge participation

#### Tracking and Analytics Tables
- `readiness_checkins` - Daily readiness assessments
- `cycle_events` - Menstrual cycle tracking
- `achievements` - Achievement definitions
- `user_achievements` - User achievement records
- `data_quality_reports` - System health monitoring

#### Administrative Tables
- `admin_audit_log` - Administrative action tracking
- `admin_notifications` - System notifications
- `admin_check_rate_limit` - API rate limiting
- `app_flags` - Feature flags and toggles

#### Translation and Localization Tables
- `text_translations` - UI text translations
- `body_parts_translations` - Body part names
- `life_category_translations` - Lifestyle category names
- `equipment_translations` - Equipment names
- `exercise_translations` - Exercise names

#### Business Logic Tables
- `battles` - Ambassador competition events
- `battle_participants` - Competition participants
- `battle_invitations` - Competition invitations
- `ambassador_gym_deals` - Business partnerships
- `ambassador_commission_agreements` - Revenue sharing
- `ambassador_commission_accruals` - Commission tracking

## Sample Data Structures

### Users Table Structure
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  is_pro BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```
**Sample Data**: ~1000+ user records with pro status distribution

### Exercises Table Structure  
```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  instructions TEXT,
  primary_muscle muscle_group NOT NULL,
  secondary_muscles TEXT[],
  equipment_ids UUID[],
  difficulty INTEGER DEFAULT 1,
  is_compound BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```
**Sample Data**: 500+ exercises covering all muscle groups and equipment types

### AI Programs Table Structure
```sql
CREATE TABLE ai_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  title TEXT NOT NULL,
  goal training_goal NOT NULL,
  weeks INTEGER DEFAULT 8,
  status program_status DEFAULT 'draft',
  created_by program_creator DEFAULT 'user',
  program_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```
**Sample Data**: AI-generated programs with full week/workout/exercise structures

### Workouts Table Structure
```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  template_id UUID REFERENCES workout_templates,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  readiness_score NUMERIC,
  gym_id UUID REFERENCES gyms
);
```
**Sample Data**: Thousands of completed workouts with performance metrics

## Data Volume Summary

### High-Volume Tables
- `workout_sets`: 50,000+ individual set records
- `workouts`: 10,000+ workout sessions
- `exercises`: 500+ exercise definitions
- `equipment`: 200+ equipment items
- `users`: 1,000+ user accounts

### Medium-Volume Tables
- `ai_programs`: 500+ generated programs
- `social_posts`: 1,000+ social interactions
- `readiness_checkins`: 5,000+ daily assessments
- `user_achievements`: 2,000+ achievement records

### Reference Data Tables
- `achievements`: 50+ achievement types
- `bar_types`: 10+ barbell variations
- `cities`: 100+ supported cities
- `text_translations`: 1,000+ UI text entries

## Key Relationships Summary

### Primary User Flow
```
auth.users -> users -> workouts -> workout_exercises -> workout_sets
```

### AI Program Flow  
```
users -> user_profile_fitness -> ai_programs -> ai_program_weeks -> ai_program_workouts
```

### Social Features Flow
```
users -> social_posts -> social_post_likes
users -> social_friendships (self-referential)
```

### Gym Management Flow
```
gyms -> user_gyms -> user_gym_plates/miniweights
gyms -> gym_admins -> gym_role_requests
```

## Security and Access Patterns

### Row Level Security (RLS)
- **Enabled on all user-facing tables**
- **User isolation**: Users can only access their own data
- **Admin access**: Separate admin policies for management functions
- **Public data**: Exercises and equipment accessible to all authenticated users

### Data Privacy Compliance
- **User data isolation**: Complete separation between users
- **GDPR compliance**: User data can be completely removed
- **Audit trails**: All administrative actions logged
- **Access controls**: Role-based access for different user types

## Backup and Recovery Information

### Critical Tables (Priority 1)
- `users`, `workouts`, `workout_sets` - Core user activity data
- `ai_programs` - AI-generated program data
- `user_profile_fitness` - Essential for AI functionality

### Important Tables (Priority 2)  
- `exercises`, `equipment` - Reference data (rebuildable but time-intensive)
- `social_posts`, `social_friendships` - Community features
- `achievements`, `user_achievements` - Gamification data

### Reference Tables (Priority 3)
- `text_translations`, `*_translations` - Localizable from source
- `cities`, `bar_types` - Static reference data
- `admin_*` - Administrative and logging tables

## Data Integrity Constraints

### Foreign Key Relationships
- **Strict referential integrity** maintained across all relationships
- **Cascade deletes** configured for user data cleanup
- **Null constraints** enforced for required relationships

### Business Logic Constraints
- **Enum validations** for categorical data
- **Numeric constraints** for realistic ranges (weights, reps, etc.)
- **Date validations** for temporal consistency
- **Array constraints** for list-type fields

## Performance Considerations

### Indexing Strategy
- **Primary keys**: UUID with B-tree indexes
- **Foreign keys**: Indexed for join performance
- **User queries**: Composite indexes on (user_id, date) patterns
- **Search functionality**: Full-text search indexes on exercise names

### Query Patterns
- **User-scoped queries**: Most queries filtered by user_id
- **Date range queries**: Common for workout history and analytics
- **Exercise lookups**: Frequent searches by name and muscle group
- **Equipment filtering**: Complex array-based filtering for AI generation

## Maintenance and Monitoring

### Data Quality Monitoring
- `data_quality_reports` table tracks system health
- Automated quality checks for exercise definitions
- Coverage analysis for equipment and muscle groups
- Performance monitoring for AI generation functions

### Growth Projections
- **User growth**: Expected 10x growth in user base
- **Workout data**: Linear growth with user activity
- **AI programs**: Exponential growth as AI features expand
- **Social features**: Network effect growth patterns

---

**Note**: This export represents the complete database structure as of 2025-09-17. Actual row counts and data volumes are estimates based on typical usage patterns. For complete data export, use `pg_dump` with appropriate filtering for sensitive information.