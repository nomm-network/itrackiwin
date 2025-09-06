# Database Tables Overview - Updated

*Last Updated: 2025-01-29*

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
| `bar_types` | Barbell specifications | Standard weights and types |
| `muscle_groups` | Major muscle group definitions | Anatomical muscle classifications |
| `muscles` | Individual muscle definitions | Specific muscle targeting |

## Exercise Relationships

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `exercise_handles` | Default handles per exercise | Default flags, exercise-handle mapping |
| `exercise_default_grips` | Default grips per exercise | Order index for priority |
| `exercise_grips` | Available grips per exercise | Grip options and defaults |
| `exercise_handle_grips` | Valid handle+grip combinations | Exercise-specific compatibility |
| `exercise_grip_effects` | Muscle activation changes by grip | Percentage effects on targeting |
| `exercise_similars` | Similar/alternative exercises | Similarity scoring, recommendations |
| `exercise_equipment_variants` | Equipment variations | Preferred variants and alternatives |
| `exercise_aliases` | Alternative exercise names | Name variations and aliases |
| `exercise_images` | Exercise media content | User-uploaded images, primary flags |
| `exercise_metric_defs` | Exercise-specific metrics | Custom tracking definitions |
| `exercise_handle_orientations` | Handle positioning options | Orientation-specific configurations |
| `equipment_handle_grips` | Equipment compatibility matrix | Core compatibility rules |
| `equipment_grip_defaults` | Equipment default grips | Default grip selections |
| `equipment_handle_orientations` | Equipment handle orientations | Positioning configurations |
| `handle_equipment` | Handle-equipment associations | Equipment compatibility |
| `handle_equipment_rules` | Handle compatibility rules | Business logic for compatibility |
| `handle_grip_compatibility` | Handle-grip compatibility | Grip-handle combinations |
| `handle_orientation_compatibility` | Handle orientation rules | Orientation compatibility matrix |
| `attribute_schemas` | Dynamic exercise attributes | Flexible attribute system |

## Body & Muscle System

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `body_parts` | Major body regions | Slug-based identification |
| `body_parts_translations` | Body part names | Internationalization support |
| `muscles_translations` | Muscle names/descriptions | Multi-language muscle information |
| `muscle_groups_translations` | Muscle group translations | Internationalization for muscle groups |
| `pain_events` | Pain/injury tracking | Health and safety monitoring |
| `equipments` | Equipment catalog (alternative) | Secondary equipment table |

## Workout System

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `workouts` | User workout sessions | Start/end times, duration tracking |
| `workout_exercises` | Exercises within a workout | Order, handle/grip selections, targeting |
| `workout_sets` | Individual sets performed | Weight, reps, RPE, completion status |
| `workout_templates` | Reusable workout plans | User-created templates |
| `template_exercises` | Exercises in templates | Default sets, target weights |
| `workout_exercise_groups` | Exercise grouping | Supersets, circuits, organization |
| `personal_records` | PR tracking by exercise | Weight, reps, 1RM with grip context |
| `auto_deload_triggers` | Automatic deload detection | Stagnation patterns, smart progression |
| `progressive_overload_plans` | Progression strategies | Systematic progression planning |
| `progression_policies` | Progression methodologies | Rule-based progression systems |
| `rest_timer_sessions` | Rest period tracking | Workout timing and pacing |
| `naming_templates` | Exercise naming patterns | Dynamic naming system |

## User & Social

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | Extended user profiles | Additional user data beyond auth |
| `user_profile_fitness` | User fitness profiles | Experience, goals, preferences |
| `user_achievements` | Achievement tracking | Points, completion dates |
| `user_roles` | Role-based access | Admin/superadmin roles |
| `friendships` | User connections | Request/accept flow |
| `challenges` | Community challenges | Public/private, time-bound |
| `challenge_participants` | Challenge participation | Progress tracking |
| `mentors` | Mentor system | Expert guidance and coaching |
| `mentor_categories` | Mentor specializations | Expertise categorization |
| `cycle_events` | Menstrual cycle tracking | Women's health integration |

## Health & Tracking

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `readiness_checkins` | Daily readiness scores | Sleep, energy, soreness tracking |
| `pre_workout_checkins` | Pre-workout assessments | Workout readiness evaluation |
| `preworkout_checkins` | Pre-workout check-ins (alt) | Alternative pre-workout tracking |
| `metric_defs` | Custom metric definitions | User-defined tracking metrics |
| `streak_tracking` | Habit monitoring | Consistency and habit formation |
| `timer_sessions` | Workout timing | Detailed timing data |
| `user_pinned_subcategories` | User preferences | Personalized content organization |
| `experience_level_configs` | Training parameters by level | Intensity, rest, progression rules |

## Gym Management

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `gyms` | Physical gym locations | Facility information |
| `gym_admins` | Gym administrative access | Facility management |
| `gym_aliases` | Gym alternative names | Name variations |
| `gym_equipment` | Gym equipment inventory | Equipment availability |
| `gym_equipment_availability` | Equipment status tracking | Real-time availability |
| `gym_equipment_overrides` | Custom equipment settings | Facility-specific configurations |
| `gym_plate_inventory` | Weight plate tracking | Plate availability |
| `user_gym_bars` | User barbell preferences | Personal bar selections |
| `user_gym_miniweights` | User mini-weights | Personal accessory weights |
| `user_gym_plates` | User plate inventory | Personal weight collections |
| `user_gyms` | User gym memberships | User-facility associations |

## Life Integration

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `life_categories` | Life area categorization | Holistic life management |
| `life_category_translations` | Category translations | Internationalization |
| `life_subcategories` | Detailed subcategories | Granular organization |
| `life_subcategory_translations` | Subcategory translations | Internationalization |

## Admin & System

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `admin_audit_log` | Administrative actions | Security audit trail |
| `admin_check_rate_limit` | Rate limiting | Request throttling |
| `coach_logs` | AI coach interactions | Function calls, performance monitoring |
| `data_quality_reports` | System health monitoring | Coverage metrics, quality analysis |
| `achievements` | Achievement definitions | Achievement framework |
| `idempotency_keys` | Request deduplication | System reliability |
| `languages` | Language support | Internationalization management |
| `text_translations` | General UI text | System-wide translations |

## Supporting Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `spatial_ref_sys` | PostGIS spatial support | Geographic coordinate systems |

## Backup Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `bak_*` | Migration safety backups | Schema migration protection |

*Note: Backup tables (bak_*) are used during major schema migrations and can be safely ignored for normal operations.*

## Key Relationships

- **Exercise Flow**: Movement Pattern → Equipment → Handles → Grips → Exercise
- **Workout Flow**: Template → Workout → Exercises → Sets → PRs
- **User Flow**: Profile → Gym → Equipment → Performance → Progress
- **Translation Flow**: Core Entity → Translation Tables → Multi-language UI
- **Admin Flow**: Actions → Audit Logs → Quality Reports

## Data Integrity Notes

- Most foreign key relationships are logical (not enforced)
- RLS policies handle data access control
- Translation system supports full internationalization
- Backup strategy protects against migration failures
- UUID primary keys throughout system