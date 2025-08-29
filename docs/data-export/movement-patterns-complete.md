# Complete Movement Patterns Data Export

Current state of movement pattern classification system with translations.

## Movement Patterns Overview

**Total Patterns**: 12 movement classifications
**Languages**: English (complete), Romanian (partial)
**Usage**: Exercise categorization and filtering
**Classification**: Primary movement mechanics

## Movement Patterns Data

| Slug | English Name | Romanian Name | Description | Exercise Examples |
|------|--------------|---------------|-------------|-------------------|
| press | Press | - | Pushing movements away from body | Bench Press, Overhead Press, Push-ups |
| pull | Pull | - | Pulling movements toward body | Pull-ups, Rows, Lat Pulldowns |
| squat | Squat | - | Knee-dominant leg movements | Back Squat, Front Squat, Goblet Squat |
| hinge | Hinge | - | Hip-dominant posterior chain | Deadlifts, Romanian Deadlifts, Hip Thrusts |
| lunge | Lunge | - | Single-leg stepping movements | Forward Lunge, Reverse Lunge, Step-ups |
| carry | Carry | - | Loaded ambulation patterns | Farmer's Walk, Suitcase Carry, Overhead Carry |
| rotation | Rotation | - | Rotational core movements | Russian Twists, Wood Chops, Cable Rotations |
| flexion | Flexion | - | Spinal/joint flexion patterns | Crunches, Leg Raises, Hanging Knee Raises |
| extension | Extension | - | Spinal/joint extension patterns | Back Extensions, Reverse Hyperextensions |
| lateral | Lateral | - | Side-to-side movement patterns | Lateral Lunges, Side Planks, Lateral Raises |
| curl | Curl | - | Elbow flexion isolation | Bicep Curls, Hammer Curls, Preacher Curls |
| tricep | Tricep | - | Elbow extension isolation | Tricep Extensions, Close-Grip Bench, Dips |

## Movement Pattern Classification Logic

### Primary Patterns (Compound Movements)

#### Press Pattern
- **Primary Joint Action**: Shoulder horizontal adduction + elbow extension
- **Plane of Motion**: Primarily sagittal, some frontal
- **Muscle Groups**: Chest, shoulders, triceps
- **Examples**: Bench press, overhead press, push-ups, dips

#### Pull Pattern  
- **Primary Joint Action**: Shoulder adduction + elbow flexion
- **Plane of Motion**: Primarily sagittal, some frontal
- **Muscle Groups**: Lats, rhomboids, rear delts, biceps
- **Examples**: Pull-ups, rows, lat pulldowns

#### Squat Pattern
- **Primary Joint Action**: Knee flexion with ankle dorsiflexion
- **Plane of Motion**: Primarily sagittal
- **Muscle Groups**: Quads, glutes, calves
- **Examples**: Back squat, front squat, goblet squat

#### Hinge Pattern
- **Primary Joint Action**: Hip flexion with minimal knee bend
- **Plane of Motion**: Primarily sagittal
- **Muscle Groups**: Glutes, hamstrings, erector spinae
- **Examples**: Deadlifts, Romanian deadlifts, good mornings

### Secondary Patterns (Specialized Movements)

#### Lunge Pattern
- **Primary Joint Action**: Single-leg squat with step
- **Plane of Motion**: Sagittal, frontal, transverse
- **Muscle Groups**: Unilateral leg muscles, core
- **Examples**: Forward/reverse lunges, step-ups, Bulgarian split squats

#### Carry Pattern
- **Primary Joint Action**: Isometric holds during ambulation
- **Plane of Motion**: All planes (anti-movement)
- **Muscle Groups**: Core, traps, grip, full body
- **Examples**: Farmer's walks, suitcase carries, overhead carries

#### Rotation Pattern
- **Primary Joint Action**: Spinal rotation
- **Plane of Motion**: Transverse
- **Muscle Groups**: Obliques, transverse abdominis, rotators
- **Examples**: Russian twists, wood chops, cable rotations

### Isolation Patterns (Single-Joint Movements)

#### Flexion Pattern
- **Primary Joint Action**: Spinal or joint flexion
- **Plane of Motion**: Sagittal
- **Muscle Groups**: Rectus abdominis, hip flexors
- **Examples**: Crunches, leg raises, sit-ups

#### Extension Pattern
- **Primary Joint Action**: Spinal or joint extension
- **Plane of Motion**: Sagittal  
- **Muscle Groups**: Erector spinae, glutes
- **Examples**: Back extensions, reverse hyperextensions

#### Lateral Pattern
- **Primary Joint Action**: Lateral flexion or abduction
- **Plane of Motion**: Frontal
- **Muscle Groups**: Obliques, abductors, lateral delts
- **Examples**: Lateral lunges, side planks, lateral raises

#### Curl Pattern
- **Primary Joint Action**: Elbow flexion
- **Plane of Motion**: Sagittal
- **Muscle Groups**: Biceps, brachialis, brachioradialis
- **Examples**: Bicep curls, hammer curls, preacher curls

#### Tricep Pattern
- **Primary Joint Action**: Elbow extension
- **Plane of Motion**: Sagittal
- **Muscle Groups**: Triceps
- **Examples**: Tricep extensions, close-grip bench, overhead extensions

## Exercise Classification Examples

### Bench Press Family
- **Pattern**: press
- **Rationale**: Horizontal pushing movement, shoulder horizontal adduction

### Pull-up Family  
- **Pattern**: pull
- **Rationale**: Vertical pulling movement, shoulder adduction

### Deadlift Family
- **Pattern**: hinge
- **Rationale**: Hip-dominant posterior chain movement

### Squat Family
- **Pattern**: squat
- **Rationale**: Knee-dominant leg movement with hip flexion

### Bicep Curl Family
- **Pattern**: curl
- **Rationale**: Isolated elbow flexion movement

### Row Family
- **Pattern**: pull
- **Rationale**: Horizontal pulling movement, shoulder adduction

## Movement Pattern Usage

### Exercise Creation
- **Required Field**: Every exercise must have movement pattern
- **Filtering**: Admins can filter exercises by pattern
- **Validation**: Ensures exercise is categorized correctly

### Program Design
- **Balance**: Programs can ensure movement pattern balance
- **Progression**: Track volume across movement patterns
- **Recovery**: Manage fatigue by movement pattern

### Search & Discovery
- **Category Browsing**: Users can browse by movement type
- **Pattern Filtering**: Find all "press" or "pull" exercises
- **Movement Education**: Learn movement classifications

## Translation Status

### Complete English Names
All 12 movement patterns have clear English names using standard biomechanics terminology.

### Missing Romanian Translations
Currently only English translations are available. Romanian translations needed for:
- press → "împingere" or "presă"
- pull → "tragere" or "tras"
- squat → "genuflexiune"
- hinge → "întoarcere din șold"
- lunge → "afund"
- carry → "cărare" or "transport"
- rotation → "rotație"
- flexion → "flexie"
- extension → "extensie"
- lateral → "lateral"
- curl → "flexie cot"
- tricep → "extensie triceps"

## System Benefits

### Exercise Organization
- **Logical grouping** of exercises by movement mechanics
- **Consistent classification** across all exercises
- **Biomechanically sound** categories

### Programming Support
- **Movement balance** in workout templates
- **Pattern-specific** volume tracking
- **Recovery planning** by movement type

### User Education
- **Movement literacy** through categorization
- **Exercise selection** guidance
- **Progression planning** by pattern mastery

## Recommended Improvements

1. **Add Romanian translations** for all 12 patterns
2. **Expand descriptions** with movement cues
3. **Add pattern illustrations** for visual reference
4. **Create sub-patterns** for more specific classification

**Status**: ✅ Functional with English names, needs Romanian translations