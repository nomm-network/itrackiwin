# Complete Database Views Documentation 2025

**Generated**: January 10, 2025  
**Database**: PostgreSQL (Supabase)  
**Schema**: public  

## Overview

This document provides a comprehensive catalog of all database views in the fitness platform. Views are organized by functional area and serve as the primary data access layer for complex queries and reporting.

## View Categories

### System Views (PostGIS)
- **Total**: 2 views
- **Purpose**: Spatial data catalog and geographic operations

### Application Views  
- **Total**: 34 views
- **Purpose**: Business logic, reporting, and data aggregation

## System Views (PostGIS Spatial)

### `geography_columns`
**Type**: System View  
**Purpose**: PostGIS spatial data catalog for geography columns  
**Usage**: Spatial reference system management

### `geometry_columns`
**Type**: System View  
**Purpose**: PostGIS spatial data catalog for geometry columns  
**Usage**: Geometric data type definitions and constraints

## Exercise & Equipment Views

### `v_admin_exercises`
**Type**: Application View  
**Purpose**: Comprehensive exercise view for administrative dashboard  
**Key Features**:
- Exercise details with translations
- Equipment relationships
- Muscle group mappings
- Movement pattern analysis
- Data quality indicators

### `v_exercises_with_translations`
**Type**: Application View  
**Purpose**: Exercises with multi-language support  
**Key Features**:
- Primary exercise data
- Translated names and descriptions
- Fallback to English for missing translations
- Equipment and muscle information

### `v_exercise_last_set`
**Type**: Application View  
**Purpose**: Most recent set data per user/exercise combination  
**Usage**: Performance tracking and progression analysis

### `v_equipment_with_translations`
**Type**: Application View  
**Purpose**: Equipment catalog with localization  
**Key Features**:
- Equipment specifications
- Multi-language names and descriptions
- Loading configurations
- Default settings

### `v_equipment_effective`
**Type**: Application View  
**Purpose**: Equipment effectiveness analysis  
**Usage**: Equipment utilization and performance metrics

### `v_effective_equipment`
**Type**: Application View  
**Purpose**: Cross-reference of effective equipment usage  
**Usage**: Equipment recommendation engine

## Workout & Performance Views

### `v_current_workout`
**Type**: Application View  
**Purpose**: Active workout session data  
**Key Features**:
- Current workout status
- Exercise progression
- Set completion tracking
- Real-time performance metrics

### `v_last_working_set`
**Type**: Application View  
**Purpose**: Latest working set per user/exercise  
**Usage**: Weight progression and performance tracking  
**Key Columns**:
- user_id, exercise_id
- weight, reps, completed_at
- Performance trends

### `v_workout_sets_display`
**Type**: Application View  
**Purpose**: Formatted workout set data for UI display  
**Key Features**:
- Human-readable set information
- Completion status
- Performance indicators
- UI-optimized formatting

### `v_workout_has_checkin`
**Type**: Application View  
**Purpose**: Workout sessions with readiness check-in status  
**Usage**: Readiness correlation analysis

### `v_pre_checkin_exists`
**Type**: Application View  
**Purpose**: Pre-workout check-in existence verification  
**Usage**: Workflow validation and completion tracking

## User & Profile Views

### `v_user_default_gym`
**Type**: Application View  
**Purpose**: User's primary gym assignment  
**Key Features**:
- Default gym selection
- Membership status
- Access permissions

### `v_user_pins_expanded`
**Type**: Application View  
**Purpose**: User's pinned life subcategories with full details  
**Key Features**:
- Pinned category information
- Category hierarchy
- User preferences

## Gym & Location Views

### `v_gym_activity`
**Type**: Application View  
**Purpose**: Gym activity and usage statistics  
**Key Features**:
- Member activity levels
- Equipment utilization
- Peak usage times
- Performance metrics

### `v_gym_equipment_completeness`
**Type**: Application View  
**Purpose**: Gym equipment inventory completeness assessment  
**Usage**: Equipment gap analysis and planning

### `v_gym_poster_freshness`
**Type**: Application View  
**Purpose**: Gym poster/content freshness tracking  
**Usage**: Content management and update scheduling

### `v_gym_top_exercises`
**Type**: Application View  
**Purpose**: Most popular exercises per gym  
**Key Features**:
- Exercise popularity rankings
- Gym-specific preferences
- Usage frequency analysis

### `v_gyms_needing_poster_check`
**Type**: Application View  
**Purpose**: Gyms requiring poster/content updates  
**Usage**: Maintenance workflow and content management

### `v_city_gyms_with_stats`
**Type**: Application View  
**Purpose**: City-level gym statistics and distribution  
**Key Features**:
- Geographic gym distribution
- City-level metrics
- Market analysis data

### `v_marketplace_gyms`
**Type**: Application View  
**Purpose**: Gym marketplace listings with details  
**Key Features**:
- Public gym information
- Amenity listings
- Location data
- Contact information

## Ambassador & Business Views

### `v_ambassador_commission_summary`
**Type**: Application View  
**Purpose**: Ambassador earnings and commission dashboard  
**Key Features**:
- Monthly commission calculations
- Year-over-year comparisons
- Performance metrics
- Payment status tracking

### `v_ambassador_statement_month`
**Type**: Application View  
**Purpose**: Monthly ambassador statement data  
**Usage**: Financial reporting and commission tracking

### `v_ambassador_statements`
**Type**: Application View  
**Purpose**: Comprehensive ambassador financial statements  
**Key Features**:
- Historical earnings data
- Commission breakdowns
- Payment history

### `v_ambassador_summary`
**Type**: Application View  
**Purpose**: High-level ambassador performance overview  
**Key Features**:
- Performance KPIs
- Achievement tracking
- Activity summaries

## Coaching & Mentorship Views

### `v_admin_mentors_overview`
**Type**: Application View  
**Purpose**: Mentor management dashboard  
**Key Features**:
- Mentor profiles with user details
- Category assignments and specializations
- Gym associations
- Activity tracking
- Client management

### `v_coach_clients`
**Type**: Application View  
**Purpose**: Coach-client relationship management  
**Key Features**:
- Client lists per coach
- Relationship status
- Progress tracking
- Communication history

### `v_marketplace_mentors`
**Type**: Application View  
**Purpose**: Public mentor marketplace listings  
**Key Features**:
- Mentor profiles
- Specializations
- Availability
- Ratings and reviews

### `v_marketplace_local_mentors`
**Type**: Application View  
**Purpose**: Location-specific mentor listings  
**Usage**: Local mentor discovery and matching

### `v_public_mentors`
**Type**: Application View  
**Purpose**: Publicly available mentor profiles  
**Key Features**:
- Verified mentor information
- Specialization areas
- Contact details

## Localization & Translation Views

### `v_categories_with_translations`
**Type**: Application View  
**Purpose**: Life categories with multi-language support  
**Key Features**:
- Primary category data
- Translated names and descriptions
- Fallback to English when translation missing
- Display order and status

### `v_subcategories_with_translations`
**Type**: Application View  
**Purpose**: Life subcategories with translations  
**Key Features**:
- Subcategory hierarchy
- Multi-language support
- Category relationship preservation

### `v_body_parts_with_translations`
**Type**: Application View  
**Purpose**: Body parts with localized names  
**Usage**: Exercise targeting and anatomy education

### `v_muscle_groups_with_translations`
**Type**: Application View  
**Purpose**: Muscle groups with multi-language support  
**Usage**: Exercise categorization and targeting

### `v_muscles_with_translations`
**Type**: Application View  
**Purpose**: Individual muscles with translations  
**Usage**: Detailed anatomy and exercise targeting

### `v_workout_templates_with_translations`
**Type**: Application View  
**Purpose**: Workout templates with localized content  
**Key Features**:
- Template metadata
- Translated descriptions
- Exercise translations

## Health & Readiness Views

### `v_latest_readiness`
**Type**: Application View  
**Purpose**: Most recent readiness scores per user  
**Key Features**:
- Current readiness status
- Trend indicators
- Historical context
- Alert thresholds

### `v_health_subs`
**Type**: Application View  
**Purpose**: Health-related subscription data  
**Usage**: Premium feature access and health tracking

## View Usage Patterns

### Real-time Dashboards
- `v_current_workout` - Active session monitoring
- `v_gym_activity` - Live facility usage
- `v_latest_readiness` - Current health status

### Marketplace Discovery
- `v_marketplace_gyms` - Facility discovery
- `v_marketplace_mentors` - Coach finding
- `v_marketplace_local_mentors` - Local services

### Analytics & Reporting
- `v_ambassador_commission_summary` - Financial analytics
- `v_gym_equipment_completeness` - Operational metrics
- `v_exercise_last_set` - Performance analytics

### Administrative Management
- `v_admin_exercises` - Content management
- `v_admin_mentors_overview` - User management
- `v_gyms_needing_poster_check` - Maintenance workflows

### Internationalization
- `v_*_with_translations` - Multi-language content
- Fallback mechanisms for missing translations
- Consistent localization patterns

## Performance Considerations

### Materialized Views
- Views with `mv_` prefix are materialized for performance
- Refreshed on schedule or data changes
- Used for expensive aggregations

### Indexing Strategy
- Critical view columns are indexed
- Composite indexes for common query patterns
- Partial indexes for filtered views

### Refresh Policies
- Real-time views updated via triggers
- Batch views refreshed periodically
- On-demand refresh for administrative views

## Security & Access Control

### Row Level Security
- All views respect underlying table RLS policies
- User-specific data filtering
- Role-based access control

### Permission Levels
- **Public Views**: Available to all users
- **User Views**: Personal data only
- **Admin Views**: Administrative access required
- **System Views**: Database management

All views are designed for optimal performance while maintaining data security and providing comprehensive access to the platform's business intelligence needs.