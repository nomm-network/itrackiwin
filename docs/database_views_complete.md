# Complete Database Views Documentation

## System Views (PostGIS)

### `geography_columns`
**Type**: System view
**Purpose**: PostGIS spatial data catalog for geography columns

### `geometry_columns` 
**Type**: System view
**Purpose**: PostGIS spatial data catalog for geometry columns

## Exercise & Movement Views

### `v_admin_exercises`
**Purpose**: Comprehensive exercise view for admin dashboard
**Columns**: 
- Exercise details with translations
- Equipment associations
- Muscle groups and movement patterns
- Configuration status
- Popularity rankings

```sql
SELECT e.id,
    e.slug,
    COALESCE(et.name, e.display_name, e.custom_display_name, e.slug) AS name,
    e.popularity_rank,
    e.is_public,
    e.configured,
    e.owner_user_id,
    eq.slug AS equipment_slug,
    COALESCE(eqt.name, eq.slug) AS equipment_name,
    bp.slug AS body_part_slug,
    COALESCE(bpt.name, bp.slug) AS body_part_name,
    mg.slug AS muscle_group_slug,
    COALESCE(mgt.name, mg.slug) AS muscle_group_name,
    mp.slug AS movement_pattern_slug,
    COALESCE(mpt.name, mp.slug) AS movement_pattern_name
FROM exercises e
LEFT JOIN exercises_translations et ON et.exercise_id = e.id AND et.language_code = 'en'
LEFT JOIN equipment eq ON eq.id = e.equipment_id
-- ... additional joins for translations and relationships
```

### `v_exercises_with_equipment`
**Purpose**: Exercise listings with equipment details
**Features**:
- Equipment specifications
- Load type information
- Weight configurations
- Grip options

### `v_exercise_muscle_targets`
**Purpose**: Exercise muscle activation mapping
**Features**:
- Primary muscle targets
- Secondary muscle involvement
- Activation percentages
- Grip-specific variations

## Workout & Performance Views

### `v_last_working_set`
**Purpose**: Most recent working sets per user/exercise
**Usage**: Performance tracking and progression planning

```sql
SELECT DISTINCT ON (w.user_id, we.exercise_id)
    w.user_id,
    we.exercise_id,
    ws.weight,
    ws.reps,
    ws.completed_at,
    w.started_at AS workout_date
FROM workouts w
JOIN workout_exercises we ON we.workout_id = w.id
JOIN workout_sets ws ON ws.workout_exercise_id = we.id
WHERE ws.is_completed = true
    AND ws.set_kind IN ('normal', 'top_set', 'backoff')
    AND w.ended_at IS NOT NULL
ORDER BY w.user_id, we.exercise_id, ws.completed_at DESC
```

### `mv_user_exercise_1rm` (Materialized View)
**Purpose**: Calculated 1RM estimates per user/exercise
**Refresh**: Daily
**Algorithm**: Epley formula with recent performance weighting

### `mv_last_set_per_user_exercise` (Materialized View)
**Purpose**: Latest set data with ranking
**Features**:
- Performance trends
- Volume calculations
- Ranking by recency

### `mv_pr_weight_per_user_exercise` (Materialized View)
**Purpose**: Personal records tracking
**Features**:
- All-time bests
- Date achieved
- Context information

### `v_workout_summary`
**Purpose**: Workout session overview
**Columns**:
- Total volume
- Exercise count
- Duration
- Average intensity

## User & Social Views

### `v_user_profiles_complete`
**Purpose**: Comprehensive user information
**Features**:
- Profile data
- Fitness preferences
- Goal settings
- Activity statistics

### `v_friendship_status`
**Purpose**: Social relationship management
**Features**:
- Connection status
- Mutual friends
- Privacy settings

### `v_user_achievements`
**Purpose**: Achievement progress tracking
**Features**:
- Unlocked achievements
- Progress toward goals
- Point totals

## Gym & Business Views

### `v_admin_mentors_overview`
**Purpose**: Mentor management dashboard
**Features**:
- Mentor profiles with user details
- Category assignments and status
- Gym associations
- Activity tracking

```sql
SELECT 
    mp.id,
    mp.user_id,
    u.email,
    mp.bio,
    mp.status,
    mp.created_at,
    -- Aggregated mentor statistics
    COUNT(DISTINCT m.client_user_id) as active_clients,
    AVG(m.rating) as average_rating
FROM mentor_profiles mp
LEFT JOIN users u ON u.id = mp.user_id
LEFT JOIN mentorships m ON m.mentor_id = mp.id
GROUP BY mp.id, mp.user_id, u.email, mp.bio, mp.status, mp.created_at
```

### `v_gym_equipment_inventory`
**Purpose**: Equipment management per gym
**Features**:
- Equipment availability
- Configuration status
- Maintenance schedules

### `v_ambassador_commission_summary`
**Purpose**: Ambassador earnings dashboard
**Features**:
- Monthly commission calculations
- Year-over-year comparisons
- Performance metrics
- Payment status tracking

### `v_gym_monthly_revenue`
**Purpose**: Financial performance tracking
**Features**:
- Revenue by period
- Member growth
- Service breakdowns

## Localization Views

### `v_categories_with_translations`
**Purpose**: Life categories with multi-language support
**Features**:
- Primary category data
- Translated names and descriptions
- Fallback to English when translation missing
- Display order and status

```sql
SELECT 
    c.id,
    c.slug,
    c.display_order,
    COALESCE(t.name, en.name) as name,
    COALESCE(t.description, en.description) as description,
    c.icon
FROM life_categories c
LEFT JOIN life_category_translations t ON t.category_id = c.id AND t.language_code = 'en'
LEFT JOIN life_category_translations en ON en.category_id = c.id AND en.language_code = 'en'
ORDER BY c.display_order
```

### `v_subcategories_with_translations`
**Purpose**: Life subcategories with translations
**Features**:
- Subcategory hierarchy
- Multi-language support
- Category relationship preservation
- Icon and ordering information

### `v_equipment_with_translations`
**Purpose**: Equipment catalog with localization
**Features**:
- Equipment specifications
- Translated descriptions
- Usage guidelines

## Analytics & Reporting Views

### `v_workout_analytics`
**Purpose**: Training pattern analysis
**Features**:
- Frequency patterns
- Volume trends
- Exercise popularity
- Progress indicators

### `v_exercise_popularity`
**Purpose**: Exercise usage statistics
**Features**:
- Usage frequency
- User adoption rates
- Trending exercises
- Category breakdowns

### `v_user_progress_trends`
**Purpose**: Long-term progress analysis
**Features**:
- Strength gains
- Volume progression
- Consistency metrics
- Goal achievement

## Readiness & Health Views

### `v_latest_readiness`
**Purpose**: Current readiness status per user
**Features**:
- Most recent scores
- Trend indicators
- Historical averages

### `v_readiness_trends`
**Purpose**: Readiness pattern analysis
**Features**:
- Weekly averages
- Factor correlations
- Predictive indicators

## System & Admin Views

### `v_data_quality_dashboard`
**Purpose**: Database health monitoring
**Features**:
- Missing data identification
- Integrity violations
- Performance metrics

### `v_admin_audit_summary`
**Purpose**: Administrative activity overview
**Features**:
- Action summaries
- User activity patterns
- Security events

## Performance Optimization

### Materialized View Refresh Strategy
- **Daily Refresh**: User statistics, 1RM calculations
- **Hourly Refresh**: Recent performance data
- **Real-time Views**: Current session data

### Indexing Strategy
- **Primary Keys**: All views based on indexed columns
- **Composite Indexes**: Multi-column filtering
- **Partial Indexes**: Filtered views for active data

### Query Optimization
- **Efficient Joins**: Minimized table relationships
- **Selective Filters**: Early data reduction
- **Cached Results**: Materialized complex calculations