# Database Schema Documentation

## Overview
This document provides a comprehensive overview of the database schema for the fitness platform system, including tables, views, functions, and their relationships.

## Core System Architecture

### User Management & Authentication
- **Users**: Managed through Supabase Auth
- **user_roles**: Role-based access control (admin, superadmin)
- **admin_audit_log**: Tracks administrative actions
- **admin_check_rate_limit**: Rate limiting for admin operations

### Fitness Core Entities

#### Exercises System
- **exercises**: Core exercise definitions with equipment, muscle groups, movement patterns
- **exercise_aliases**: Alternative names for exercises 
- **exercise_equipment_variants**: Equipment variations for exercises
- **exercise_equipment_profiles**: Equipment requirements per exercise
- **exercise_similars**: Related/similar exercise recommendations
- **exercise_images**: Exercise demonstration images
- **exercise_default_grips**: Default grip configurations
- **exercise_grips**: Available grip options
- **exercise_grip_effects**: Muscle activation effects per grip
- **exercise_handle_orientations**: Handle position configurations
- **exercise_metric_defs**: Custom metrics per exercise

#### Equipment Management
- **equipment**: Equipment catalog
- **equipment_defaults**: Default settings for equipment types
- **equipment_translations**: Multi-language equipment names
- **equipment_grip_defaults**: Default grips per equipment
- **equipment_handle_orientations**: Handle configurations per equipment
- **gym_equipment**: Equipment available at specific gyms
- **gym_equipment_availability**: Real-time equipment status
- **gym_equipment_overrides**: Gym-specific equipment configurations
- **gym_plate_inventory**: Weight plate inventory per gym

#### Workout System
- **workouts**: Workout sessions
- **workout_exercises**: Exercises within a workout
- **workout_sets**: Individual sets within exercises
- **workout_set_metric_values**: Custom metric values per set
- **workout_set_grips**: Grip variations used in sets
- **workout_templates**: Reusable workout templates
- **template_exercises**: Exercises within templates
- **auto_deload_triggers**: Automatic deload detection

#### Body & Movement Classification
- **body_parts**: Body part taxonomy
- **body_parts_translations**: Multi-language body part names
- **muscle_groups**: Muscle group definitions  
- **muscle_groups_translations**: Multi-language muscle names
- **movement_patterns**: Movement pattern classifications
- **movement_patterns_translations**: Multi-language movement names

### Gym & Location Management
- **gyms**: Gym facility information
- **gym_aliases**: Alternative gym names
- **gym_admins**: Gym administrative access
- **gym_observers**: Read-only gym access
- **cities**: Geographic location data
- **join_codes**: QR code-based gym joining system

### Coach & Mentorship System
- **mentor_profiles**: Coach profile information
- **mentor_areas**: Coaching specialization areas
- **mentor_categories**: Coach category classifications
- **mentorships**: Active coaching relationships
- **coach_assigned_templates**: Templates assigned by coaches
- **coach_client_links**: Coach-client relationship requests
- **coach_logs**: AI coaching system logs
- **gym_coach_memberships**: Coach access to gyms

### Ambassador & Commission System
- **ambassador_profiles**: Ambassador user profiles
- **battles**: Competition/campaign events
- **battle_participants**: Ambassador participation in battles
- **battle_invitations**: Battle invitation system
- **ambassador_gym_deals**: Gym partnership agreements
- **ambassador_gym_visits**: Visit tracking for ambassadors
- **ambassador_commission_agreements**: Commission rate agreements
- **ambassador_commission_accruals**: Calculated commission amounts
- **gym_monthly_revenue**: Revenue tracking for commissions

### Social & Gamification
- **friendships**: User social connections
- **challenges**: Community challenges
- **challenge_participants**: Challenge participation tracking
- **achievements**: Achievement definitions
- **user_achievements**: User achievement progress

### Content & Configuration
- **carousel_images**: Home page carousel content
- **attribute_schemas**: Dynamic attribute configurations
- **data_quality_reports**: System health monitoring
- **languages**: Supported languages
- **life_categories**: Life area categorization
- **life_category_translations**: Multi-language life categories
- **life_subcategories**: Subcategory definitions
- **life_subcategory_translations**: Multi-language subcategories

### Health & Wellness Tracking
- **cycle_events**: Menstrual cycle tracking
- **metric_defs**: Custom metric definitions
- **user_pinned_subcategories**: User preference tracking

### System Utilities
- **idempotency_keys**: Duplicate request prevention
- **text_translations**: System text translations

## Key Views

### Analytics Views
- **v_gym_activity**: Gym usage statistics (members, coaches, workouts)
- **v_gym_top_exercises**: Most popular exercises per gym
- **v_gym_equipment_completeness**: Equipment configuration coverage
- **v_gym_poster_freshness**: Ambassador poster verification status
- **v_ambassador_summary**: Ambassador performance metrics
- **v_ambassador_commission_summary**: Commission earnings summary
- **v_gyms_needing_poster_check**: Gyms requiring poster verification

### Commission & Marketplace Views
- **v_ambassador_statements**: Detailed commission statements
- **v_ambassador_statement_month**: Monthly commission summaries
- **v_marketplace_gyms**: Public gym catalog for marketplace
- **v_marketplace_mentors**: Public mentor catalog for marketplace  
- **v_marketplace_local_mentors**: Location-based mentor discovery

### Exercise & Workout Views
- **v_exercises_with_translations**: Exercises with localized names
- **v_last_working_set**: User's last working set per exercise
- **v_user_exercise_1rm**: Estimated 1RM calculations

## Key Functions

### User Management
- **create_admin_user()**: Create admin users with proper audit
- **has_role()**: Check user role permissions
- **is_admin()**: Admin role verification
- **is_superadmin_simple()**: Superadmin verification
- **is_gym_admin()**: Gym-specific admin check

### Workout System
- **start_workout()**: Initialize workout with template and readiness
- **end_workout()**: Complete workout session
- **log_workout_set()**: Record set with metrics and grips
- **get_next_set_index()**: Auto-increment set numbering

### AI Coaching
- **compute_readiness_for_user()**: Calculate user readiness score
- **readiness_multiplier()**: Convert readiness to weight multiplier
- **pick_base_load()**: Select appropriate starting weight
- **generate_warmup_steps()**: Create warmup progression

### Commission System
- **export_my_commissions_csv()**: Ambassador commission export
- **export_payouts_csv()**: Operations payout export
- **run_commission_accruals()**: Calculate monthly commissions

### Analytics & Insights
- **fn_detect_stagnation()**: Identify training plateaus
- **fn_suggest_warmup()**: Generate warmup recommendations
- **fn_suggest_sets()**: Progressive overload suggestions
- **fn_suggest_rest_seconds()**: Rest period optimization

### Equipment & Configuration
- **bar_min_increment()**: Calculate minimum weight increment
- **closest_machine_weight()**: Find nearest available weight
- **next_weight_step_kg()**: Progression weight calculation

## Security Model

### Row Level Security (RLS)
All tables have RLS enabled with policies enforcing:
- User data isolation (users see only their own data)
- Gym-based access control (gym admins manage their gym data)
- Role-based permissions (admins/superadmins have elevated access)
- Public data exposure (marketplace data available to all)

### Key Security Functions
- **Security Definer Functions**: Elevated privilege operations
- **Authentication Checks**: All mutations require auth.uid()
- **Role Verification**: Granular permission checking
- **Audit Logging**: Administrative action tracking

## Data Relationships

### Primary Foreign Key Relationships
- **exercises → equipment**: Equipment requirements
- **exercises → muscle_groups**: Primary muscle targeting
- **exercises → movement_patterns**: Movement classification
- **workouts → users**: Workout ownership
- **workout_exercises → exercises**: Exercise selection
- **workout_sets → workout_exercises**: Set organization
- **gyms → cities**: Location mapping
- **ambassador_commission_agreements → gyms**: Partnership tracking
- **mentor_profiles → life_categories**: Specialization areas

### Many-to-Many Relationships
- **exercise_equipment_variants**: Exercises ↔ Equipment variations
- **exercise_grips**: Exercises ↔ Available grips
- **gym_coach_memberships**: Coaches ↔ Gyms
- **challenge_participants**: Users ↔ Challenges
- **mentor_categories**: Mentors ↔ Categories

## Performance Considerations

### Indexes
- **Primary Keys**: All tables have UUID primary keys
- **Foreign Keys**: Indexed for join performance
- **Composite Indexes**: Multi-column queries optimized
- **Unique Constraints**: Data integrity enforcement

### Materialized Views
- **mv_user_exercise_1rm**: Pre-calculated 1RM estimates
- **mv_last_set_per_user_exercise**: Latest set performance

### Query Optimization
- **Pagination**: LIMIT/OFFSET for large result sets
- **Selective Queries**: Column-specific selections
- **Join Optimization**: Efficient relationship traversal

## Maintenance & Operations

### Data Quality
- **data_quality_reports**: Automated health checking
- **Constraint Validation**: Data integrity enforcement
- **Translation Completeness**: Multi-language coverage

### System Monitoring
- **coach_logs**: AI system performance tracking
- **admin_audit_log**: Administrative action history
- **Error Handling**: Graceful failure management

### Backup & Recovery
- **Automated Backups**: Supabase managed backups
- **Point-in-Time Recovery**: Data restoration capabilities
- **Migration History**: Schema version control

## Environment Configuration

### Development
- **Test Data**: Sample gyms, exercises, users
- **Debug Logging**: Enhanced error reporting
- **Performance Monitoring**: Query analysis

### Production
- **Security Hardening**: Minimal privilege access
- **Performance Optimization**: Query caching
- **Monitoring**: Real-time health checks

---

*Last Updated: 2025-01-06*
*Database Version: Latest Migration*