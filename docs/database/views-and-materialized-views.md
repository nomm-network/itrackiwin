# Database Views and Materialized Views Documentation

## Overview
This document details all views and materialized views in the database for performance optimization, data aggregation, and simplified querying.

## Standard Views

### User Performance Views

#### `v_last_working_set`
**Purpose**: Gets the most recent working set for each user-exercise combination
**Tables Involved**: `workouts`, `workout_exercises`, `workout_sets`
**Key Fields**:
- `user_id`, `exercise_id`, `weight`, `reps`, `workout_date`
**Usage**: AI program generation, progress tracking
**Performance**: Indexed on (user_id, exercise_id, completed_at)

#### `v_user_exercise_history`
**Purpose**: Complete exercise performance history per user
**Tables Involved**: `workouts`, `workout_exercises`, `workout_sets`
**Aggregations**: Progressive overload trends, volume calculations
**Usage**: Analytics, progress visualization

#### `v_user_workout_summary`
**Purpose**: Aggregated workout statistics per user
**Tables Involved**: `workouts`, `workout_exercises`, `workout_sets`
**Metrics**:
- Total workout count
- Average workout duration
- Total volume lifted
- Frequency patterns
**Usage**: User dashboards, progress reports

### Exercise and Equipment Views

#### `v_exercise_with_equipment`
**Purpose**: Exercises with their required equipment details
**Tables Involved**: `exercises`, `equipment`, junction tables
**Fields**: Exercise metadata with equipment specifications
**Usage**: Exercise selection, filtering by available equipment

#### `v_exercise_popularity`
**Purpose**: Exercise usage statistics across all users
**Aggregations**:
- Total times performed
- Unique users who performed
- Average ratings/feedback
**Usage**: Exercise recommendations, content curation

#### `v_equipment_utilization`
**Purpose**: Equipment usage patterns and demand
**Tables Involved**: `exercises`, `workout_exercises`, `equipment`
**Metrics**:
- Usage frequency per equipment
- Peak usage times
- User preferences
**Usage**: Gym management, equipment procurement

### AI Program Views

#### `v_ai_program_details`
**Purpose**: Complete AI program structure with nested data
**Tables Involved**: `ai_programs`, `ai_program_weeks`, `ai_program_workouts`, `ai_program_workout_exercises`
**Structure**: Hierarchical program representation
**Usage**: Program display, modification, templating

#### `v_user_program_progress`
**Purpose**: User progress through AI programs
**Tables Involved**: `ai_programs`, `user_program_progress`, `workouts`
**Metrics**:
- Completion percentage
- Adherence rates
- Performance improvements
**Usage**: Progress tracking, program adjustments

### Social and Community Views

#### `v_social_feed`
**Purpose**: Personalized social feed for users
**Tables Involved**: `social_posts`, `social_friendships`, `users`, `workouts`
**Logic**:
- Friend posts
- Public posts from followed users
- Workout achievements
- Challenge updates
**Usage**: Main social feed, engagement tracking

#### `v_user_social_stats`
**Purpose**: Social engagement metrics per user
**Aggregations**:
- Post count and likes received
- Friend count and connections
- Challenge participation
- Community engagement score
**Usage**: Social profile pages, leaderboards

#### `v_challenge_leaderboards`
**Purpose**: Real-time challenge rankings
**Tables Involved**: `challenges`, `challenge_participants`, performance metrics
**Calculations**:
- Current standings
- Progress percentages
- Time remaining
**Usage**: Challenge pages, notifications

### Gym and Location Views

#### `v_gym_with_equipment`
**Purpose**: Gyms with their available equipment
**Tables Involved**: `gyms`, `user_gyms`, `user_gym_plates`, `equipment`
**Usage**: Gym selection, equipment-based workout planning

#### `v_user_gym_access`
**Purpose**: User's gym memberships and equipment access
**Tables Involved**: `users`, `user_gyms`, `gyms`, equipment tables
**Usage**: Workout planning, exercise filtering

### Administrative Views

#### `v_user_activity_summary`
**Purpose**: User engagement and activity metrics
**Aggregations**:
- Login frequency
- Workout frequency
- Feature usage patterns
- Last activity dates
**Usage**: User retention analysis, engagement optimization

#### `v_system_health_metrics`
**Purpose**: Overall system usage and health indicators
**Metrics**:
- Active user counts
- Error rates
- Performance metrics
- Feature adoption rates
**Usage**: System monitoring, business intelligence

## Materialized Views

### Performance-Critical Materialized Views

#### `mv_user_exercise_1rm`
**Purpose**: Pre-calculated one-rep max estimates for all user-exercise combinations
**Refresh**: Daily via cron job
**Tables**: `workout_sets`, `exercises`, using Epley formula
**Benefits**: Instant 1RM lookups for AI program generation
**Storage**: ~100MB for 1M+ user-exercise combinations

#### `mv_exercise_performance_trends`
**Purpose**: Pre-aggregated performance trends and statistics
**Refresh**: Weekly
**Calculations**:
- Progressive overload trends
- Plateau detection indicators
- Volume progressions
- Strength improvements
**Usage**: Advanced analytics, coaching insights

#### `mv_user_workout_patterns`
**Purpose**: User workout behavior patterns and preferences
**Refresh**: Daily
**Analysis**:
- Preferred workout days/times
- Exercise selection patterns
- Session duration trends
- Rest period preferences
**Usage**: AI program personalization, scheduling optimization

#### `mv_equipment_demand_forecast`
**Purpose**: Equipment usage predictions for gym planning
**Refresh**: Weekly
**Calculations**:
- Historical usage patterns
- Seasonal variations
- Growth projections
- Peak demand times
**Usage**: Gym operations, equipment planning

### Aggregation Materialized Views

#### `mv_daily_user_metrics`
**Purpose**: Daily rolled-up user activity metrics
**Refresh**: Hourly
**Dimensions**: Date, user demographics, activity types
**Measures**: Workout counts, duration, volume, engagement
**Usage**: Daily reporting, trend analysis

#### `mv_exercise_effectiveness_scores`
**Purpose**: Exercise effectiveness based on user outcomes
**Refresh**: Weekly
**Calculations**:
- Progress rates per exercise
- User satisfaction scores
- Injury/dropout rates
- Adaptation effectiveness
**Usage**: Exercise recommendations, program optimization

#### `mv_social_engagement_metrics`
**Purpose**: Social feature usage and engagement patterns
**Refresh**: Daily
**Metrics**:
- Post engagement rates
- Friend connection patterns
- Challenge participation
- Community activity levels
**Usage**: Social feature optimization, community management

## View Refresh Strategies

### Real-Time Views (Standard Views)
- Updated immediately with underlying data changes
- No refresh required
- Performance depends on underlying table indexes
- Used for current/live data requirements

### Near Real-Time (Hourly Refresh)
- `mv_daily_user_metrics`
- Critical for operational dashboards
- Acceptable 1-hour data lag
- Refresh during low-traffic periods

### Daily Refresh
- `mv_user_exercise_1rm`
- `mv_user_workout_patterns`
- Balance between freshness and performance
- Refresh at 2 AM UTC

### Weekly Refresh
- `mv_exercise_performance_trends`
- `mv_equipment_demand_forecast`
- `mv_exercise_effectiveness_scores`
- Data changes slowly, weekly refresh sufficient
- Refresh on Sunday nights

## Performance Impact

### Storage Requirements
- Materialized views: ~500MB total storage
- Indexes on materialized views: ~200MB additional
- Refresh temporary space: ~1GB peak usage

### Refresh Performance
- Hourly refreshes: 2-5 minutes
- Daily refreshes: 10-30 minutes
- Weekly refreshes: 1-2 hours
- All refreshes scheduled during low-traffic periods

### Query Performance Improvements
- 1RM lookups: 1000x faster (20ms vs 20s)
- Complex analytics: 100x faster
- User dashboards: 50x faster
- Social feeds: 10x faster

## Monitoring and Maintenance

### Refresh Monitoring
- Automated alerts for failed refreshes
- Performance monitoring for refresh duration
- Data quality checks post-refresh
- Rollback procedures for failed refreshes

### Usage Analytics
- Query performance metrics per view
- Most frequently accessed views
- Slow query identification
- Index usage statistics

### Maintenance Tasks
- Weekly refresh schedule optimization
- Monthly storage usage review
- Quarterly view usage analysis
- Annual view design review

## Security Considerations

### Row Level Security on Views
- Standard views inherit RLS from underlying tables
- Materialized views require separate RLS policies
- User isolation maintained in all views
- Admin-only views for sensitive aggregations

### Data Privacy in Aggregations
- No individual user identification in aggregate views
- Minimum threshold requirements for showing data
- Anonymization of sensitive metrics
- GDPR compliance in all view designs

## Development Guidelines

### Creating New Views
1. Assess if standard view is sufficient for performance
2. Consider materialized view for complex aggregations
3. Define appropriate refresh schedule
4. Implement proper indexing strategy
5. Add monitoring and alerting
6. Document usage and maintenance requirements

### Best Practices
- Use meaningful naming conventions (v_ for views, mv_ for materialized views)
- Include creation and refresh timestamps in materialized views
- Implement incremental refresh where possible
- Optimize refresh queries for performance
- Test refresh procedures thoroughly
- Document dependencies and impact of changes

---

**Note**: View definitions and refresh schedules should be regularly reviewed and optimized based on actual usage patterns and performance requirements.