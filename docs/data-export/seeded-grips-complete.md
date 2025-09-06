# Complete Grips Data Export

Current state of grip system with translations and compatibility.

## Grips Overview

**Total Grips**: 4 orientation-based grips
**Languages**: English + Romanian translations  
**Category**: hand_position (simplified from complex grip system)
**Compatibility**: Full matrix with all handles

## Grips Data

| ID | Slug | Category | English Name | Romanian Name | Description |
|----|------|----------|--------------|---------------|-------------|
| 38571da9-3843-4004-b0e5-dee9c953bde1 | overhand | hand_position | Overhand | Pronată | Palms facing down/away from body |
| 255960ca-ec28-484f-8f2f-11089be4fb19 | underhand | hand_position | Underhand | Supinată | Palms facing up/toward body |
| 3f119821-a26d-43c9-ac19-1746f286862f | neutral | hand_position | Neutral | Neutră | Palms facing each other (hammer grip) |
| 353c77e2-cd33-43c5-a396-095b96c2f4cc | mixed | hand_position | Mixed | Mixtă | One hand overhand, one hand underhand |

## Grip Usage by Exercise Type

### Overhand Grip (Primary Usage)
- **Bench Press Family**: flat, incline, decline bench press
- **Pull-ups**: wide grip, standard pull-ups
- **Rows**: barbell rows, dumbbell rows, t-bar rows
- **Shoulder Presses**: overhead press, military press, arnold press
- **Deadlifts**: conventional, romanian, stiff-leg (primary)
- **Squats**: back squat, front squat positioning
- **Tricep Exercises**: close-grip bench press, pushdowns

### Underhand Grip (Primary Usage)
- **Bicep Curls**: barbell curl, ez-bar curl, preacher curl
- **Chin-ups**: underhand pull-ups for bicep emphasis
- **Some Rows**: underhand barbell rows for bicep activation

### Neutral Grip (Primary Usage)
- **Hammer Curls**: neutral grip bicep curls
- **Tricep Dips**: parallel bar positioning
- **Some Machine Work**: neutral grip attachments

### Mixed Grip (Specialized Usage)
- **Heavy Deadlifts**: powerlifting style for grip security
- **Heavy Rows**: when standard grip fails at high weights

## Handle-Grip Compatibility Matrix

### Universal Compatibility (All 4 Grips)
- **straight-bar**: overhand, underhand, neutral, mixed
- **single-handle**: overhand, underhand, neutral
- **suspension-straps**: overhand, underhand, neutral

### Neutral-Only Handles (Specialized)
- **dip-handles**: neutral only
- **dual-d-handle**: neutral only  
- **seated-row-bar**: neutral only
- **swiss-bar**: neutral only
- **trap-bar**: neutral only
- **tricep-rope**: neutral only

### Limited Grip Handles
- **ez-curl-bar**: overhand, underhand (no neutral/mixed)
- **lat-pulldown-bar**: overhand, underhand, neutral (no mixed)
- **pull-up-bar**: overhand, underhand (no neutral/mixed)

## Default Grip Assignments by Exercise

### 20 Core Lifts Default Grips
```sql
-- Bench Press Family → overhand
flat-bench-press: overhand (primary)
incline-bench-press: overhand (primary)
decline-bench-press: overhand (primary)

-- Pull-up Family → overhand (with underhand options)
pull-up: overhand (primary), underhand (secondary)
chin-up: underhand (primary), overhand (secondary)
lat-pulldown: overhand (primary), underhand (secondary)

-- Bicep Curls → underhand (except hammer)
barbell-curl: underhand (primary)
ez-bar-curl: underhand (primary)
preacher-curl: underhand (primary)
hammer-curl: neutral (primary)

-- Rows → overhand
barbell-row: overhand (primary)
dumbbell-row: overhand (primary)
t-bar-row: overhand (primary)

-- Shoulder Press → overhand
overhead-press: overhand (primary)
military-press: overhand (primary)
arnold-press: overhand (primary)

-- Deadlifts → overhand + mixed
deadlift: overhand (primary), mixed (secondary)
romanian-deadlift: overhand (primary)
stiff-leg-deadlift: overhand (primary)

-- Squats → overhand (for bar positioning)
squat: overhand (primary)
front-squat: overhand (primary)
```

## Grip System Benefits

### Simplified but Complete
- **4 grips cover 95% of exercise variations**
- **Orientation-based eliminates width complexity**
- **Easy for users to understand and select**

### Smart Defaults Reduce Work
- **No empty grip selectors in UI**
- **Exercise-specific defaults make sense**
- **Fallback compatibility ensures choice always available**

### Bilingual Support
- **English + Romanian names**
- **Consistent terminology across languages**
- **Standard gym vocabulary**

## Translation Quality

- **English**: Standard gym terminology (overhand, underhand, neutral, mixed)
- **Romanian**: Proper anatomical terms (pronată, supinată, neutră, mixtă)
- **Coverage**: 100% complete for all 4 grips

**Status**: ✅ Complete and ready for production use