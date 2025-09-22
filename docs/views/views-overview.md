# Database Views Overview

Complete documentation of all database views for reporting, analytics, and data aggregation.

## 📊 System Views

### `geography_columns` & `geometry_columns`
**Purpose**: PostGIS spatial data catalog views
**Type**: System views for geographic data types

### `v_admin_exercises`
**Purpose**: Comprehensive exercise view for admin dashboard
**Columns**: Exercise details with translations, equipment, muscles, movement patterns
**Usage**: Admin exercise management and data quality reports

### `v_admin_mentors_overview`
**Purpose**: Mentor management dashboard view
**Features**:
- Mentor profiles with user details
- Category assignments and status
- Gym associations
- Activity tracking

## 🏋️‍♀️ Exercise & Workout Views

### Exercise Performance Views
- `v_last_working_set` - Most recent working sets per user/exercise
- `mv_user_exercise_1rm` - Calculated 1RM estimates
- `mv_last_set_per_user_exercise` - Latest set data with ranking
- `mv_pr_weight_per_user_exercise` - Personal records tracking

### Workout Analytics Views
- Workout volume and frequency analysis
- Exercise popularity and usage statistics
- Progress tracking over time
- Performance trend analysis

## 💰 Business Intelligence Views

### `v_ambassador_commission_summary`
**Purpose**: Ambassador earnings dashboard
**Features**:
- Monthly commission calculations
- Year-over-year comparisons
- Performance metrics
- Payment status tracking

### Revenue & Analytics Views
- `gym_monthly_revenue` aggregations
- User subscription analytics
- Feature usage statistics
- Conversion tracking

## 📈 Localization Views

### `v_categories_with_translations`
**Purpose**: Life categories with multi-language support
**Features**:
- Primary category data
- Translated names and descriptions
- Fallback to English when translation missing
- Display order and status

### `v_subcategories_with_translations`
**Purpose**: Life subcategories with translations
**Features**:
- Subcategory hierarchy
- Multi-language support
- Category relationship preservation

## 🔧 Usage Patterns

Views are optimized for:
- **Dashboard Queries**: Pre-aggregated data for fast loading
- **Reporting**: Complex joins simplified into single views
- **API Responses**: Consistent data structure across endpoints
- **Analytics**: Historical trend analysis and KPI calculation

## 🚀 Performance Features

- **Materialized Views**: For expensive calculations (mv_* prefix)
- **Indexed Views**: Critical columns indexed for fast queries
- **Refresh Strategies**: Automated updates for real-time data
- **Partitioning**: Large datasets split for better performance