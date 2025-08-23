# Grip Effects System Implementation

## Overview
Implemented automatic secondary muscle adjustment based on grips, allowing for dynamic muscle emphasis calculation when different grips are selected for exercises.

## Database Changes

### New Tables

1. **exercise_grip_effects**
   - Maps how different grips affect muscle emphasis for specific exercises
   - Includes effect percentages (+20% means +20% emphasis, -15% means -15%)
   - Supports primary muscle overrides for specific grips
   - Equipment-specific effects for barbell/cable variations

2. **gym_machine_grip_options**
   - Tracks which grips/handles are available for specific gym machines
   - Prevents suggesting unavailable grips to users

### New Functions

1. **get_effective_muscles()**
   - RPC function that computes effective muscle activation based on selected grips
   - Takes exercise_id, grip_ids array, and optional equipment_id
   - Returns muscles with base role, effective score, and primary muscle status
   - Accounts for grip effects and equipment variations

## UI Components

### New Components

1. **ExerciseGripEffects** (`src/components/exercise/ExerciseGripEffects.tsx`)
   - Shows available grips for an exercise with expandable interface
   - Displays dynamic muscle emphasis when grips are selected
   - Auto-selects first grip if none selected

2. **EffectiveMuscles** (`src/components/exercise/EffectiveMuscles.tsx`)
   - Displays muscle badges with dynamic emphasis percentages
   - Shows primary vs secondary muscle classifications
   - Indicates activation changes from grip selection

3. **ExerciseCardWithGrips** (`src/components/exercise/ExerciseCardWithGrips.tsx`)
   - Complete exercise card with integrated grip selection and muscle display
   - Example implementation for exercise cards

### New Hooks

1. **useEffectiveMuscles** (`src/hooks/useEffectiveMuscles.ts`)
   - React Query hook for fetching effective muscle data
   - Handles caching and automatic refetching

2. **useWorkoutSetGrips** (`src/hooks/useWorkoutSetGrips.ts`)
   - Manages saving workout sets with grip information
   - Uses the existing set_log RPC function with grip_ids

## Integration Points

### Workout Set Saving
- The existing `set_log` RPC function already supports grip_ids in the payload
- Grips are automatically saved to `workout_set_grips` table
- Personal records are calculated with grip variations

### Exercise Selection
- Grip selection integrates with existing exercise default grips
- Supports multi-grip selection for complex movements
- Equipment-aware grip suggestions

## Usage Examples

### Basic Grip Selection
```tsx
import { ExerciseGripEffects } from "@/components/exercise/ExerciseGripEffects";

const [selectedGrips, setSelectedGrips] = useState<string[]>([]);

<ExerciseGripEffects
  exerciseId={exercise.id}
  selectedGripIds={selectedGrips}
  onGripChange={setSelectedGrips}
  equipmentId={exercise.equipment_id}
/>
```

### Effective Muscles Display
```tsx
import { EffectiveMuscles } from "@/components/exercise/EffectiveMuscles";

<EffectiveMuscles
  exerciseId={exercise.id}
  gripIds={selectedGrips}
  equipmentId={exercise.equipment_id}
/>
```

### Complete Exercise Card
```tsx
import { ExerciseCardWithGrips } from "@/components/exercise/ExerciseCardWithGrips";

<ExerciseCardWithGrips
  exercise={exercise}
  onGripChange={(exerciseId, gripIds) => {
    // Handle grip changes for workout logging
  }}
/>
```

## Data Flow

1. User selects exercise with available grips
2. ExerciseGripEffects component loads default grips for exercise
3. User selects grip(s) from available options
4. EffectiveMuscles component calls get_effective_muscles() RPC
5. Dynamic muscle emphasis is calculated and displayed
6. When logging sets, grip IDs are included in workout_set_grips

## Future Enhancements

1. **Gym-Specific Grip Availability**
   - Integrate gym_machine_grip_options for equipment-based filtering
   - Show only available grips based on user's gym membership

2. **Exercise Grip Effects Data**
   - Admin interface for managing grip effects
   - Bulk import of grip effect data from exercise databases

3. **Advanced Visualizations**
   - Muscle emphasis heat maps
   - Grip effect comparisons
   - Historical grip usage analytics

## Files Modified/Created

### Database
- `supabase/migrations/[timestamp]_grip_effects.sql` - New tables and RPC function

### Components
- `src/components/exercise/ExerciseGripEffects.tsx` - Grip selection UI
- `src/components/exercise/EffectiveMuscles.tsx` - Dynamic muscle display
- `src/components/exercise/ExerciseCardWithGrips.tsx` - Complete exercise card
- `src/components/exercise/GripSelector.tsx` - Basic grip selector
- `src/hooks/useEffectiveMuscles.ts` - Effective muscles hook
- `src/hooks/useWorkoutSetGrips.ts` - Workout set with grips hook

The grip effects system is now fully functional and ready for integration into the workout flow!