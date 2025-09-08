# Complete Database Enums Documentation

**Export Date:** 2025-01-08  
**Database:** PostgreSQL (Supabase)  
**Schema:** public  
**Total Custom Types:** 24

## Overview

This document provides a comprehensive overview of all custom PostgreSQL enum types used within the database schema. These enums provide type safety, data validation, and semantic meaning to various fields throughout the system.

## Complete Enum Definitions

### 1. app_role
**Purpose:** Defines user role hierarchy and permissions
**Values:**
- `superadmin` - Highest level admin with full system access
- `admin` - Administrative user with management capabilities
- `mentor` - Coaching/mentoring user with client management features
- `user` - Standard user with personal tracking capabilities

### 2. attr_scope
**Purpose:** Defines attribute schema scope for dynamic attributes
**Values:**
- `global` - Global attribute schemas applicable across all contexts
- `movement` - Movement-specific attribute schemas
- `equipment` - Equipment-specific attribute schemas

### 3. body_side
**Purpose:** Specifies which side of the body is being targeted/used
**Values:**
- `left` - Left side of body
- `right` - Right side of body
- `bilateral` - Both sides simultaneously
- `unspecified` - Side not specified or not applicable

### 4. effort_code
**Purpose:** Quick effort/difficulty rating for sets and exercises
**Values:**
- `++` - Very easy (RPE 6 equivalent)
- `+` - Easy (RPE 7 equivalent)
- `-` - Hard (RPE 9 equivalent)
- `--` - Maximal effort (RPE 10 equivalent)

### 5. exercise_skill_level
**Purpose:** Defines the skill level required for exercises
**Values:**
- `low` - Beginner-friendly exercises
- `medium` - Intermediate exercises requiring some experience
- `high` - Advanced exercises requiring significant skill/experience

### 6. experience_level
**Purpose:** User's overall fitness/training experience level
**Values:**
- `new` - New to fitness/training
- `returning` - Returning after time away
- `intermediate` - Some training experience
- `advanced` - Significant training experience
- `very_experienced` - Highly experienced trainee

### 7. fitness_goal
**Purpose:** User's primary fitness objectives
**Values:**
- `lose_weight` - Primary goal is weight loss
- `maintain_weight` - Maintain current weight
- `gain_weight` - Increase overall body weight
- `build_muscle` - Increase muscle mass
- `increase_strength` - Improve strength performance
- `improve_endurance` - Enhance cardiovascular/muscular endurance
- `general_fitness` - Overall health and fitness improvement

### 8. grip_orientation
**Purpose:** Hand/grip positioning for exercises
**Values:**
- `overhand` - Palms facing away (pronated)
- `underhand` - Palms facing toward (supinated)
- `neutral` - Palms facing each other
- `mixed` - One overhand, one underhand

### 9. group_type
**Purpose:** Exercise grouping types within workouts
**Values:**
- `solo` - Single exercise performed independently
- `superset` - Two exercises performed back-to-back
- `giant` - Three or more exercises performed consecutively
- `finisher` - High-intensity finishing exercise(s)
- `circuit` - Multiple exercises in rotation

### 10. injury_severity
**Purpose:** Classification of injury severity levels
**Values:**
- `mild` - Minor injury with minimal impact
- `moderate` - Moderate injury requiring modifications
- `severe` - Serious injury requiring significant restrictions
- `chronic` - Long-term or recurring injury condition

### 11. load_medium
**Purpose:** The type of resistance/load used in exercises
**Values:**
- `bar` - Barbell-based resistance
- `plates` - Weight plates (typically with barbells/dumbbells)
- `stack` - Weight stack machines
- `bodyweight` - Body weight as resistance
- `other` - Other forms of resistance
- `band` - Resistance bands
- `chain` - Chain resistance
- `flywheel` - Flywheel resistance systems

### 12. load_type
**Purpose:** Loading mechanism for equipment
**Values:**
- `none` - No external load
- `single_load` - Single-sided loading
- `dual_load` - Both sides loaded (barbells, dumbbells)
- `stack` - Weight stack system

### 13. load_type_enum
**Purpose:** Alternative load type classification
**Values:**
- `barbell` - Barbell exercises
- `single_load` - Single-sided loading
- `dual_load` - Dual-sided loading
- `stack` - Stack-based loading
- `bodyweight` - Bodyweight exercises
- `fixed` - Fixed weight equipment

### 14. mentor_type
**Purpose:** Classification of mentoring/coaching roles
**Values:**
- `mentor` - General mentorship role
- `coach` - Professional coaching role

### 15. metric_value_type
**Purpose:** Data types for custom metrics
**Values:**
- `int` - Integer values
- `numeric` - Decimal/numeric values
- `text` - Text/string values
- `bool` - Boolean true/false values
- `enum` - Enumerated values from predefined list

### 16. primary_weight_goal
**Purpose:** User's primary weight-related objective
**Values:**
- `lose` - Lose body weight
- `maintain` - Maintain current weight
- `recomp` - Body recomposition (lose fat, gain muscle)
- `gain` - Gain body weight

### 17. progression_algo
**Purpose:** Progression algorithm types for training
**Values:**
- `rep_range_linear` - Linear progression within rep ranges
- `percent_1rm` - Percentage of one-rep max based
- `rpe_based` - Rate of Perceived Exertion based
- `pyramid` - Pyramid progression scheme
- `reverse_pyramid` - Reverse pyramid progression
- `dup` - Daily Undulating Periodization
- `custom` - Custom progression algorithm

### 18. progression_model
**Purpose:** Training progression models
**Values:**
- `double_progression` - Progress weight and reps
- `linear_load` - Linear load progression
- `rep_targets` - Target repetition based
- `percent_1rm` - One-rep max percentage based
- `rpe_based` - RPE-based progression

### 19. set_type
**Purpose:** Classification of different set types
**Values:**
- `normal` - Standard working set
- `warmup` - Warmup preparation set
- `drop` - Drop/strip set (reduce weight)
- `amrap` - As Many Reps As Possible
- `timed` - Time-based set
- `distance` - Distance-based set
- `top_set` - Heaviest/primary working set
- `backoff` - Reduced weight follow-up set
- `cooldown` - Cool-down/recovery set

### 20. sex_type
**Purpose:** Biological sex classification for physiological considerations
**Values:**
- `male` - Male
- `female` - Female
- `other` - Other/non-binary
- `prefer_not_to_say` - Prefer not to disclose

### 21. training_focus
**Purpose:** Primary training focus/methodology
**Values:**
- `muscle` - Muscle building focus
- `strength` - Strength development focus
- `general` - General fitness focus
- `power` - Power development focus
- `cardio` - Cardiovascular focus
- `bodybuilding` - Bodybuilding methodology

### 22. warmup_feedback
**Purpose:** User feedback on warmup adequacy
**Values:**
- `not_enough` - Warmup was insufficient
- `excellent` - Warmup was perfect
- `too_much` - Warmup was excessive

### 23. warmup_quality
**Purpose:** Assessment of warmup quality/effectiveness
**Values:**
- `not_enough` - Insufficient warmup
- `excellent` - Optimal warmup
- `too_much` - Excessive warmup

### 24. weight_unit
**Purpose:** Weight measurement units
**Values:**
- `kg` - Kilograms
- `lb` - Pounds

## Usage Patterns

### User Management
- `app_role` - Role-based access control
- `experience_level` - User experience classification
- `sex_type` - Physiological considerations

### Exercise Classification
- `exercise_skill_level` - Exercise difficulty
- `set_type` - Set categorization
- `grip_orientation` - Grip specifications
- `body_side` - Laterality specification

### Training Programming
- `progression_algo` & `progression_model` - Progression strategies
- `training_focus` - Training methodology
- `group_type` - Exercise organization
- `effort_code` - Quick effort rating

### Equipment & Loading
- `load_type` & `load_type_enum` - Loading mechanisms
- `load_medium` - Resistance types
- `weight_unit` - Measurement standards

### Goals & Assessment
- `fitness_goal` & `primary_weight_goal` - User objectives
- `warmup_feedback` & `warmup_quality` - Assessment metrics
- `injury_severity` - Health considerations

### System Configuration
- `attr_scope` - Attribute system scoping
- `mentor_type` - Mentorship classification
- `metric_value_type` - Custom metric data types

## Data Integrity Notes

1. **Immutability:** Enum values should not be changed once in use to maintain data integrity
2. **Validation:** All enum usage is automatically validated at the database level
3. **Internationalization:** Display names for enums should be handled through translation tables
4. **Future Expansion:** New enum values can be added through database migrations
5. **Application Sync:** Ensure frontend TypeScript types stay synchronized with database enums

These enums provide a robust foundation for type safety and semantic clarity throughout the fitness platform database.