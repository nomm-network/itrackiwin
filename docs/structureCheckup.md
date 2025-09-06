# Database Structure Audit - Complete Table Overview

*Generated: 2025-01-29*

## Core Exercise System (15 tables)

| Table | Purpose | Role |
|-------|---------|------|
| `exercises` | Master exercise definitions | Core table storing all exercise metadata, movements, equipment requirements |
| `exercises_translations` | Multi-language exercise names | Internationalization support for exercise names and descriptions |
| `movements` | Exercise movement definitions | Foundational movement patterns that exercises are based on |
| `movement_patterns` | Movement pattern categories | Classification system for exercise movement types |
| `movement_patterns_translations` | Movement pattern translations | Internationalization for movement pattern names |
| `equipment` | Exercise equipment catalog | Master catalog of all gym equipment and machines |
| `equipment_translations` | Equipment names in multiple languages | Internationalization support for equipment names |
| `handles` | Cable handles, bars, attachments | Specific handles and attachments for equipment |
| `handles_translations` | Handle names/descriptions | Internationalization for handle names |
| `handle_translations` | Handle translations (alt table) | Alternative handle translation table |
| `grips` | Hand positions and grip styles | Different grip types and hand positions |
| `grips_translations` | Grip descriptions | Internationalization for grip descriptions |
| `bar_types` | Barbell specifications | Standard barbell types with default weights |
| `muscle_groups` | Muscle group definitions | Major muscle group classifications |
| `muscles` | Individual muscle definitions | Specific muscle targeting information |

## Exercise Relationships & Configuration (20 tables)

| Table | Purpose | Role |
|-------|---------|------|
| `exercise_handles` | Exercise-specific handle assignments | Links exercises to their compatible handles |
| `exercise_grips` | Exercise-specific grip options | Defines available grips per exercise |
| `exercise_handle_grips` | Valid handle+grip combinations | Exercise-specific handle-grip compatibility |
| `exercise_default_grips` | Default grips per exercise | Priority ordering of default grips |
| `exercise_default_handles` | Default handles per exercise | Primary handle selections |
| `exercise_grip_effects` | Muscle activation by grip | How different grips affect muscle targeting |
| `exercise_similars` | Similar/alternative exercises | Exercise recommendation system |
| `exercise_equipment_variants` | Equipment variations | Alternative equipment options per exercise |
| `exercise_aliases` | Exercise name aliases | Alternative names for exercises |
| `exercise_images` | Exercise media/images | Visual content for exercises |
| `exercise_metric_defs` | Exercise-specific metrics | Custom tracking metrics per exercise |
| `exercise_handle_orientations` | Handle orientation options | Specific handle positioning per exercise |
| `equipment_handle_grips` | Equipment compatibility matrix | Core equipment-handle-grip compatibility |
| `equipment_grip_defaults` | Equipment default grips | Default grip selections per equipment |
| `equipment_handle_orientations` | Equipment handle orientations | Handle positioning options per equipment |
| `handle_equipment` | Handle-equipment associations | Which handles work with which equipment |
| `handle_equipment_rules` | Handle equipment compatibility rules | Business rules for handle-equipment matching |
| `handle_grip_compatibility` | Handle-grip compatibility | Which grips work with which handles |
| `handle_orientation_compatibility` | Handle orientation rules | Orientation compatibility matrix |
| `attribute_schemas` | Dynamic attribute definitions | Flexible attribute system for exercises |

## Body & Anatomy System (6 tables)

| Table | Purpose | Role |
|-------|---------|------|
| `body_parts` | Major body regions | Primary body part classifications |
| `body_parts_translations` | Body part names | Internationalization for body parts |
| `muscles_translations` | Muscle names/descriptions | Internationalization for muscle information |
| `muscle_groups_translations` | Muscle group translations | Internationalization for muscle groups |
| `pain_events` | User pain/injury tracking | Health and safety monitoring |
| `equipments` | Equipment catalog (alt table) | Alternative equipment table |

## Workout System (12 tables)

| Table | Purpose | Role |
|-------|---------|------|
| `workouts` | User workout sessions | Core workout session tracking |
| `workout_exercises` | Exercises within workouts | Exercise selections and configurations per workout |
| `workout_sets` | Individual sets performed | Detailed set-by-set performance data |
| `workout_templates` | Reusable workout plans | User-created workout templates |
| `template_exercises` | Template exercise definitions | Exercise configurations within templates |
| `workout_exercise_groups` | Exercise grouping (supersets) | Workout organization and structure |
| `personal_records` | PR tracking by exercise | Personal best tracking with grip context |
| `auto_deload_triggers` | Automatic deload detection | Smart training load management |
| `progressive_overload_plans` | Progression strategies | Systematic progression planning |
| `progression_policies` | Progression rule definitions | Progression methodology configurations |
| `rest_timer_sessions` | Rest period tracking | Workout timing and rest management |
| `naming_templates` | Exercise naming patterns | Dynamic exercise naming system |

## User & Profile System (8 tables)

| Table | Purpose | Role |
|-------|---------|------|
| `profiles` | Extended user profiles | Additional user information beyond auth |
| `user_profile_fitness` | User fitness profiles | Experience level, goals, preferences |
| `user_achievements` | Achievement tracking | Gamification and milestone tracking |
| `user_roles` | Role-based access control | Admin and permission management |
| `readiness_checkins` | Daily readiness assessment | Wellness and recovery tracking |
| `pre_workout_checkins` | Pre-workout assessments | Workout readiness evaluation |
| `preworkout_checkins` | Pre-workout check-ins (alt) | Alternative pre-workout tracking |
| `experience_level_configs` | Training level parameters | Experience-based training configurations |

## Social & Community (6 tables)

| Table | Purpose | Role |
|-------|---------|------|
| `friendships` | User social connections | Social networking features |
| `challenges` | Community challenges | Group fitness challenges |
| `challenge_participants` | Challenge participation | User participation in challenges |
| `mentors` | Mentor system | Expert guidance and coaching |
| `mentor_categories` | Mentor specializations | Mentor classification system |
| `cycle_events` | Menstrual cycle tracking | Women's health and training optimization |

## Health & Tracking (4 tables)

| Table | Purpose | Role |
|-------|---------|------|
| `metric_defs` | Custom metric definitions | Flexible user-defined tracking metrics |
| `streak_tracking` | Habit and streak monitoring | Consistency and habit formation |
| `timer_sessions` | Workout timing sessions | Detailed workout timing data |
| `user_pinned_subcategories` | User preference tracking | Personalized content organization |

## Gym & Facility Management (10 tables)

| Table | Purpose | Role |
|-------|---------|------|
| `gyms` | Gym/facility definitions | Physical location and facility data |
| `gym_admins` | Gym administrative access | Facility management permissions |
| `gym_aliases` | Gym alternative names | Facility name variations |
| `gym_equipment` | Gym-specific equipment inventory | Equipment availability per facility |
| `gym_equipment_availability` | Equipment status tracking | Real-time equipment availability |
| `gym_equipment_overrides` | Custom equipment settings | Facility-specific equipment configurations |
| `gym_plate_inventory` | Weight plate inventory | Detailed plate and weight tracking |
| `user_gym_bars` | User gym bar preferences | Personal barbell selections |
| `user_gym_miniweights` | User mini-weight inventory | Personal accessory weight tracking |
| `user_gym_plates` | User plate inventory | Personal weight plate collections |
| `user_gyms` | User gym memberships | User-gym associations |

## Life Integration System (4 tables)

| Table | Purpose | Role |
|-------|---------|------|
| `life_categories` | Life area categorization | Holistic life management categories |
| `life_category_translations` | Category translations | Internationalization for life categories |
| `life_subcategories` | Detailed life subcategories | Granular life area organization |
| `life_subcategory_translations` | Subcategory translations | Internationalization for subcategories |

## Administrative & System (8 tables)

| Table | Purpose | Role |
|-------|---------|------|
| `admin_audit_log` | Administrative action logging | Security and compliance audit trail |
| `admin_check_rate_limit` | Rate limiting controls | API and system protection |
| `coach_logs` | AI coach interaction logging | AI system monitoring and debugging |
| `data_quality_reports` | System health monitoring | Data integrity and coverage metrics |
| `achievements` | System achievement definitions | Achievement framework configuration |
| `idempotency_keys` | Request deduplication | System reliability and data consistency |
| `languages` | Supported language definitions | Internationalization language management |
| `text_translations` | General UI text translations | System-wide text internationalization |

## Backup & Migration Tables (10 tables)

| Table | Purpose | Role |
|-------|---------|------|
| `bak_exercises` | Exercise table backup | Migration safety for exercises |
| `bak_exercises_translations` | Exercise translations backup | Migration safety for translations |
| `bak_exercise_handles` | Exercise handles backup | Migration safety for handle relationships |
| `bak_exercise_grips` | Exercise grips backup | Migration safety for grip relationships |
| `bak_exercise_handle_grips` | Handle-grip combinations backup | Migration safety for complex relationships |
| `bak_workouts` | Workouts backup | Migration safety for workout data |
| `bak_workout_exercises` | Workout exercises backup | Migration safety for workout exercise data |
| `bak_workout_sets` | Workout sets backup | Migration safety for set data |
| `bak_workout_templates` | Workout templates backup | Migration safety for template data |
| `bak_template_exercises` | Template exercises backup | Migration safety for template exercise data |

## PostGIS Spatial Tables (1 table)

| Table | Purpose | Role |
|-------|---------|------|
| `spatial_ref_sys` | Spatial reference system definitions | Geographic coordinate system support |

## Summary Statistics

- **Total Tables**: 104 tables
- **Core System Tables**: 94 active tables
- **Backup Tables**: 10 backup tables
- **Translation Tables**: 15 internationalization tables
- **Primary Categories**: 11 functional areas
- **Key Relationships**: Exercise ↔ Equipment ↔ Handles ↔ Grips ↔ Users

## Key Data Flow Patterns

1. **Exercise Creation Flow**: Movement Pattern → Equipment → Handles → Grips → Exercise
2. **Workout Flow**: Template → Workout → Workout Exercises → Sets → Personal Records
3. **User Journey**: Profile → Gym → Equipment Selection → Exercise Performance → Progress Tracking
4. **Translation Flow**: Core Entity → Translation Table → Multi-language Support
5. **Administrative Flow**: Admin Actions → Audit Logs → Data Quality Reports

## Critical Dependencies

- **User System**: All user-related data depends on auth.users (managed by Supabase)
- **Exercise System**: Complex interdependencies between exercises, equipment, handles, and grips
- **Workout System**: Hierarchical structure from templates down to individual sets
- **Translation System**: Extensive internationalization support across all major entities
- **Backup System**: Comprehensive backup strategy for major schema migrations