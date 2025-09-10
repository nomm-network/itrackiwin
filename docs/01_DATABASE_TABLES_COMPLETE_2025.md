# Complete Database Schema Documentation
*Generated: 2025-01-10*

## Overview
This document provides a comprehensive overview of all database tables in the fitness platform PostgreSQL database.

## System Statistics
- **Total Tables**: 150+ tables
- **Views**: 25+ views including materialized views
- **Functions**: 200+ stored procedures and functions
- **Enums**: 24 custom types
- **RLS Policies**: Comprehensive row-level security implementation

## Core Tables by Category

### 🏋️ Exercise & Movement System
- `exercises` - Core exercise definitions
- `exercise_aliases` - Alternative names for exercises
- `exercise_equipment_variants` - Equipment variations
- `exercise_grip_effects` - Grip impact on muscle activation
- `exercise_grips` - Available grips per exercise
- `exercise_handle_orientations` - Handle positioning options
- `exercise_images` - Exercise demonstration media
- `exercise_metric_defs` - Custom metrics per exercise
- `exercise_similars` - Related exercise recommendations
- `movements` - Movement pattern definitions
- `movement_patterns` - Biomechanical movement categories

### 🏃 Workout & Training System
- `workouts` - Workout sessions
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets and reps
- `workout_set_metric_values` - Custom metric tracking
- `workout_set_grips` - Grip selections per set
- `workout_templates` - Reusable workout plans
- `template_exercises` - Exercise configurations in templates
- `workout_checkins` - Pre/post workout assessments
- `readiness_checkins` - Daily readiness assessments

### 👤 User Management
- `users` - User profiles and settings
- `user_roles` - Role assignments
- `user_preferences` - Individual preferences
- `user_profile_fitness` - Fitness-specific profile data
- `user_pinned_subcategories` - Personalized quick access
- `friendships` - Social connections

### 🏢 Gym Management
- `gyms` - Gym facility information
- `gym_admins` - Gym administrative roles
- `gym_equipment` - Equipment inventory per gym
- `gym_memberships` - User gym associations
- `gym_monthly_revenue` - Financial tracking
- `gym_role_requests` - Access requests

### 📊 Progress & Analytics
- `user_achievements` - Achievement unlocks
- `user_exercise_estimates` - Performance predictions
- `user_exercise_analytics` - Historical performance data
- `mv_user_exercise_1rm` - Calculated one-rep maximums
- `mv_last_set_per_user_exercise` - Latest performance tracking
- `mv_pr_weight_per_user_exercise` - Personal records

### 🎯 Gamification
- `achievements` - Available achievements
- `challenges` - Community challenges
- `challenge_participants` - Challenge participation
- `leaderboards` - Competitive rankings
- `social_posts` - User-generated content
- `social_likes` - Content interactions

### 🤝 Coaching & Mentorship
- `mentors` - Coach profiles
- `mentor_profiles` - Detailed coach information
- `mentorships` - Coach-client relationships
- `coach_assigned_templates` - Template assignments
- `coach_client_links` - Relationship requests
- `coach_logs` - Coaching activity tracking

### 💰 Business & Commerce
- `ambassador_profiles` - Ambassador program participants
- `ambassador_commission_agreements` - Commission structures
- `ambassador_commission_accruals` - Earnings tracking
- `ambassador_gym_deals` - Partnership agreements
- `battle_participants` - Competition participation
- `battles` - Competitive events

### 🛠️ Equipment & Resources
- `equipment` - Equipment definitions
- `equipment_translations` - Multi-language support
- `equipment_defaults` - Standard configurations
- `equipment_grip_defaults` - Default grip settings
- `bar_types` - Barbell specifications
- `muscle_groups` - Anatomical muscle groupings

### 🌍 Life Categories System
- `life_categories` - Main life area categories
- `life_subcategories` - Specific focus areas
- `life_category_translations` - Internationalization
- `life_subcategory_translations` - Localized content

### 🔧 System & Configuration
- `attribute_schemas` - Dynamic field definitions
- `metric_defs` - Custom metric specifications
- `text_translations` - Application text localization
- `carousel_images` - UI content management
- `admin_audit_log` - Administrative activity tracking

## Key Features

### Security Model
- **Row Level Security (RLS)**: Enabled on all user-facing tables
- **Role-Based Access**: Granular permissions for users, admins, gym staff
- **Audit Logging**: Comprehensive activity tracking
- **Rate Limiting**: Protection against abuse

### Performance Optimizations
- **Materialized Views**: Pre-computed aggregations for analytics
- **Strategic Indexes**: Optimized query performance
- **Efficient Joins**: Minimized cross-table operations
- **Partitioning**: Large dataset management

### Data Integrity
- **Foreign Key Constraints**: Referential integrity across all relationships
- **Type Safety**: Custom enums and strong typing
- **Validation Functions**: Business rule enforcement
- **Trigger-Based Automation**: Automatic data maintenance

### Internationalization
- **Multi-Language Support**: Comprehensive translation tables
- **Locale-Aware Functions**: Dynamic content serving
- **Fallback Mechanisms**: Graceful degradation for missing translations

### Extensibility
- **Attribute Schemas**: Dynamic field definitions
- **Custom Metrics**: Flexible measurement systems
- **JSONB Fields**: Schema-free data storage where appropriate
- **Modular Design**: Easy feature addition

## Data Relationships

### Core Exercise Flow
```
exercises -> workout_templates -> workouts -> workout_exercises -> workout_sets
```

### User Journey
```
users -> user_preferences -> workouts -> progress_tracking -> achievements
```

### Social Features
```
users -> friendships -> social_posts -> social_likes
```

### Gym Management
```
gyms -> gym_equipment -> gym_memberships -> users
```

This schema supports a comprehensive fitness platform with social features, professional coaching, business operations, and extensive customization capabilities.