# Complete Exercise Default Grips Data Export

Current state of default grip assignments for core exercises with strategic rationale.

## Default Grips Overview

**Total Exercises with Defaults**: 20 core lifts
**Default Strategy**: Exercise-specific biomechanics and safety
**Grip Types Used**: 4 (overhand, underhand, neutral, mixed)
**Order System**: Primary (order_index: 1), Secondary (order_index: 2)

## Default Grip Assignments by Exercise Family

### Bench Press Family (Overhand Primary)

| Exercise | Primary Grip | Secondary Grip | Rationale |
|----------|--------------|----------------|-----------|
| flat-bench-press | overhand | - | Standard pronated grip for pressing mechanics |
| incline-bench-press | overhand | - | Consistent with flat bench, optimal shoulder position |
| decline-bench-press | overhand | - | Maintains pressing pattern consistency |

**Biomechanical Rationale**: Overhand grip provides optimal wrist alignment and shoulder stability for pressing movements. Natural hand position for pushing motions.

### Pull-up Family (Overhand Primary, Underhand Secondary)

| Exercise | Primary Grip | Secondary Grip | Rationale |
|----------|--------------|----------------|-----------|
| pull-up | overhand | - | Wide lat activation, standard pull-up form |
| chin-up | underhand | overhand | Underhand primary for bicep engagement |
| lat-pulldown | overhand | underhand | Overhand primary for lat width, underhand for thickness |

**Biomechanical Rationale**: Overhand grip maximizes latissimus dorsi activation and shoulder external rotation. Underhand secondary option increases bicep involvement and provides variation.

### Bicep Curl Family (Underhand Primary, Neutral for Hammer)

| Exercise | Primary Grip | Secondary Grip | Rationale |
|----------|--------------|----------------|-----------|
| barbell-curl | underhand | - | Supinated grip for optimal bicep activation |
| ez-bar-curl | underhand | - | Angled bar reduces wrist stress while maintaining supination |
| preacher-curl | underhand | - | Isolated bicep work requires supinated grip |
| hammer-curl | neutral | - | Neutral grip targets brachialis and brachioradialis |

**Biomechanical Rationale**: Underhand (supinated) grip maximally activates biceps brachii. Neutral grip for hammer curls targets different arm muscles (brachialis, brachioradialis).

### Rowing Family (Overhand Primary)

| Exercise | Primary Grip | Secondary Grip | Rationale |
|----------|--------------|----------------|-----------|
| barbell-row | overhand | - | Pronated grip for maximum lat and rhomboid activation |
| dumbbell-row | overhand | - | Consistent rowing pattern, optimal pulling mechanics |
| t-bar-row | overhand | - | Heavy rowing movement with strong grip position |

**Biomechanical Rationale**: Overhand grip promotes proper shoulder blade retraction and external rotation. Maximizes posterior deltoid and middle trap activation.

### Shoulder Press Family (Overhand Primary)

| Exercise | Primary Grip | Secondary Grip | Rationale |
|----------|--------------|----------------|-----------|
| overhead-press | overhand | - | Pressing pattern requires pronated grip for stability |
| military-press | overhand | - | Strict overhead pressing with optimal wrist alignment |
| arnold-press | overhand | - | Starting position for rotation requires overhand |

**Biomechanical Rationale**: Overhand grip provides wrist stability and optimal force transmission for overhead pressing. Natural position for shoulder abduction and flexion.

### Deadlift Family (Overhand Primary, Mixed Secondary)

| Exercise | Primary Grip | Secondary Grip | Rationale |
|----------|--------------|----------------|-----------|
| deadlift | overhand | mixed | Overhand for strength development, mixed for max loads |
| romanian-deadlift | overhand | - | Hip hinge movement, overhand promotes proper back position |
| stiff-leg-deadlift | overhand | - | Hamstring focus, overhand grip sufficient for lighter loads |

**Biomechanical Rationale**: Overhand grip promotes balanced muscle development and proper spine position. Mixed grip reserved for maximal strength attempts when grip becomes limiting factor.

### Squat Family (Overhand Primary)

| Exercise | Primary Grip | Secondary Grip | Rationale |
|----------|--------------|----------------|-----------|
| squat | overhand | - | Bar positioning on back requires overhand grip |
| front-squat | overhand | - | Front rack position with overhand for beginners |

**Biomechanical Rationale**: Overhand grip for squats relates to bar positioning and shoulder mobility. Not primarily about pulling/pushing but about securing the load.

## Grip Assignment Strategy by Exercise Characteristics

### Pressing Movements → Overhand
- **Exercises**: All bench press, shoulder press variations
- **Rationale**: Overhand grip aligns wrists optimally for force production in pressing patterns
- **Benefits**: Maximum power transfer, joint stability, injury prevention

### Pulling Movements → Overhand Primary
- **Exercises**: Pull-ups, rows, lat pulldowns
- **Rationale**: Overhand maximizes target muscle activation (lats, rhomboids)
- **Benefits**: Better muscle development, improved posture muscles

### Bicep Isolation → Underhand
- **Exercises**: All curl variations (except hammer)
- **Rationale**: Supinated grip required for maximum bicep activation
- **Benefits**: Optimal muscle fiber recruitment, full ROM

### Heavy Pulling → Mixed Secondary
- **Exercises**: Deadlifts, heavy rows
- **Rationale**: Mixed grip prevents bar rotation at maximal loads
- **Benefits**: Allows heavier loads when grip strength becomes limiting

### Neutral Position → Specialized
- **Exercises**: Hammer curls, dips, some machine work
- **Rationale**: Equipment design or specific muscle targeting
- **Benefits**: Targets different muscle groups, reduces wrist stress

## Default Grip Benefits

### For Exercise Creation (Admin)
- **Smart Suggestions**: Reduces manual grip selection work
- **Biomechanically Sound**: Defaults follow exercise science principles
- **Consistent Patterns**: Similar exercises get similar grip defaults
- **Override Capability**: Admins can change defaults if needed

### For Workout Planning (User)
- **Sensible Defaults**: Users get appropriate grips without expertise
- **Educational**: Shows proper grip for each exercise type
- **Customizable**: Users can change grips based on goals/preferences
- **Safety**: Defaults promote safe lifting techniques

### For System Performance
- **Pre-computed**: No runtime grip selection logic needed
- **Cacheable**: Default grips can be cached for fast UI
- **Scalable**: New exercises inherit logical defaults based on type

## Grip Progression and Variations

### Beginner → Advanced Progression
1. **Start with defaults**: Learn proper movement patterns
2. **Understand variations**: Learn when/why to change grips
3. **Experiment safely**: Try different grips for muscle emphasis
4. **Specialize**: Use grip variations for specific training goals

### Common Grip Variations by Goal
- **Strength Focus**: Mixed grip for deadlifts, overhand for most others
- **Muscle Development**: Vary grips to target different muscle groups
- **Injury Prevention**: Neutral grips to reduce wrist/elbow stress
- **Powerlifting**: Mixed grip deadlifts, overhand bench press
- **Bodybuilding**: Grip variations for muscle emphasis

## Data Quality Assurance

### Validation Rules
- **Every core exercise** has at least one default grip
- **Default grips** are compatible with exercise's default equipment/handle
- **Primary defaults** (order_index: 1) exist before secondary options
- **Grip choices** align with biomechanical best practices

### Consistency Checks
- **Similar exercises** have similar grip defaults
- **Exercise families** follow consistent grip patterns
- **Safety considerations** prioritized in default selections
- **Beginner-friendly** defaults chosen over advanced variations

## System Integration

### With Compatibility Tables
- **Default grips** guaranteed to be compatible with equipment/handles
- **Fallback options** available if defaults don't work for specific setup
- **UI validation** ensures selected grips are possible

### With Exercise Creation
- **Auto-assignment** of defaults based on movement pattern
- **Override capability** for exercise-specific needs
- **Bulk operations** to assign defaults to exercise families

### With Workout Planning
- **Template creation** uses default grips automatically
- **User customization** allows grip changes per workout
- **Progress tracking** can be grip-specific if needed

**Status**: ✅ Complete default grip coverage for 20 core lifts with biomechanically sound assignments