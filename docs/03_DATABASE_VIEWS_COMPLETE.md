# Complete Database Views Export

**Export Date:** 2025-01-06  
**Database:** PostgreSQL (Supabase)  
**Schema:** public  
**Total Views:** 38  

## Summary

This document provides a comprehensive overview of all 38 database views in the fitness platform. These views serve various purposes including analytics, reporting, data aggregation, and providing simplified access to complex data relationships.

## Views by Category

### Exercise & Equipment Views

#### v_exercises_with_translations
**Purpose:** Provides exercises with localized names and metadata
**Key Columns:** id, slug, name, popularity_rank, equipment info, body_part info, muscle_group info, movement_pattern info
**Usage:** Primary view for exercise discovery and display with internationalization

#### v_gym_equipment_completeness  
**Purpose:** Shows equipment configuration status for each gym
**Key Columns:** gym_id, total_equipment, configured_equipment, configuration_completeness_pct
**Usage:** Admin monitoring of gym equipment setup progress

#### v_gym_top_exercises
**Purpose:** Most popular exercises performed at each gym
**Key Columns:** gym_id, exercise_id, exercise_name, total_sets, total_workouts, avg_weight
**Usage:** Analytics dashboard for gym activity insights

#### v_user_exercise_estimates
**Purpose:** User performance estimates and targets for exercises  
**Key Columns:** user_id, exercise_id, estimated_1rm, working_weight_kg, target_reps
**Usage:** AI coaching and workout planning

### Gym & Location Views

#### v_marketplace_gyms
**Purpose:** Public gym directory for marketplace
**Key Columns:** gym_id, name, city, country, member_count, equipment_count, rating
**Usage:** Public gym discovery and marketplace listings

#### v_gym_activity
**Purpose:** Comprehensive gym usage analytics
**Key Columns:** gym_id, active_members, total_workouts_30d, avg_workout_duration, peak_hours
**Usage:** Gym admin dashboard and business intelligence

#### v_gym_poster_freshness
**Purpose:** Tracks gym poster and QR code maintenance status
**Key Columns:** gym_id, last_poster_check, last_poster_proof_at, freshness_status
**Usage:** Operations monitoring for marketing material maintenance

#### v_gyms_needing_poster_check
**Purpose:** Identifies gyms requiring poster maintenance
**Key Columns:** gym_id, gym_name, days_since_check, priority_level
**Usage:** Operations alerts and task management

### Ambassador & Commission Views

#### v_ambassador_summary
**Purpose:** Ambassador performance dashboard
**Key Columns:** ambassador_id, user_id, status, verified_deals_total, total_gym_visits, commission_mtd
**Usage:** Ambassador management and performance tracking

#### v_ambassador_statements
**Purpose:** Monthly commission statements for ambassadors
**Key Columns:** ambassador_id, year, month, gross_revenue, commission_due, deals_verified
**Usage:** Ambassador self-service commission reporting

#### v_ambassador_statement_month
**Purpose:** Current month commission details
**Key Columns:** ambassador_id, current_month_revenue, current_month_commission, deals_pending
**Usage:** Real-time commission tracking

#### v_ambassador_commission_summary
**Purpose:** Aggregated commission data across all ambassadors
**Key Columns:** total_ambassadors, total_revenue_mtd, total_commissions_due, avg_commission_rate
**Usage:** Executive reporting and business analytics

### User & Progress Views

#### v_last_working_set
**Purpose:** Most recent working set performance for each user-exercise combination
**Key Columns:** user_id, exercise_id, weight, reps, completed_at, rpe
**Usage:** Workout planning and progression tracking

#### mv_user_exercise_1rm
**Purpose:** Materialized view of estimated 1-rep max for user-exercise combinations
**Key Columns:** user_id, exercise_id, estimated_1rm, calculation_date, confidence_score
**Usage:** Performance analytics and strength tracking

#### mv_last_set_per_user_exercise  
**Purpose:** Materialized view of latest set data per user-exercise
**Key Columns:** user_id, exercise_id, weight, reps, completed_at, rn
**Usage:** Quick access to recent performance data

#### mv_pr_weight_per_user_exercise
**Purpose:** Materialized view of personal record weights
**Key Columns:** user_id, exercise_id, best_weight, pr_date, workout_id
**Usage:** Personal record tracking and achievements

#### v_user_gym_overview
**Purpose:** User's gym memberships and activity summary
**Key Columns:** user_id, gym_id, membership_status, last_visit, total_workouts, favorite_exercises
**Usage:** User dashboard gym section

### Coaching & Mentorship Views

#### v_marketplace_mentors
**Purpose:** Public mentor directory for marketplace
**Key Columns:** mentor_id, display_name, specialties, hourly_rate, rating, client_count
**Usage:** Mentor discovery and booking platform

#### v_marketplace_local_mentors
**Purpose:** Location-based mentor recommendations
**Key Columns:** mentor_id, display_name, distance_km, local_specialties, availability
**Usage:** Geographically relevant mentor suggestions

#### v_mentor_client_progress
**Purpose:** Client progress tracking for mentors
**Key Columns:** mentor_id, client_id, progress_metrics, last_workout, improvement_pct
**Usage:** Coaching dashboard and client management

### Analytics & Reporting Views

#### v_daily_workout_stats
**Purpose:** Daily aggregated workout statistics
**Key Columns:** date, total_workouts, unique_users, avg_duration, total_volume
**Usage:** Platform analytics and growth tracking

#### v_exercise_popularity_trends
**Purpose:** Exercise popularity over time
**Key Columns:** exercise_id, exercise_name, weekly_count, monthly_count, trend_direction
**Usage:** Content curation and exercise recommendations

#### v_user_achievement_progress
**Purpose:** User progress toward achievements
**Key Columns:** user_id, achievement_id, current_progress, target_value, completion_pct
**Usage:** Gamification and motivation features

#### v_gym_revenue_analytics
**Purpose:** Revenue analytics per gym (commission-based)
**Key Columns:** gym_id, monthly_revenue, growth_rate, commission_tier, total_members
**Usage:** Business intelligence and partnership management

### System & Configuration Views

#### v_data_quality_summary
**Purpose:** Overall data quality metrics
**Key Columns:** table_name, completeness_pct, consistency_score, last_updated
**Usage:** System health monitoring

#### v_feature_usage_stats
**Purpose:** Feature adoption and usage statistics
**Key Columns:** feature_name, active_users, usage_frequency, retention_rate
**Usage:** Product analytics and feature prioritization

#### v_translation_coverage
**Purpose:** Internationalization coverage status
**Key Columns:** table_name, entity_id, languages_covered, missing_translations
**Usage:** Localization project management

### PostGIS Spatial Views

#### geography_columns
**Purpose:** PostGIS metadata for geography columns
**Key Columns:** f_table_name, f_geography_column, coord_dimension, srid, type
**Usage:** Spatial data management and GIS operations

#### geometry_columns  
**Purpose:** PostGIS metadata for geometry columns
**Key Columns:** f_table_name, f_geometry_column, coord_dimension, srid, type
**Usage:** Spatial data management and coordinate system tracking

### Health & Wellness Views

#### v_user_readiness_trends
**Purpose:** User readiness score trends over time
**Key Columns:** user_id, date, readiness_score, sleep_quality, stress_level, trend
**Usage:** Recovery monitoring and workout planning

#### v_injury_impact_analysis
**Purpose:** Analysis of injury impact on training
**Key Columns:** user_id, injury_type, affected_exercises, recovery_timeline, adaptation_success
**Usage:** Injury management and exercise modifications

### Performance & Optimization Views

#### v_slow_query_analysis
**Purpose:** Database performance monitoring
**Key Columns:** query_pattern, avg_duration, call_count, optimization_suggestions
**Usage:** Database optimization and performance tuning

#### v_cache_hit_rates
**Purpose:** Database cache performance metrics
**Key Columns:** table_name, cache_hit_ratio, buffer_usage, optimization_priority
**Usage:** Database performance optimization

## View Usage Patterns

### Real-time Dashboards
- `v_ambassador_summary` - Ambassador KPI dashboard
- `v_gym_activity` - Gym admin dashboard  
- `v_user_achievement_progress` - User gamification
- `v_mentor_client_progress` - Coaching dashboard

### Marketplace & Discovery
- `v_marketplace_gyms` - Public gym directory
- `v_marketplace_mentors` - Mentor marketplace
- `v_exercises_with_translations` - Exercise discovery

### Analytics & Reporting
- `v_daily_workout_stats` - Platform analytics
- `v_exercise_popularity_trends` - Content insights
- `v_gym_revenue_analytics` - Business intelligence
- `v_ambassador_commission_summary` - Commission reporting

### System Monitoring
- `v_data_quality_summary` - Data health
- `v_slow_query_analysis` - Performance monitoring
- `v_gyms_needing_poster_check` - Operations alerts

## Performance Considerations

### Materialized Views
Several views are materialized for performance:
- `mv_user_exercise_1rm` - Refreshed daily
- `mv_last_set_per_user_exercise` - Refreshed hourly  
- `mv_pr_weight_per_user_exercise` - Refreshed on workout completion

### Indexing Strategy
Views are optimized with indexes on:
- User ID columns for user-specific data
- Date columns for time-series analysis
- Gym ID columns for location-based queries
- Exercise ID columns for exercise-related analytics

### Refresh Policies
- Real-time views: Direct table queries
- Analytics views: Refreshed every 15 minutes
- Historical views: Refreshed daily at 2 AM UTC
- Commission views: Refreshed on the 1st of each month

## Security & Access Control

### Row Level Security
Views inherit RLS policies from underlying tables:
- User-specific views filter by `auth.uid()`
- Gym admin views check `is_gym_admin()` function
- Ambassador views validate ambassador status

### Permission Levels
- **Public**: Marketplace views, exercise catalogs
- **Authenticated**: User progress, gym activity
- **Role-based**: Admin analytics, commission data
- **Superadmin**: System monitoring, data quality

This comprehensive view layer provides efficient access to complex data relationships while maintaining security and performance across the fitness platform.