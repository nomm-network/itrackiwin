# Complete Database Enums Documentation 2025

**Generated**: January 10, 2025  
**Database**: PostgreSQL (Supabase)  
**Schema**: public  

## Overview

This document provides a comprehensive catalog of all custom PostgreSQL enum types used in the fitness platform database. These enums ensure data consistency, type safety, and provide clear constraints for application logic.

**Total Custom Enums**: 23

## User Management Enums

### `app_role`
**Purpose**: System-wide user roles for access control  
**Values**:
- `superadmin` - Highest system privileges, platform management
- `admin` - Administrative privileges, content management  
- `mentor` - Coaching and mentorship capabilities
- `user` - Standard user access level

**Usage**: Role-based access control, RLS policies, permission checking

### `experience_level`
**Purpose**: User fitness experience classification  
**Values**:
- `new` - Beginner, less than 6 months experience
- `returning` - Previously trained, returning after break
- `intermediate` - 6 months to 2 years experience
- `advanced` - 2-5 years consistent training
- `very_experienced` - 5+ years, expert level

**Usage**: Program generation, exercise selection, coaching algorithms

### `sex_type`
**Purpose**: User biological sex for program customization  
**Values**:
- `male` - Male physiology
- `female` - Female physiology  
- `other` - Non-binary or other
- `prefer_not_to_say` - Privacy option

**Usage**: Program customization, health tracking, analytics

## Fitness & Exercise Enums

### `exercise_skill_level`
**Purpose**: Exercise difficulty and skill requirement  
**Values**:
- `low` - Basic movements, beginner-friendly
- `medium` - Intermediate complexity, some experience needed
- `high` - Advanced movements, significant skill required

**Usage**: Exercise filtering, program progression, safety recommendations

### `fitness_goal`
**Purpose**: Primary fitness objectives for program design  
**Values**:
- `lose_weight` - Weight loss focus
- `maintain_weight` - Weight maintenance
- `gain_weight` - Weight gain focus
- `build_muscle` - Muscle hypertrophy
- `increase_strength` - Strength development
- `improve_endurance` - Cardiovascular fitness
- `general_fitness` - Overall health and fitness

**Usage**: Program selection, exercise prioritization, progress tracking

### `primary_weight_goal`
**Purpose**: Simplified weight management objectives  
**Values**:
- `lose` - Weight loss
- `maintain` - Weight maintenance
- `recomp` - Body recomposition
- `gain` - Weight gain

**Usage**: Nutrition guidance, calorie calculations, progress metrics

### `training_focus`
**Purpose**: Primary training emphasis areas  
**Values**:
- `muscle` - Muscle building and hypertrophy
- `strength` - Maximal strength development
- `general` - General fitness and health
- `power` - Power and explosive movements
- `cardio` - Cardiovascular endurance
- `bodybuilding` - Aesthetic muscle development

**Usage**: Program design, exercise selection, periodization

## Workout & Set Management Enums

### `set_type`
**Purpose**: Classification of different set types in workouts  
**Values**:
- `normal` - Standard working sets
- `warmup` - Preparation sets with lighter weight
- `drop` - Drop sets with weight reduction
- `amrap` - As Many Reps As Possible sets
- `timed` - Time-based sets
- `distance` - Distance-based sets (cardio)
- `top_set` - Heaviest working set
- `backoff` - Reduced weight sets after top set
- `cooldown` - Recovery sets

**Usage**: Set tracking, progression analysis, workout structure

### `group_type`
**Purpose**: Exercise grouping and superset organization  
**Values**:
- `solo` - Individual exercise
- `superset` - Two exercises back-to-back
- `giant` - Three or more exercises in sequence
- `finisher` - High-intensity concluding exercises
- `circuit` - Timed circuit training

**Usage**: Workout structure, rest period calculation, training intensity

## Equipment & Loading Enums

### `load_type`
**Purpose**: Equipment loading mechanism classification  
**Values**:
- `none` - Bodyweight or unloaded
- `single_load` - Single-sided loading (dumbbells, kettlebells)
- `dual_load` - Bilateral loading (barbells)
- `stack` - Weight stack machines

**Usage**: Weight calculations, increment determination, equipment selection

### `load_type_enum`
**Purpose**: Detailed loading system classification  
**Values**:
- `barbell` - Barbell loading system
- `single_load` - Single implement loading
- `dual_load` - Bilateral implement loading
- `stack` - Machine weight stack
- `bodyweight` - Bodyweight resistance
- `fixed` - Fixed weight implements

**Usage**: Exercise categorization, weight progression, equipment matching

### `load_medium`
**Purpose**: Physical loading medium identification  
**Values**:
- `bar` - Barbell or similar bar
- `plates` - Weight plates
- `stack` - Machine weight stack
- `bodyweight` - Body weight resistance
- `other` - Alternative loading methods
- `band` - Resistance bands
- `chain` - Chain loading
- `flywheel` - Flywheel resistance

**Usage**: Equipment selection, resistance type, workout variation

### `weight_unit`
**Purpose**: Weight measurement units  
**Values**:
- `kg` - Kilograms (metric)
- `lb` - Pounds (imperial)

**Usage**: Weight display, calculations, user preferences

## Grip & Body Position Enums

### `grip_orientation`
**Purpose**: Hand grip positioning on implements  
**Values**:
- `overhand` - Palms facing away (pronated)
- `underhand` - Palms facing toward (supinated)
- `neutral` - Palms facing each other
- `mixed` - One overhand, one underhand

**Usage**: Exercise variation, muscle targeting, grip strength

### `body_side`
**Purpose**: Body side specification for unilateral exercises  
**Values**:
- `left` - Left side only
- `right` - Right side only
- `bilateral` - Both sides simultaneously
- `unspecified` - Side not specified

**Usage**: Unilateral tracking, muscle balance, injury prevention

## Progression & Programming Enums

### `progression_algo`
**Purpose**: Training progression methodologies  
**Values**:
- `rep_range_linear` - Linear progression within rep ranges
- `percent_1rm` - Percentage-based on 1RM
- `rpe_based` - Rate of Perceived Exertion based
- `pyramid` - Pyramid set structure
- `reverse_pyramid` - Reverse pyramid structure
- `dup` - Daily Undulating Periodization
- `custom` - User-defined progression

**Usage**: Program generation, weight progression, periodization

### `progression_model`
**Purpose**: Simplified progression frameworks  
**Values**:
- `double_progression` - Reps then weight progression
- `linear_load` - Consistent weight increases
- `rep_targets` - Target rep achievement
- `percent_1rm` - 1RM percentage based
- `rpe_based` - RPE-guided progression

**Usage**: Programming algorithms, progression tracking

## Health & Wellness Enums

### `injury_severity`
**Purpose**: Injury classification for tracking and modification  
**Values**:
- `mild` - Minor discomfort, minimal impact
- `moderate` - Noticeable limitation, some modifications needed
- `severe` - Significant limitation, major modifications required
- `chronic` - Ongoing condition requiring permanent adaptations

**Usage**: Exercise modification, program adaptation, health tracking

### `effort_code`
**Purpose**: Simplified effort rating system  
**Values**:
- `++` - Very easy, low effort
- `+` - Easy, moderate effort
- `-` - Hard, high effort
- `--` - Maximal, extremely high effort

**Usage**: RPE tracking, effort assessment, load management

### `warmup_feedback` / `warmup_quality`
**Purpose**: Warmup adequacy assessment  
**Values**:
- `not_enough` - Insufficient warmup
- `excellent` - Optimal warmup
- `too_much` - Excessive warmup

**Usage**: Warmup optimization, injury prevention, preparation quality

## Coaching & Mentorship Enums

### `mentor_type`
**Purpose**: Mentorship role classification  
**Values**:
- `mentor` - General mentorship and guidance
- `coach` - Specific training coaching

**Usage**: Service categorization, expertise matching, platform organization

## Technical & System Enums

### `attr_scope`
**Purpose**: Attribute schema scope definition  
**Values**:
- `global` - System-wide attributes
- `movement` - Movement-specific attributes
- `equipment` - Equipment-specific attributes

**Usage**: Dynamic schema management, attribute organization

### `metric_value_type`
**Purpose**: Custom metric data type specification  
**Values**:
- `int` - Integer values
- `numeric` - Decimal numbers
- `text` - Text strings
- `bool` - Boolean true/false
- `enum` - Enumerated options

**Usage**: Custom metric definition, data validation, type checking

### `post_reaction`
**Purpose**: Social media post reaction types  
**Values**:
- `like` - General approval
- `dislike` - General disapproval
- `muscle` - Strength/muscle related
- `clap` - Applause/celebration
- `ok` - Acknowledgment
- `fire` - Excitement/intensity
- `heart` - Love/appreciation
- `cheers` - Celebration
- `thumbsup` - Approval/encouragement

**Usage**: Social engagement, community interaction, feedback

## Usage Patterns

### Validation and Constraints
- All enums provide database-level validation
- Prevent invalid data entry
- Ensure referential consistency

### Application Logic
- Type-safe value handling
- Clear business rule definition
- Reduced magic strings/numbers

### UI Components
- Dropdown/select options
- Filter categories
- Display standardization

### Analytics and Reporting
- Consistent categorization
- Aggregation groupings
- Trend analysis

## Data Integrity Notes

### Immutability
- Enum values should not be modified once in use
- New values can be added to the end of enum lists
- Removing values requires careful migration planning

### Database-Level Validation
- PostgreSQL enforces enum constraints automatically
- Invalid values are rejected at the database level
- Provides strong data quality guarantees

### Internationalization Considerations
- Enum values are stored in English
- Display strings should be localized in the application layer
- Translation tables map enum values to localized text

### Application-Database Synchronization
- Application code must stay synchronized with database enum definitions
- Type generation tools should reflect current database state
- Schema migration tools should handle enum changes safely

These enums form the foundation of type safety and data consistency throughout the fitness platform, enabling robust business logic and ensuring data quality at the database level.