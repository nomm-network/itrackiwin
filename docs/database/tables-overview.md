# Database Tables Overview

*Last Updated: 2025-01-29 - See docs/structureCheckup.md for complete audit*

## Core Exercise System

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `exercises` | Core exercise definitions | Slug-based, supports custom user exercises, dynamic naming |
| `exercises_translations` | Multi-language exercise names/descriptions | Language code + exercise mapping |
| `movements` | Exercise movement definitions | Base movement patterns for exercises |
| `movement_patterns` | Movement pattern categories | Classification system (push, pull, squat, etc.) |
| `movement_patterns_translations` | Movement pattern localization | Multi-language movement pattern names |
| `equipment` | Exercise equipment (barbells, machines, etc.) | Load types, weight specs, equipment categories |
| `equipment_translations` | Equipment names in multiple languages | Internationalization support |
| `handles` | Cable handles, bars, attachments | Categorized by type, compatibility rules |
| `handles_translations` | Handle names/descriptions | Multi-language handle information |
| `handle_translations` | Handle localization (alternative) | Secondary handle translation table |
| `grips` | Hand positions and grip styles | Compatible grip combinations, categories |
| `grips_translations` | Grip descriptions | Multi-language grip information |

## Exercise Relationships

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `exercise_handles` | Default handles per exercise | Default flags |
| `exercise_default_grips` | Default grips per exercise | Order index for priority |
| `exercise_grips` | Available grips per exercise | |
| `exercise_handle_grips` | Valid handle+grip combinations | |
| `exercise_grip_effects` | Muscle activation changes by grip | Percentage effects |
| `exercise_similars` | Similar/alternative exercises | Similarity scoring |
| `exercise_equipment_variants` | Equipment variations | Preferred variants |

## Body & Muscle System

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `body_parts` | Major body regions | Slug-based identification |
| `body_parts_translations` | Body part names | |
| `muscles` | Individual muscle groups | Anatomical classification |
| `muscles_translations` | Muscle names/descriptions | |

## Workout System

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `workouts` | User workout sessions | Start/end times, duration tracking |
| `workout_exercises` | Exercises within a workout | Order, handle/grip selections |
| `workout_sets` | Individual sets performed | Weight, reps, RPE, completion |
| `workout_templates` | Reusable workout plans | User-created templates |
| `template_exercises` | Exercises in templates | Default sets, target weights |

## User & Social

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `user_profile_fitness` | User fitness profiles | Experience, goals, preferences |
| `user_achievements` | Achievement tracking | Points, completion dates |
| `friendships` | User connections | Request/accept flow |
| `challenges` | Community challenges | Public/private, time-bound |
| `challenge_participants` | Challenge participation | Progress tracking |

## Health & Tracking

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `personal_records` | PR tracking by exercise | Weight, reps, 1RM with grip context |
| `readiness_checkins` | Daily readiness scores | Sleep, energy, soreness |
| `cycle_events` | Menstrual cycle tracking | Event types and dates |
| `metric_entries` | Custom user metrics | Flexible JSON values |
| `metric_defs` | Metric definitions | Types, validation rules |

## Admin & System

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `admin_audit_log` | Administrative actions | Security audit trail |
| `admin_check_rate_limit` | Rate limiting | Request throttling |
| `coach_logs` | AI coach interactions | Function calls, performance |
| `data_quality_reports` | System health monitoring | Coverage metrics |
| `user_roles` | Role-based access | Admin/superadmin roles |

## Supporting Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `bar_types` | Barbell specifications | Standard weights |
| `experience_level_configs` | Training parameters by level | Intensity, rest, progression |
| `auto_deload_triggers` | Automatic deload detection | Stagnation patterns |
| `text_translations` | General UI text | Internationalization |

## Backup Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `bak_*` | Backup versions | Migration safety |

*Note: Backup tables (bak_*) are used during major schema migrations and can be safely ignored for normal operations.*