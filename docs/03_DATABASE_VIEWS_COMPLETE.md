# Complete Database Views Documentation

**Export Date:** 2025-01-08  
**Database:** PostgreSQL (Supabase)  
**Schema:** public  
**Total Views:** 38

## Overview

This document provides a comprehensive overview of all database views in the PostgreSQL (Supabase) fitness platform. Views are used for complex data aggregation, reporting, analytics, and providing simplified interfaces to complex table relationships.

## Complete View Catalog

### 1. geography_columns
**Type:** PostGIS System View
**Purpose:** PostGIS geographic column metadata
**Key Columns:** Geographic column definitions and spatial reference systems
**Usage:** PostGIS spatial data management and geographic operations

### 2. geometry_columns
**Type:** PostGIS System View
**Purpose:** PostGIS geometry column metadata
**Key Columns:** Geometry column definitions and coordinate systems
**Usage:** PostGIS spatial data management and geometric operations

### 3. v_admin_exercises
**Type:** Administrative View
**Purpose:** Administrative overview of exercises with management data
**Key Columns:** Exercise details, usage statistics, quality metrics
**Usage:** Admin dashboard for exercise management and quality control

### 4. v_admin_mentors_overview
**Type:** Administrative View
**Purpose:** Administrative overview of mentors and their performance
**Key Columns:** Mentor profiles, client counts, activity metrics
**Usage:** Admin dashboard for mentor management and performance tracking

### 5. v_ambassador_commission_summary
**Type:** Commission Analytics
**Purpose:** Summary of ambassador commission data
**Key Columns:** Ambassador info, total commissions, performance metrics
**Usage:** Ambassador performance tracking and commission reporting

### 6. v_ambassador_statement_month
**Type:** Commission Reporting
**Purpose:** Monthly commission statements for ambassadors
**Key Columns:** Monthly breakdown, commission details, period totals
**Usage:** Monthly commission statement generation

### 7. v_ambassador_statements
**Type:** Commission Reporting
**Purpose:** Comprehensive ambassador commission statements
**Key Columns:** Commission history, payment details, performance data
**Usage:** Ambassador commission reporting and payment processing

### 8. v_ambassador_summary
**Type:** Ambassador Analytics
**Purpose:** High-level ambassador performance summary
**Key Columns:** Ambassador metrics, deal counts, visit statistics
**Usage:** Ambassador performance dashboards and KPI tracking

### 9. v_body_parts_with_translations
**Type:** Localization View
**Purpose:** Body parts with localized translations
**Key Columns:** body_part_id, slug, localized names and descriptions
**Usage:** Multi-language body part selection and display

### 10. v_categories_with_translations
**Type:** Localization View
**Purpose:** Life categories with localized translations
**Key Columns:** category_id, slug, localized names and descriptions
**Usage:** Multi-language category display and selection

### 11. v_city_gyms_with_stats
**Type:** Geographic Analytics
**Purpose:** City-level gym statistics and aggregations
**Key Columns:** City info, gym counts, member statistics
**Usage:** Geographic gym distribution analysis and city reports

### 12. v_coach_clients
**Type:** Coaching View
**Purpose:** Coach-client relationship overview
**Key Columns:** Coach info, client details, relationship status
**Usage:** Coach dashboard for client management

### 13. v_current_workout
**Type:** Real-time View
**Purpose:** User's currently active workout session
**Key Columns:** Workout details, current exercise, progress metrics
**Usage:** Live workout tracking and real-time updates

### 14. v_effective_equipment
**Type:** Equipment View
**Purpose:** Equipment with effective configurations and defaults
**Key Columns:** Equipment specs, default settings, availability
**Usage:** Equipment selection and configuration management

### 15. v_equipment_effective
**Type:** Equipment View (Alternative)
**Purpose:** Alternative equipment effectiveness view
**Key Columns:** Equipment ratings, usage patterns, effectiveness scores
**Usage:** Equipment recommendation and optimization

### 16. v_equipment_with_translations
**Type:** Localization View
**Purpose:** Equipment with localized translations
**Key Columns:** equipment_id, slug, localized names and descriptions
**Usage:** Multi-language equipment display and selection

### 17. v_exercise_last_set
**Type:** Exercise Analytics
**Purpose:** Last performed set for each exercise per user
**Key Columns:** Exercise info, last set details, performance metrics
**Usage:** Exercise progress tracking and recommendation engines

### 18. v_exercises_with_translations
**Type:** Localization View
**Purpose:** Exercises with localized translations and metadata
**Key Columns:** exercise_id, slug, localized names, difficulty, equipment
**Usage:** Multi-language exercise catalog and search functionality

### 19. v_gym_activity
**Type:** Gym Analytics
**Purpose:** Gym activity levels and usage patterns
**Key Columns:** Gym info, visit counts, activity trends
**Usage:** Gym performance tracking and usage analytics

### 20. v_gym_equipment_completeness
**Type:** Gym Analytics
**Purpose:** Gym equipment inventory completeness assessment
**Key Columns:** Gym info, equipment coverage, completeness scores
**Usage:** Gym equipment audit and improvement recommendations

### 21. v_gym_poster_freshness
**Type:** Gym Quality Control
**Purpose:** Gym poster/marketing material freshness tracking
**Key Columns:** Gym info, last poster check, freshness status
**Usage:** Gym marketing material quality assurance

### 22. v_gym_top_exercises
**Type:** Gym Analytics
**Purpose:** Most popular exercises performed at each gym
**Key Columns:** Gym info, exercise popularity, usage statistics
**Usage:** Gym-specific exercise recommendations and equipment planning

### 23. v_gyms_needing_poster_check
**Type:** Quality Control
**Purpose:** Gyms requiring poster/marketing material verification
**Key Columns:** Gym info, last check date, urgency level
**Usage:** Quality control workflow and maintenance scheduling

### 24. v_last_working_set
**Type:** Performance View
**Purpose:** Last working set performed per exercise per user
**Key Columns:** User info, exercise details, last performance metrics
**Usage:** Progress tracking and performance comparison

### 25. v_latest_readiness
**Type:** Health Tracking
**Purpose:** Latest readiness scores and health metrics per user
**Key Columns:** User info, readiness scores, health indicators
**Usage:** Readiness-based training recommendations

### 26. v_marketplace_gyms
**Type:** Marketplace View
**Purpose:** Public gym catalog for marketplace display
**Key Columns:** Gym profiles, amenities, ratings, public information
**Usage:** Public gym directory and search functionality

### 27. v_marketplace_local_mentors
**Type:** Marketplace View
**Purpose:** Local mentor discovery based on user location
**Key Columns:** Mentor profiles, location data, availability
**Usage:** Location-based mentor recommendations

### 28. v_marketplace_mentors
**Type:** Marketplace View
**Purpose:** Public mentor catalog for marketplace display
**Key Columns:** Mentor profiles, specializations, ratings, availability
**Usage:** Public mentor directory and search functionality

### 29. v_muscle_groups_with_translations
**Type:** Localization View
**Purpose:** Muscle groups with localized translations
**Key Columns:** muscle_group_id, slug, localized names and descriptions
**Usage:** Multi-language muscle group display and selection

### 30. v_muscles_with_translations
**Type:** Localization View
**Purpose:** Individual muscles with localized translations
**Key Columns:** muscle_id, slug, localized names and descriptions
**Usage:** Multi-language muscle targeting and anatomy displays

### 31. v_pre_checkin_exists
**Type:** Workflow View
**Purpose:** Check if user has completed pre-workout checkin
**Key Columns:** User info, checkin status, completion timestamps
**Usage:** Workout flow control and checkin requirement enforcement

### 32. v_public_mentors
**Type:** Public Directory
**Purpose:** Publicly visible mentor profiles
**Key Columns:** Mentor info, public profiles, contact information
**Usage:** Public mentor discovery and initial contact

### 33. v_subcategories_with_translations
**Type:** Localization View
**Purpose:** Life subcategories with localized translations
**Key Columns:** subcategory_id, slug, localized names and descriptions
**Usage:** Multi-language subcategory display and organization

### 34. v_user_default_gym
**Type:** User Preference View
**Purpose:** User's default/primary gym selection
**Key Columns:** User info, default gym details, preference settings
**Usage:** Gym-specific features and default selections

### 35. v_user_pins_expanded
**Type:** User Interface View
**Purpose:** User's pinned categories with full details
**Key Columns:** User info, pinned categories, category details
**Usage:** Personalized category display and quick access

### 36. v_workout_has_checkin
**Type:** Workflow View
**Purpose:** Check if workout session has associated checkins
**Key Columns:** Workout info, checkin status, completion flags
**Usage:** Workout flow validation and progress tracking

### 37. v_workout_sets_display
**Type:** Workout View
**Purpose:** Formatted workout sets for display purposes
**Key Columns:** Set details, formatted values, display-ready data
**Usage:** Workout history display and progress visualization

### 38. v_workout_templates_with_translations
**Type:** Localization View
**Purpose:** Workout templates with localized translations
**Key Columns:** template_id, slug, localized names and descriptions
**Usage:** Multi-language template catalog and selection

## View Categories

### Exercise & Equipment Views (6 views)
- `v_exercises_with_translations` - Localized exercise catalog
- `v_exercise_last_set` - Performance tracking
- `v_gym_top_exercises` - Gym-specific popularity
- `v_equipment_with_translations` - Localized equipment catalog
- `v_effective_equipment` - Equipment configurations
- `v_equipment_effective` - Equipment effectiveness

### Gym & Location Views (6 views)
- `v_marketplace_gyms` - Public gym directory
- `v_gym_activity` - Activity analytics
- `v_gym_equipment_completeness` - Equipment auditing
- `v_gym_poster_freshness` - Quality control
- `v_gyms_needing_poster_check` - Maintenance workflow
- `v_city_gyms_with_stats` - Geographic analytics

### Ambassador & Commission Views (4 views)
- `v_ambassador_summary` - Performance overview
- `v_ambassador_commission_summary` - Commission analytics
- `v_ambassador_statements` - Commission reporting
- `v_ambassador_statement_month` - Monthly statements

### User & Progress Views (6 views)
- `v_last_working_set` - Performance tracking
- `v_latest_readiness` - Health monitoring
- `v_user_default_gym` - User preferences
- `v_user_pins_expanded` - Personalized interface
- `v_current_workout` - Real-time tracking
- `v_pre_checkin_exists` - Workflow validation

### Coaching & Mentorship Views (4 views)
- `v_marketplace_mentors` - Public mentor directory
- `v_marketplace_local_mentors` - Location-based discovery
- `v_public_mentors` - Public profiles
- `v_coach_clients` - Client management

### Localization Views (8 views)
- `v_exercises_with_translations` - Exercise translations
- `v_equipment_with_translations` - Equipment translations
- `v_body_parts_with_translations` - Body part translations
- `v_muscle_groups_with_translations` - Muscle group translations
- `v_muscles_with_translations` - Individual muscle translations
- `v_categories_with_translations` - Category translations
- `v_subcategories_with_translations` - Subcategory translations
- `v_workout_templates_with_translations` - Template translations

### Administrative Views (2 views)
- `v_admin_exercises` - Exercise management
- `v_admin_mentors_overview` - Mentor management

### Workflow & Validation Views (3 views)
- `v_pre_checkin_exists` - Checkin validation
- `v_workout_has_checkin` - Workflow validation
- `v_workout_sets_display` - Display formatting

### PostGIS Spatial Views (2 views)
- `geography_columns` - Geographic metadata
- `geometry_columns` - Geometric metadata

## Usage Patterns

### Real-time Dashboards
- `v_current_workout` - Live workout tracking
- `v_latest_readiness` - Health monitoring
- `v_gym_activity` - Real-time gym analytics

### Marketplace Discovery
- `v_marketplace_gyms` - Gym discovery
- `v_marketplace_mentors` - Mentor discovery
- `v_marketplace_local_mentors` - Location-based recommendations

### Analytics & Reporting
- `v_ambassador_commission_summary` - Commission analytics
- `v_gym_equipment_completeness` - Equipment auditing
- `v_gym_top_exercises` - Usage analytics

### Administrative Management
- `v_admin_exercises` - Exercise management
- `v_admin_mentors_overview` - Mentor oversight
- `v_gyms_needing_poster_check` - Quality control

### Internationalization
- All `*_with_translations` views - Multi-language support
- Localized content delivery
- Cultural adaptation features

## Performance Considerations

### Materialized Views
The system includes several materialized views for performance-critical operations:
- Complex aggregations pre-computed
- Periodic refresh for data consistency
- Optimized for read-heavy workloads

### Indexing Strategy
- Views leverage underlying table indexes
- Computed columns for frequently filtered data
- Spatial indexes for geographic views

### Refresh Policies
- Real-time views: Updated on data change
- Analytics views: Scheduled refresh (hourly/daily)
- Reporting views: On-demand refresh

### Query Optimization
- Views designed for specific use cases
- Optimized join patterns
- Minimal data transformation in views

## Security & Access Control

### Row Level Security
- Views inherit RLS policies from underlying tables
- Additional view-specific security where needed
- User context preserved through view layers

### Permission Levels
- **Public:** Marketplace and directory views
- **Authenticated:** User-specific and general platform views
- **Role-based:** Administrative and management views
- **Superadmin:** System monitoring and quality control views

## Maintenance Notes

### View Dependencies
- Views may depend on other views or functions
- Changes to underlying tables require view updates
- Dependency tracking for safe schema changes

### Version Control
- View definitions stored in migration files
- Versioned changes for schema evolution
- Rollback capabilities for view modifications

### Documentation
- Each view documented with purpose and usage
- Example queries and common use cases
- Performance characteristics and limitations

### Monitoring
- Query performance monitoring
- Usage analytics for optimization
- Error tracking and alerting

This view system provides a comprehensive data access layer that supports all aspects of the fitness platform while maintaining performance, security, and usability.