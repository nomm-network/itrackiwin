# Complete Database Schema Documentation

*Generated on: 2025-01-03*

## Overview
- **Total Tables**: 111
- **Total Functions**: 824
- **Schema**: public

## Tables Summary

### System & Admin Tables (5)
| Table | Purpose | Records |
|-------|---------|---------|
| `achievements` | Achievement system | 7 |
| `admin_audit_log` | Admin action tracking | 16,830 |
| `admin_check_rate_limit` | Rate limiting for admin checks | 0 |
| `idempotency_keys` | Request deduplication | 0 |
| `users` | User profiles and settings | 1 |

### Authentication & Roles (3)
| Table | Purpose | Records |
|-------|---------|---------|
| `profiles` | User profile data | 1 |
| `user_roles` | Role-based access control | 0 |
| `user_features` | Feature flag management | 0 |

### Fitness & Exercise System (35)
| Table | Purpose | Records |
|-------|---------|---------|
| `exercises` | Exercise definitions | 8 |
| `exercises_translations` | Exercise name translations | 16 |
| `exercise_aliases` | Alternative exercise names | 0 |
| `exercise_default_grips` | Default grip assignments | 0 |
| `exercise_equipment_variants` | Equipment variations | 0 |
| `exercise_grip_effects` | Grip impact on muscles | 0 |
| `exercise_grips` | Exercise-grip relationships | 0 |
| `exercise_handle_orientations` | Handle position options | 0 |
| `exercise_images` | Exercise visual assets | 0 |
| `exercise_metric_defs` | Custom metric definitions | 0 |
| `exercise_similars` | Similar exercise suggestions | 0 |
| `equipment` | Gym equipment catalog | 48 |
| `equipment_grip_defaults` | Default equipment grips | 93 |
| `equipment_handle_orientations` | Equipment handle positions | 120 |
| `equipment_translations` | Equipment name translations | 93 |
| `equipments` | Equipment categories | 5 |
| `grips` | Grip types and styles | 4 |
| `grips_translations` | Grip name translations | 8 |
| `muscle_groups` | Primary muscle groups | 14 |
| `muscle_groups_translations` | Muscle group translations | 28 |
| `muscles` | Individual muscles | 0 |
| `muscles_translations` | Muscle name translations | 0 |
| `movements` | Movement patterns | 7 |
| `movements_translations` | Movement pattern translations | 14 |
| `movement_patterns` | Exercise movement categories | 7 |
| `movement_patterns_translations` | Movement pattern translations | 14 |
| `body_parts` | Body part definitions | 5 |
| `body_parts_translations` | Body part translations | 10 |
| `personal_records` | User personal bests | 0 |
| `user_exercise_estimates` | Exercise performance estimates | 0 |
| `user_exercise_overrides` | User exercise customizations | 0 |
| `user_exercise_warmup_prefs` | Warmup preferences | 0 |
| `user_exercise_warmups` | Warmup protocols | 0 |
| `user_muscle_priorities` | User muscle focus | 0 |
| `user_prioritized_muscle_groups` | Muscle group priorities | 0 |

### Workout System (17)
| Table | Purpose | Records |
|-------|---------|---------|
| `workouts` | Workout sessions | 0 |
| `workout_exercises` | Exercises in workouts | 0 |
| `workout_sets` | Individual exercise sets | 0 |
| `workout_set_grips` | Grip selections per set | 0 |
| `workout_set_metric_values` | Custom metric values | 0 |
| `workout_checkins` | Pre-workout assessments | 0 |
| `workout_comments` | Workout feedback | 0 |
| `workout_exercise_feedback` | Exercise-specific feedback | 0 |
| `workout_exercise_groups` | Exercise grouping (supersets) | 0 |
| `workout_likes` | Workout social interactions | 0 |
| `workout_session_feedback` | Session-level feedback | 0 |
| `workout_shares` | Workout sharing | 0 |
| `workout_templates` | Saved workout plans | 1 |
| `workout_templates_translations` | Template translations | 0 |
| `template_exercises` | Exercises in templates | 0 |
| `template_exercise_grips` | Template grip preferences | 0 |
| `template_exercise_preferences` | Template customizations | 0 |

### Health & Wellness (6)
| Table | Purpose | Records |
|-------|---------|---------|
| `pre_workout_checkins` | Pre-workout readiness | 0 |
| `readiness_checkins` | Daily readiness tracking | 0 |
| `cycle_events` | Menstrual cycle tracking | 0 |
| `pain_events` | Pain and injury tracking | 0 |
| `user_injuries` | Injury history | 0 |
| `rest_timer_sessions` | Rest period tracking | 0 |

### Gym Management (12)
| Table | Purpose | Records |
|-------|---------|---------|
| `gyms` | Gym locations | 1 |
| `gym_admins` | Gym administration | 0 |
| `gym_aliases` | Alternative gym names | 0 |
| `gym_equipment` | Gym-specific equipment | 0 |
| `gym_equipment_availability` | Equipment status | 0 |
| `gym_equipment_overrides` | Custom equipment settings | 0 |
| `gym_plate_inventory` | Available weight plates | 0 |
| `user_gyms` | User gym associations | 0 |
| `user_gym_memberships` | Gym memberships | 0 |
| `user_gym_profiles` | Gym-specific user data | 0 |
| `user_gym_visits` | Gym visit tracking | 0 |
| `bar_types` | Barbell specifications | 10 |

### Training Programs (7)
| Table | Purpose | Records |
|-------|---------|---------|
| `training_programs` | Structured training plans | 0 |
| `training_program_blocks` | Program phases | 0 |
| `user_active_templates` | Currently active templates | 0 |
| `user_program_state` | Program progression | 0 |
| `progression_policies` | Progression rules | 0 |
| `progressive_overload_plans` | Load progression plans | 0 |
| `warmup_policies` | Warmup protocols | 0 |

### Social & Community (6)
| Table | Purpose | Records |
|-------|---------|---------|
| `friendships` | User connections | 0 |
| `challenges` | Community challenges | 0 |
| `challenge_participants` | Challenge participation | 0 |
| `mentorships` | Coaching relationships | 0 |
| `mentor_profiles` | Coach profiles | 0 |
| `mentor_roles` | Mentor role definitions | 0 |

### Life Categories & Tracking (8)
| Table | Purpose | Records |
|-------|---------|---------|
| `life_categories` | Life area categories | 4 |
| `life_category_translations` | Category translations | 8 |
| `life_subcategories` | Category subdivisions | 13 |
| `life_subcategory_translations` | Subcategory translations | 26 |
| `user_pinned_subcategories` | User favorites | 0 |
| `user_category_prefs` | Category preferences | 0 |
| `streaks` | Habit tracking | 0 |
| `user_stats` | User statistics | 0 |

### Configuration & Metadata (12)
| Table | Purpose | Records |
|-------|---------|---------|
| `languages` | Supported languages | 2 |
| `text_translations` | UI text translations | 0 |
| `naming_templates` | Dynamic naming rules | 0 |
| `attribute_schemas` | Dynamic attribute definitions | 2 |
| `metric_defs` | Custom metric definitions | 17 |
| `experience_level_configs` | Training level parameters | 5 |
| `user_settings` | User preferences | 0 |
| `user_profile_fitness` | Fitness profile data | 0 |
| `user_fitness_profile` | Extended fitness data | 0 |
| `user_lifting_prefs` | Lifting preferences | 0 |
| `user_equipment_preferences` | Equipment preferences | 0 |
| `data_quality_reports` | Data integrity monitoring | 0 |

## Key Statistics
- Most active table: `admin_audit_log` (16,830 records)
- Largest configuration: `equipment_handle_orientations` (120 records)
- Core exercise data: 8 exercises with 16 translations
- Equipment catalog: 48 pieces of equipment with 93 translations
- Language support: 2 languages configured

## Database Health
- Total live tuples: ~17,500
- Dead tuples: Minimal (good maintenance)
- Most tables are empty (new system)
- Core reference data is populated

*This documentation is auto-generated from the current database state.*