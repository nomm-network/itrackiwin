# Exercise Replacement/Alternates System - Complete Implementation

## Overview
Implemented a comprehensive exercise replacement system with curated similarities and intelligent matching based on body parts, equipment availability, grips, and user priorities.

## Database Schema

### New Table: exercise_similars
```sql
CREATE TABLE public.exercise_similars (
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  similar_exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  reason text NULL,
  similarity_score numeric DEFAULT 0.8,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (exercise_id, similar_exercise_id)
);
```

**Purpose**: Stores curated exercise similarities for high-quality, admin-approved alternatives.

## Enhanced Matching Algorithm

### 1. Curated Similarities (Priority 1)
- Fetches admin-curated exercise pairs from `exercise_similars` table
- High confidence matches with specific reasons
- Similarity scores between 0.0-1.0

### 2. Computed Alternatives (Priority 2)
- Intelligent matching based on multiple factors:
  - **Primary muscle match** (40% weight)
  - **Secondary muscle overlap** (20% weight)
  - **Movement pattern similarity** (25% weight)
  - **Equipment compatibility** (15% weight)

### 3. Enhanced Scoring Factors
- **Equipment availability**: Considers user's gym equipment capabilities
- **Grip compatibility**: Matches available grip options
- **User priorities**: Bonus for targeting priority muscle groups
- **Complexity similarity**: Prefers similar difficulty levels

## Key Features

### Equipment-Aware Matching
- Checks user's equipment capabilities (bars, dumbbells, cables, machines)
- Only suggests alternatives available in user's gym
- Equipment compatibility matrix for similar equipment types

### Movement Pattern Recognition
- Categorizes exercises by movement patterns:
  - Push (bench press, overhead press)
  - Pull (rows, pulldowns)
  - Squat (squats, leg press)
  - Hinge (deadlifts, hip thrusts)
  - Lunge (lunges, step-ups)

### User Priority Integration
- Considers muscle group priorities when scoring alternatives
- Bonus points for exercises targeting high-priority muscles
- Respects user's training focus and goals

## Components

### ExerciseSwapDialog
- **Location**: `src/features/health/fitness/components/ExerciseSwapDialog.tsx`
- **Features**:
  - Search and filter alternatives
  - Real-time compatibility scoring
  - Visual match reasons and equipment requirements
  - One-click exercise swapping with preference saving

### Enhanced Service
- **Location**: `src/features/health/fitness/services/exerciseSubstitution.service.ts`
- **Key Functions**:
  - `findAlternatives()`: Main function for finding exercise alternatives
  - `calculateEnhancedMatchScore()`: Advanced scoring with user context
  - `generateMatchReasons()`: Human-readable explanations for matches

## Integration Points

### Equipment Capabilities
- Uses `useEquipmentCapabilities` hook to check available equipment
- Filters alternatives based on actual gym equipment

### User Preferences
- Saves exercise preferences to template_exercises table
- Tracks user's preferred alternatives for future recommendations

### Workout Templates
- Seamlessly integrates with workout template system
- Maintains exercise substitutions across workout sessions

## Admin Features

### Curated Similarities Management
- Admins can add/manage curated exercise similarities
- Custom reasons and similarity scores
- Override automatic matching for specific exercise pairs

### Data Quality
- Both curated and computed alternatives ensure high-quality recommendations
- Minimum match thresholds prevent poor suggestions
- Equipment availability filtering prevents impossible recommendations

## Usage Examples

### Finding Alternatives
```typescript
const alternatives = await findAlternatives(
  exerciseId,
  equipmentCapabilities,
  targetMuscles,
  {
    maxDifficulty: 'intermediate',
    avoidInjuries: ['lower-back'],
    preferredEquipment: ['dumbbell', 'cable']
  }
);
```

### Saving Preferences
```typescript
await saveExercisePreference(
  userId,
  templateId,
  originalExerciseId,
  preferredExerciseId
);
```

## Benefits

1. **Intelligent Matching**: Multi-factor scoring ensures relevant alternatives
2. **Equipment Aware**: Only suggests available equipment
3. **User-Centric**: Considers individual priorities and constraints
4. **Admin Curated**: High-quality alternatives for popular exercises
5. **Seamless Integration**: Works with existing workout and template systems

## Future Enhancements

- Machine learning to improve automatic scoring
- User feedback integration for preference learning
- Exercise video/instruction integration for alternatives
- Progressive overload matching for similar loading patterns
- Community-driven similarity suggestions

This system provides the "Bro" AI coach with intelligent exercise substitution capabilities that respect user equipment, priorities, and training goals.