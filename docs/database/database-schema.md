# Database Schema Documentation

## Overview
This document provides a comprehensive overview of the database schema for the fitness tracking application.

## Core Tables

### Users and Authentication
- `users` - Core user records with pro status
- `ambassador_profiles` - Ambassador program participants
- `mentor_profiles` - Fitness mentors and coaches
- `coach_client_links` - Relationships between coaches and clients

### Fitness Data
- `exercises` - Exercise definitions and metadata
- `ai_exercises` - AI-generated exercise variations
- `equipment` - Gym equipment definitions
- `grips` - Exercise grip types and variations
- `handles` - Equipment handle types

### Workout Management
- `workouts` - Individual workout sessions
- `workout_exercises` - Exercises within workouts
- `workout_sets` - Individual sets within exercises
- `workout_templates` - Reusable workout templates
- `template_exercises` - Exercises within templates

### AI Program Generation
- `ai_programs` - AI-generated fitness programs
- `ai_program_weeks` - Weekly structure of AI programs
- `ai_program_workouts` - Individual workouts within AI programs
- `ai_program_workout_exercises` - Exercises within AI workouts
- `user_profile_fitness` - User fitness profiles for AI generation

### Social Features
- `social_posts` - User social media posts
- `social_friendships` - Friend relationships
- `social_post_likes` - Post engagement
- `challenges` - Fitness challenges
- `challenge_participants` - Challenge participation

### Gym Management
- `gyms` - Gym locations and information
- `gym_admins` - Gym administrative roles
- `gym_role_requests` - Requests for gym roles
- `user_gyms` - User gym memberships
- `user_gym_plates` - User's available plates at gyms
- `user_gym_miniweights` - User's available micro plates

### Tracking and Analytics
- `readiness_checkins` - Daily readiness assessments
- `cycle_events` - Menstrual cycle tracking
- `achievements` - User achievement system
- `user_achievements` - Individual achievement records

## Key Relationships

### User Relationships
- Users can have multiple gym memberships
- Users can be coaches with multiple clients
- Users can participate in ambassador programs
- Users can have fitness mentoring relationships

### Workout Structure
```
workouts (1) -> (many) workout_exercises (1) -> (many) workout_sets
workout_templates (1) -> (many) template_exercises
```

### AI Program Structure
```
ai_programs (1) -> (many) ai_program_weeks (1) -> (many) ai_program_workouts (1) -> (many) ai_program_workout_exercises
```

### Exercise Metadata
```
exercises (1) -> (many) exercise_equipment_profiles
exercises (1) -> (many) exercise_default_grips
equipment (1) -> (many) equipment_grip_defaults
```

## Security Model
- Row Level Security (RLS) enabled on all user-facing tables
- Users can only access their own data
- Gym admins can access gym-related data
- Mentors can access mentee data within active relationships
- Public data (exercises, equipment) accessible to all authenticated users

## Indexes and Performance
- Primary keys on all tables (UUID type)
- Foreign key indexes for relationship lookups
- Search indexes on exercise names and descriptions
- Composite indexes on frequently queried combinations (user_id + date ranges)

## Audit and Logging
- `admin_audit_log` - Administrative action tracking
- `coach_logs` - AI coach operation logging
- `data_quality_reports` - Database quality assessments
- Automatic timestamps on all tables (created_at, updated_at)