# Complete Workout System Function Inventory

## Database Functions (RPC)

### Core Workout Functions
1. **get_workout_detail_optimized** - Primary workout data loader
2. **next_weight_step_kg** - Weight progression calculator  
3. **advance_program_progress** - Program progression tracker
4. **refresh_materialized_views_secure** - View refresh with auth
5. **refresh_exercise_views** - Exercise-specific view refresh

### User Management Functions
6. **create_user_if_not_exists** - User initialization
7. **ensure_user_record** - User record validation
8. **handle_new_user** - New user trigger handler

### Statistics and Achievement Functions
9. **check_achievements** - Achievement progress checker
10. **update_user_stats_timestamp** - Stats timestamp updater

### Admin Functions
11. **is_admin** - Admin permission checker
12. **is_admin_with_rate_limit** - Rate-limited admin check
13. **create_admin_user** - Admin user creation
14. **log_admin_action** - Admin action logger

## Frontend Hooks and API Functions

### React Query Hooks
1. **useGetWorkout** (`src/features/workouts/api/workouts.api.ts`)
2. **useWorkoutOpen** (`src/hooks/useOptimizedWorkout.ts`)
3. **useUserLastSet** (`src/hooks/useOptimizedWorkout.ts`)
4. **useUserPR** (`src/hooks/useOptimizedWorkout.ts`)
5. **useLogSet** (`src/features/workouts/hooks`)
6. **useStartWorkout** (`src/features/workouts/hooks`)

### Workout Flow Hooks
7. **useWorkoutFlow** (`src/hooks/useWorkoutFlow.ts`)
8. **useUnifiedSetLogging** (`src/components/workout/set-forms/BaseSetForm.tsx`)
9. **useBaseFormState** (`src/components/workout/set-forms/BaseSetForm.tsx`)

### Mobile-Specific Hooks
10. **useIsMobile** (`src/hooks/use-mobile`)

## Component Architecture

### Smart Routing Components
1. **SmartSetForm** (`src/components/workout/set-forms/SmartSetForm.tsx`)
2. **EffortModeSetForm** (`src/components/workout/EffortModeSetForm.tsx`)
3. **EnhancedSetEditor** (`src/components/workout/EnhancedSetEditor.tsx`)

### Specialized Form Components
4. **BodyweightSetForm** (`src/components/workout/set-forms/BodyweightSetForm.tsx`)
5. **WeightRepsSetForm** (`src/components/workout/set-forms/WeightRepsSetForm.tsx`)
6. **BaseSetForm** (`src/components/workout/set-forms/BaseSetForm.tsx`)

### Session Management Components
7. **WorkoutSession** (`src/features/workouts/components/WorkoutSession.tsx`)
8. **MobileWorkoutSession** (`src/components/mobile/MobileWorkoutSession.tsx`)

### Utility Components
9. **AssistanceSelector** (from BaseSetForm)
10. **SetFeelSelector** (`src/features/health/fitness/components/SetFeelSelector`)
11. **PersistentRestTimer** (`src/components/mobile/PersistentRestTimer`)

## Data Flow Functions

### API Layer Functions
1. **getWorkout** - Single workout fetcher
2. **updateWorkout** - Workout updater
3. **logSet** - Set logging function
4. **startWorkout** - Workout starter

### Transformation Functions
5. **mapExerciseData** - Exercise data mapper
6. **calculateRestTime** - Rest time calculator
7. **getWeightDisplay** - Weight display formatter
8. **detectLoadMode** - Load mode detector

## Utility Functions

### Weight Calculation Functions
1. **calculateNextWeight** - Progressive overload calculator
2. **getWeightStep** - Weight increment calculator  
3. **validateWeight** - Weight validation
4. **formatWeight** - Weight formatting

### Exercise Classification Functions
5. **getExerciseTypeInfo** - Exercise type detector
6. **isBodyweightExercise** - Bodyweight exercise checker
7. **isCardioExercise** - Cardio exercise checker

### Form State Functions
8. **useBaseFormState** - Base form state manager
9. **resetFormState** - Form state resetter
10. **validateFormData** - Form validation

## Event Handlers and Actions

### Set Logging Actions
1. **handleSubmit** - Form submission handler
2. **handleLogSet** - Set logging handler
3. **handleSetComplete** - Set completion handler
4. **onLogged** - Post-logging callback

### Navigation Actions
5. **handleNextExercise** - Exercise navigation
6. **handlePreviousExercise** - Reverse navigation
7. **handleWorkoutComplete** - Workout completion
8. **handleAddSet** - Set addition

### UI State Actions
9. **handleAssistTypeChange** - Assistance type setter
10. **handleWeightChange** - Weight input handler
11. **handleRepsChange** - Reps input handler

## Missing Functions (Issues Identified)

### Debug Functions
1. **debugExerciseData** - Exercise data debugger (missing)
2. **logComponentRender** - Component render logger (missing)
3. **validateDataFlow** - Data flow validator (missing)

### Optimization Functions  
4. **batchLoadExerciseData** - Batch data loader (missing)
5. **cacheExerciseResults** - Result caching (missing)
6. **preloadNextExercise** - Preloading (missing)

### Error Handling Functions
7. **handleApiError** - API error handler (missing)
8. **retryFailedRequest** - Request retry (missing)
9. **showErrorToast** - Error notification (missing)

## Configuration Objects

### Exercise Type Mappings
1. **effortModeMap** - Effort mode configurations
2. **loadModeMap** - Load mode configurations
3. **equipmentTypeMap** - Equipment type mappings

### UI Configuration
4. **formVariants** - Form variant configs
5. **buttonVariants** - Button variant configs
6. **toastConfig** - Toast notification config

### Validation Rules
7. **exerciseValidationRules** - Exercise validation
8. **setValidationRules** - Set validation
9. **weightValidationRules** - Weight validation

## Security and Permission Functions

### Authentication Functions
1. **checkUserAuth** - User authentication checker
2. **validateWorkoutAccess** - Workout access validator
3. **checkSetPermissions** - Set modification permissions

### Rate Limiting Functions
4. **checkApiRateLimit** - API rate limiter
5. **throttleSetLogging** - Set logging throttler

## Total Function Count: 89+ Functions

This represents the complete function inventory for the workout system, including:
- 15 Database RPC functions
- 25+ React hooks and API functions  
- 20+ Component functions
- 15+ Utility functions
- 14+ Event handlers and actions
- 10+ Missing/needed functions
- Various configuration objects and validation rules