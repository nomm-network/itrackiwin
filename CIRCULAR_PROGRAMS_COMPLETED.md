# Circular Training Programs Implementation

## Overview
Implemented circular/cyclic training program system where users can link multiple workout templates that rotate automatically. "Start Quick Workout" now knows what comes next in their program cycle.

## Database Changes

### New Tables

1. **training_programs**
   - Contains user's training programs with name, goal, and active status
   - Each user can have multiple programs but only one active at a time

2. **training_program_blocks**
   - Links workout templates to programs in a specific order
   - Includes focus tags (push, pull, legs, etc.) for exercise alternatives
   - Order index determines sequence in the cycle

3. **user_program_state**
   - Tracks user's current position in their active program
   - Records last completed workout index and total cycles completed
   - Auto-wraps to beginning when reaching the end

### New RPC Functions

1. **get_next_program_block(_user_id)**
   - Returns the next workout template in the user's program cycle
   - Handles cycling back to workout 1 after completing the last workout
   - Includes program progress and cycle information

2. **advance_program_state(_user_id, _completed_block_id)**
   - Updates user's position after completing a workout
   - Increments cycle count when completing the last workout in sequence
   - Called after successful workout completion

## Frontend Components

### 1. TrainingProgramManager (`src/components/fitness/TrainingProgramManager.tsx`)
- Full program management interface
- Create new programs with goals
- Set active program for cycling
- Shows next workout card with program context

### 2. QuickStartWidget (`src/components/fitness/QuickStartWidget.tsx`)
- Compact widget showing next scheduled workout
- Displays program progress and cycle information
- Direct link to start the suggested workout

### 3. TrainingProgramsPage (`src/pages/TrainingPrograms.tsx`)
- Dedicated page for program management
- Integrated into fitness routing

## Integration Points

### Quick Start Flow
```tsx
// The QuickStartWidget automatically shows the next workout
<QuickStartWidget />

// Links to workout session with program context
/fitness/session/start?template={templateId}&block={blockId}
```

### Workout Completion
After a workout is completed, call the advance function:
```typescript
const advanceProgram = useAdvanceProgramState();

// After workout completion
await advanceProgram.mutateAsync(completedBlockId);
```

### Hooks Available
- `useTrainingPrograms()` - Get user's programs
- `useNextProgramBlock()` - Get next workout in cycle
- `useAdvanceProgramState()` - Advance after completion
- `useSetActiveProgram()` - Change active program

## Program Flow

1. **Setup**: User creates program and adds workout templates in order
2. **Activation**: User sets program as active
3. **Quick Start**: System suggests next workout based on last completed
4. **Cycling**: After completing workout N, suggests workout N+1
5. **Rotation**: After completing last workout, cycles back to workout 1
6. **Tracking**: Maintains cycle count and progress statistics

## Example Programs

### Push/Pull/Legs (3-day cycle)
1. Push Day (Chest, Shoulders, Triceps)
2. Pull Day (Back, Biceps)  
3. Leg Day (Quads, Hamstrings, Glutes)

### Upper/Lower (2-day cycle)
1. Upper Body
2. Lower Body

## Future Enhancements

1. **Rest Day Integration**: Skip to next workout after configured rest days
2. **Program Templates**: Pre-built popular program structures
3. **Progress Tracking**: Performance metrics across program cycles
4. **Smart Scheduling**: Calendar integration for program planning

## Files Created/Modified

### Database
- `supabase/migrations/[timestamp]_training_programs.sql` - Program tables and RLS
- `supabase/migrations/[timestamp]_program_functions.sql` - RPC functions

### Components  
- `src/hooks/useTrainingPrograms.ts` - React Query hooks
- `src/components/fitness/TrainingProgramManager.tsx` - Full management UI
- `src/components/fitness/QuickStartWidget.tsx` - Quick start widget
- `src/pages/TrainingPrograms.tsx` - Programs page
- `src/features/health/fitness/routes.tsx` - Added programs route

The circular training program system is now ready for users to create structured, rotating workout schedules!