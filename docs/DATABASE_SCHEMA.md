# Database Schema Documentation

This document provides a comprehensive overview of the database structure for the iTrack.iWin fitness application.

## Overview
- **Total Tables**: 128
- **Database Type**: PostgreSQL (Supabase)
- **Schema**: public

## Table Categories

### Authentication & User Management
- `users` - Core user profiles
- `user_roles` - Role-based access control
- `admin_audit_log` - Admin action tracking
- `admin_check_rate_limit` - Rate limiting for admin checks
- `profiles` - Extended user profile information

### Fitness & Exercise Management
- `exercises` - Core exercise definitions
- `exercise_aliases` - Alternative names for exercises
- `exercise_equipment_variants` - Equipment variations per exercise
- `exercise_grips` - Grip configurations for exercises
- `exercise_images` - Exercise demonstration images
- `exercise_similars` - Related/similar exercises
- `muscle_groups` - Muscle group definitions
- `muscles` - Individual muscle definitions
- `equipment` - Exercise equipment definitions
- `movement_patterns` - Movement pattern classifications
- `movements` - Basic movement definitions

### Workout System
- `workouts` - Individual workout sessions
- `workout_exercises` - Exercises within a workout
- `workout_sets` - Individual sets within exercises
- `workout_templates` - Reusable workout templates
- `template_exercises` - Exercises within templates
- `workout_checkins` - Pre/post workout check-ins
- `workout_session_feedback` - Session feedback and ratings

### Gym & Equipment Management
- `gyms` - Gym location definitions
- `gym_equipment` - Equipment available at specific gyms
- `gym_equipment_availability` - Equipment availability tracking
- `gym_equipment_overrides` - Gym-specific equipment settings
- `gym_plate_inventory` - Plate inventory per gym
- `user_gym_memberships` - User gym associations
- `user_gyms` - User's personal gym setups

### User Preferences & Tracking
- `user_exercise_estimates` - Exercise weight estimates
- `user_exercise_overrides` - Custom exercise settings
- `user_equipment_preferences` - Equipment preferences
- `user_lifting_prefs` - Lifting style preferences
- `user_settings` - General user settings
- `personal_records` - Personal record tracking
- `user_stats` - User performance statistics

### Social Features
- `friendships` - User friend connections
- `workout_likes` - Workout social interactions
- `workout_comments` - Workout comments
- `workout_shares` - Workout sharing
- `challenges` - Fitness challenges
- `challenge_participants` - Challenge participation

### Gamification
- `achievements` - Available achievements
- `user_achievements` - User-earned achievements
- `user_gamification` - Gamification stats
- `streaks` - Streak tracking

### Health & Wellness
- `cycle_events` - Menstrual cycle tracking
- `pain_events` - Pain/injury tracking
- `user_injuries` - Injury history
- `readiness_checkins` - Readiness assessments

### Coaching & Mentorship
- `mentor_profiles` - Coach/mentor profiles
- `mentorships` - Coaching relationships
- `coach_assigned_templates` - Coach-assigned workouts
- `coach_logs` - Coaching activity logs

### System Configuration
- `languages` - Supported languages
- `text_translations` - Internationalization
- `attribute_schemas` - Dynamic attribute definitions
- `data_quality_reports` - Data integrity monitoring
- `idempotency_keys` - Request deduplication

## Key Relationships

### User-Centric Design
All major entities are linked to users through `user_id` foreign keys with proper RLS policies.

### Exercise Hierarchy
```
movements → exercises → workout_exercises → workout_sets
equipment → exercises
muscle_groups → exercises
```

### Workout Structure
```
workout_templates → template_exercises
workouts → workout_exercises → workout_sets
```

### Gym Integration
```
gyms → gym_equipment → exercises
users → user_gym_memberships → gyms
```

## Security Model
- Row Level Security (RLS) enabled on all user-data tables
- Role-based access control for admin functions
- User isolation for personal data
- Public read access for reference data (exercises, equipment, etc.)

## Data Types Used
- `uuid` - Primary keys and foreign keys
- `text` - Strings and descriptions
- `jsonb` - Flexible data structures
- `numeric` - Weights, measurements
- `integer` - Counts, indices
- `boolean` - Flags and settings
- `timestamp with time zone` - Temporal data
- `USER-DEFINED` enums - Controlled vocabularies

## Internationalization Support
Most reference tables have corresponding `_translations` tables supporting multiple languages:
- `exercises_translations`
- `equipment_translations`
- `muscle_groups_translations`
- `movements_translations`
- etc.

This schema supports a comprehensive fitness tracking application with social features, coaching capabilities, and extensive customization options.