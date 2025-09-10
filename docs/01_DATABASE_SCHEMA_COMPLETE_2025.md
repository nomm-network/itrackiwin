# Complete Database Schema Documentation 2025

**Generated**: January 10, 2025  
**Database**: PostgreSQL (Supabase)  
**Schema**: public  

## Overview

This document provides a comprehensive overview of the fitness platform database schema.

### Database Statistics
- **Total Tables**: 120+ tables
- **Views**: 36 views (including materialized views)  
- **Custom Functions**: 200+ functions
- **Custom Types/Enums**: 23 enums
- **Row Level Security**: Enabled on all tables

## Core Database Tables

### User Management System
- `users` - Core user records
- `user_roles` - Role-based access control
- `user_preferences` - User configuration settings
- `social_friendships` - Social connections
- `user_achievements` - Achievement tracking
- `user_pinned_subcategories` - Pinned life categories

### Exercise & Movement System
- `exercises` - Exercise definitions and metadata
- `equipment` - Equipment catalog
- `muscle_groups` - Muscle group taxonomy
- `muscles` - Individual muscle definitions
- `movements` - Movement patterns
- `grips` - Grip variations
- `handles` - Handle attachments
- `exercise_grips` - Exercise-grip relationships
- `exercise_equipment_variants` - Equipment alternatives

### Workout & Training System
- `workouts` - Workout sessions
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets performed
- `workout_templates` - Reusable workout blueprints
- `template_exercises` - Template exercise definitions
- `personal_records` - PR tracking
- `user_exercise_stats` - Performance aggregations

### Gym Management System
- `gyms` - Gym facilities
- `gym_equipment` - Gym equipment inventory
- `gym_admins` - Gym administrative roles
- `gym_memberships` - User gym memberships
- `gym_role_requests` - Role request workflow
- `cities` - Geographic locations

### Health & Readiness System
- `readiness_checkins` - Daily/workout readiness tracking
- `cycle_events` - Menstrual cycle tracking
- `user_injuries` - Injury management
- `auto_deload_triggers` - Automatic deload detection

### Coach & Mentorship System
- `mentor_profiles` - Coach/mentor profiles
- `mentorships` - Coach-client relationships
- `mentor_categories` - Mentorship specializations
- `coach_assigned_templates` - Template assignments
- `coach_client_links` - Client connections

### Gamification & Social System
- `achievements` - Achievement definitions
- `user_achievements` - User achievement progress
- `challenges` - Community challenges
- `challenge_participants` - Challenge participation
- `leaderboards` - Ranking systems
- `social_posts` - Social media posts
- `social_likes` - Post interactions

### Ambassador & Business System
- `ambassador_profiles` - Ambassador accounts
- `battles` - Ambassador competitions
- `ambassador_commission_agreements` - Commission structures
- `ambassador_commission_accruals` - Commission calculations
- `ambassador_gym_visits` - Visit tracking

### Configuration & System Tables
- `equipment_defaults` - Default equipment settings
- `attribute_schemas` - Dynamic schema definitions
- `progression_policies` - Training progression rules
- `warmup_policies` - Warmup generation policies
- `bar_types` - Barbell type definitions
- `metric_defs` - Custom metric definitions
- `data_quality_reports` - Data integrity monitoring

## Custom Enums

The database uses 23 custom enum types for type safety:

- `app_role` - User roles: superadmin, admin, mentor, user
- `exercise_skill_level` - Exercise difficulty: low, medium, high
- `set_type` - Set types: normal, warmup, drop, amrap, etc.
- `load_type` - Loading types: none, single_load, dual_load, stack
- `weight_unit` - Weight units: kg, lb
- `progression_algo` - Progression algorithms
- `training_focus` - Training focus areas
- `fitness_goal` - User fitness goals
- `experience_level` - User experience levels
- `grip_orientation` - Grip orientations
- And 13 more specialized enums

## Key Features

### Security Model
- **Row Level Security (RLS)**: All tables protected with RLS policies
- **Role-based Access**: Multi-tier role system (superadmin, admin, mentor, user)
- **Audit Logging**: Comprehensive audit trail for admin actions
- **Security Definer Functions**: Secure data access patterns

### Performance Optimizations
- **Materialized Views**: Pre-computed aggregations for expensive queries
- **Strategic Indexes**: Optimized query performance
- **Partitioning**: Large datasets optimized for scale

### Data Integrity
- **Type Safety**: Extensive use of custom enums and constraints
- **Foreign Key Relationships**: Well-defined data relationships
- **Validation Triggers**: Business logic enforcement
- **Automatic Timestamps**: Created/updated tracking

### Internationalization
- **Multi-language Support**: Translation tables for exercises, equipment
- **Localized Content**: Region-specific data handling
- **Fallback Mechanisms**: English fallbacks for missing translations

### Extensibility
- **Attribute Schemas**: Dynamic field definitions
- **JSONB Fields**: Flexible data storage
- **Custom Metrics**: User-defined measurement tracking
- **Plugin Architecture**: Extensible component system

## Data Relationships

### Core Exercise Flow
```
exercises → workout_exercises → workout_sets
    ↓           ↓                   ↓
equipment   target_weight      actual_weight
muscles     target_reps        actual_reps
grips       target_sets        completion_status
```

### User Journey
```
users → user_roles → workouts → achievements
  ↓         ↓           ↓          ↓
preferences gym_memberships sets   points
social      mentorships     PRs    badges
```

### Gym Management
```
gyms → gym_equipment → gym_memberships
  ↓         ↓              ↓
cities   equipment      users
staff    inventory      access_rules
```

This schema supports a comprehensive fitness platform with robust user management, detailed exercise tracking, social features, and business operations.