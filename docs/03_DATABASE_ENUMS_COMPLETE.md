# Complete Database Enums Export

## Database Enums Overview
- **Database Type**: PostgreSQL with custom enum types
- **Schema**: Public schema custom enum definitions
- **Total Enums**: 23 custom enum types
- **Export Date**: 2025-01-06

## Enum Definitions

### app_role
**Purpose**: Application-level user roles for access control
**Values**: 
- `superadmin` - Highest level admin access
- `admin` - Standard admin access
- `mentor` - Mentor/coach role
- `user` - Standard user role

### attr_scope
**Purpose**: Attribute schema scope definitions
**Values**: 
- `global` - Global attributes
- `movement` - Movement-specific attributes  
- `equipment` - Equipment-specific attributes

### body_side
**Purpose**: Body side specification for unilateral exercises
**Values**: 
- `left` - Left side
- `right` - Right side
- `bilateral` - Both sides
- `unspecified` - No specific side

### effort_code
**Purpose**: Perceived exertion coding system
**Values**: 
- `++` - Very high effort/RPE
- `+` - High effort/RPE
- `-` - Low effort/RPE
- `--` - Very low effort/RPE

### exercise_skill_level
**Purpose**: Exercise difficulty/skill requirement classification
**Values**: 
- `low` - Beginner-friendly exercises
- `medium` - Intermediate exercises
- `high` - Advanced/complex exercises

### experience_level
**Purpose**: User fitness experience classification
**Values**: 
- `new` - Complete beginner
- `returning` - Returning after break
- `intermediate` - Some experience
- `advanced` - Very experienced
- `very_experienced` - Expert level

### fitness_goal
**Purpose**: User fitness goal categorization
**Values**: 
- `lose_weight` - Weight loss goal
- `maintain_weight` - Weight maintenance
- `gain_weight` - Weight gain goal
- `build_muscle` - Muscle building focus
- `increase_strength` - Strength improvement
- `improve_endurance` - Endurance training
- `general_fitness` - General health/fitness

### grip_orientation
**Purpose**: Hand grip orientation specifications
**Values**: 
- `overhand` - Palms facing away
- `underhand` - Palms facing toward
- `neutral` - Palms facing each other
- `mixed` - One overhand, one underhand

### group_type
**Purpose**: Exercise grouping for supersets and circuits
**Values**: 
- `solo` - Single exercise
- `superset` - Two exercises back-to-back
- `giant` - 3+ exercises in sequence
- `finisher` - Ending exercise set
- `circuit` - Circuit training format

### injury_severity
**Purpose**: Injury severity classification for constraints
**Values**: 
- `mild` - Minor injury/discomfort
- `moderate` - Moderate injury requiring care
- `severe` - Serious injury requiring modification
- `chronic` - Long-term/ongoing condition

### load_medium
**Purpose**: Type of resistance/load medium used
**Values**: 
- `bar` - Barbell loading
- `plates` - Weight plates
- `stack` - Weight stack machine
- `bodyweight` - Body weight resistance
- `other` - Other resistance types
- `band` - Resistance bands
- `chain` - Chain loading
- `flywheel` - Flywheel resistance

### load_type
**Purpose**: Loading mechanism classification
**Values**: 
- `none` - No external load
- `single_load` - Single-sided loading
- `dual_load` - Bilateral loading
- `stack` - Stack-based loading

### load_type_enum
**Purpose**: Extended load type classification
**Values**: 
- `barbell` - Barbell-based
- `single_load` - Single-sided load
- `dual_load` - Dual-sided load
- `stack` - Stack machine
- `bodyweight` - Body weight
- `fixed` - Fixed weight

### mentor_type
**Purpose**: Mentor/coach type classification
**Values**: 
- `mentor` - General mentor role
- `coach` - Specialized coach role

### metric_value_type
**Purpose**: Data type specification for exercise metrics
**Values**: 
- `int` - Integer values
- `numeric` - Decimal/numeric values
- `text` - Text/string values
- `bool` - Boolean values
- `enum` - Enumerated values

### primary_weight_goal
**Purpose**: Primary weight management goal
**Values**: 
- `lose` - Weight loss
- `maintain` - Weight maintenance
- `recomp` - Body recomposition
- `gain` - Weight gain

### progression_algo
**Purpose**: Progression algorithm types for training
**Values**: 
- `rep_range_linear` - Linear rep range progression
- `percent_1rm` - Percentage of 1RM based
- `rpe_based` - Rate of Perceived Exertion based
- `pyramid` - Pyramid progression
- `reverse_pyramid` - Reverse pyramid
- `dup` - Daily Undulating Periodization
- `custom` - Custom progression

### progression_model
**Purpose**: Training progression model classification
**Values**: 
- `double_progression` - Progress weight and reps
- `linear_load` - Linear load increases
- `rep_targets` - Target rep based
- `percent_1rm` - 1RM percentage based
- `rpe_based` - RPE-driven progression

### set_type
**Purpose**: Type of exercise set classification
**Values**: 
- `normal` - Standard working set
- `warmup` - Warm-up set
- `drop` - Drop set (reduced weight)
- `amrap` - As Many Reps As Possible
- `timed` - Time-based set
- `distance` - Distance-based set
- `top_set` - Heavy/peak set
- `backoff` - Reduced intensity set
- `cooldown` - Cool-down set

### sex_type
**Purpose**: Biological sex classification for user profiles
**Values**: 
- `male` - Male
- `female` - Female
- `other` - Other/non-binary
- `prefer_not_to_say` - Prefer not to specify

### training_focus
**Purpose**: Training focus/specialization areas
**Values**: 
- `muscle` - Muscle building focus
- `strength` - Strength development
- `general` - General fitness
- `power` - Power development
- `cardio` - Cardiovascular focus
- `bodybuilding` - Bodybuilding focus

### warmup_feedback
**Purpose**: User feedback on warmup adequacy
**Values**: 
- `not_enough` - Insufficient warmup
- `excellent` - Perfect warmup
- `too_much` - Excessive warmup

### warmup_quality
**Purpose**: Quality assessment of warmup sessions
**Values**: 
- `not_enough` - Inadequate warmup
- `excellent` - Optimal warmup
- `too_much` - Over-warming up

### weight_unit
**Purpose**: Weight measurement unit specification
**Values**: 
- `kg` - Kilograms
- `lb` - Pounds

## Enum Usage Patterns

### User Management
- `app_role` - Access control and permissions
- `experience_level` - User profiling and program selection
- `sex_type` - Demographic information
- `fitness_goal` - Goal-based program recommendations

### Exercise Classification
- `exercise_skill_level` - Exercise difficulty rating
- `load_type` / `load_type_enum` / `load_medium` - Equipment categorization
- `body_side` - Unilateral exercise specification
- `grip_orientation` - Grip specification for exercises

### Training Programming
- `set_type` - Set classification for programming
- `group_type` - Exercise grouping for supersets
- `progression_algo` / `progression_model` - Progression strategies
- `training_focus` - Training specialization areas

### Assessment & Feedback
- `effort_code` - Subjective effort rating
- `warmup_feedback` / `warmup_quality` - Warmup assessment
- `injury_severity` - Injury impact classification

### System Configuration
- `attr_scope` - Attribute system scoping
- `mentor_type` - Coach/mentor categorization
- `metric_value_type` - Data type validation
- `weight_unit` - Measurement standardization

## Data Integrity Notes

### Immutable Enums
- Enum values should not be changed once in production use
- New values can be added but existing values should remain stable
- Consider migration strategies for enum value changes

### Validation
- All enum columns use these types for automatic validation
- Database constraints ensure only valid enum values are stored
- Application layer should also validate against these enums

### Internationalization
- Enum values are stored in English
- Translation tables provide localized display names
- UI should use translation lookups for user-facing enum displays

### Future Expansion
- Enums can be extended with new values via database migrations
- Consider impact on existing data when adding new enum values
- Maintain backward compatibility with existing enum usage