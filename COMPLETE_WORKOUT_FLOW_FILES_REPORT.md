# 📁 COMPLETE WORKOUT FLOW FILES REPORT
## Full File Paths & Usage Analysis

**Generated**: 2025-01-17  
**Purpose**: Complete inventory of ALL files used in workout flow with full paths, imports, and functions

---

## 🎯 ENTRY POINTS & ROUTING

### **Route Handlers**
- **`src/app/workouts/workout-detail.tsx`** ✅ **ACTIVE MAIN ROUTE**
  - **Route**: `/app/workouts/:workoutId`
  - **Imports**: `useGetWorkout`, `EnhancedWorkoutSession`
  - **Functions**: `WorkoutPage()`, `DebugTop()`
  - **Status**: Primary entry point with debug v111.4-CORRECT-FILE

- **`src/app/workouts/start-quick/page.tsx`** ✅ ACTIVE
  - **Route**: `/app/workouts/start-quick`
  - **Imports**: `useStartWorkout`, `TrainingLauncher`
  - **Functions**: `StartQuickWorkoutPage()`

- **`src/features/health/fitness/pages/WorkoutSession.page.UNUSED.tsx`** ❌ DISABLED
  - **Status**: Renamed to .UNUSED.tsx, imports commented out
  - **Reason**: Duplicate of active route

### **Layout Wrappers**
- **`src/features/workouts/WorkoutsLayout.tsx`** ✅ ACTIVE
  - **Imports**: React Router (`Outlet`, `useLocation`, `useParams`)
  - **Functions**: `WorkoutsLayout()`
  - **Purpose**: Layout wrapper for workout routes

---

## 🧠 CORE WORKOUT LOGIC (src/features/workouts/)

### **Main Session Components**
- **`src/features/workouts/components/EnhancedWorkoutSession.tsx`** ✅ **CORE LOGIC**
  - **Imports**: 50+ imports including UI components, hooks, utilities
  - **Key Imports**:
    - `useLogSet`, `useUpdateSet` from `../hooks`
    - `ImprovedWorkoutSession` from `@/components/fitness/`
    - `useAdvancedSetLogging`, `useWarmupManager`
    - `recomputeWarmupPlan`, `submitWarmupFeedback`
  - **Functions**: `EnhancedWorkoutSession()`, readiness checks, estimate management
  - **Size**: 1016 lines - **LARGEST COMPONENT**

- **`src/features/workouts/components/WorkoutSession.tsx`** ✅ ACTIVE
  - **Imports**: `MobileWorkoutSession`, `useIsMobile`, `useLogSet`
  - **Functions**: `WorkoutSession()` - mobile/desktop router
  - **Purpose**: Routes to mobile or desktop UI based on screen size

- **`src/features/workouts/components/StartOrContinue.tsx`** ✅ ACTIVE
  - **Imports**: `useStartWorkout`
  - **Functions**: Landing page for workout section

- **`src/features/workouts/components/TrainingLauncher.tsx`** ✅ ACTIVE
  - **Imports**: `useStartWorkout`
  - **Functions**: `TrainingLauncher()` - quick workout starter

### **Component Index Files**
- **`src/features/workouts/components/index.ts`** ✅ ACTIVE
  - **Exports**: `EnhancedWorkoutSession`, `WorkoutSession`, `StartOrContinue`, etc.

- **`src/features/workouts/ui/index.ts`** ✅ ACTIVE
  - **Exports**: `WorkoutSession`, `PreWorkoutFlow`, `PreWorkoutReadiness`

---

## 🌐 API LAYER (src/features/workouts/api/)

### **Primary API File**
- **`src/features/workouts/api/workouts.api.ts`** ✅ **CRITICAL API LAYER**
  - **Size**: 362 lines - **NEEDS REFACTORING**
  - **Imports**: `@tanstack/react-query`, `supabase`, `useAuth`
  - **Functions**:
    - `useActiveWorkout()` - get current active workout
    - `useGetWorkout()` - fetch workout by ID with translations
    - `useStartWorkout()` - unified workout starter
    - `useEndWorkout()` - finish workout
    - `useLogSet()` - log workout sets
    - `useUpdateSet()` - update existing sets
    - `useLastSetForExercise()` - performance view
    - `usePersonalRecord()` - PR tracking

- **`src/features/workouts/api/index.ts`** ✅ ACTIVE
  - **Exports**: `workouts.api`, `warmup`

### **Hooks Layer**
- **`src/features/workouts/hooks/index.ts`** ✅ **HOOK EXPORTS**
  - **Exports**: All API hooks, exercise estimates, smart features
  - **Key Exports**: `useActiveWorkout`, `useGetWorkout`, `useStartWorkout`, `useLogSet`

- **`src/features/workouts/hooks/useExerciseEstimate.ts`** ✅ ACTIVE
- **`src/features/workouts/hooks/useSmartWarmup.ts`** ✅ ACTIVE
- **`src/features/workouts/hooks/useReadinessTargets.ts`** ✅ ACTIVE
- **`src/features/workouts/hooks/useWarmupManager.ts`** ✅ ACTIVE
- **`src/features/workouts/hooks/useAdvancedSetLogging.ts`** ✅ ACTIVE

---

## 📱 MOBILE UI COMPONENTS (src/components/mobile/)

### **Mobile Workout Interface**
- **`src/components/mobile/MobileWorkoutSession.tsx`** ✅ **MOBILE MAIN**
  - **Size**: 371 lines
  - **Imports**:
    - UI components from `@/components/ui/`
    - `SetFeelSelector` from `@/features/health/fitness/`
    - `EnhancedSetEditor` from `@/components/workout/`
    - `PersistentRestTimer` from `./PersistentRestTimer`
  - **Functions**: `MobileWorkoutSession()`, touch-optimized set logging

- **`src/components/mobile/MobileWorkoutFooter.tsx`** ✅ ACTIVE
  - **Functions**: `MobileWorkoutFooter()` - bottom navigation bar

- **`src/components/mobile/PersistentRestTimer.tsx`** ✅ ACTIVE
  - **Functions**: `PersistentRestTimer()` - mobile rest timer

---

## 🖥️ DESKTOP UI COMPONENTS (src/components/fitness/)

### **Desktop Workout Interface**
- **`src/components/fitness/ImprovedWorkoutSession.tsx`** ✅ **DESKTOP MAIN**
  - **Size**: 974 lines - **LARGEST DESKTOP COMPONENT**
  - **Imports**:
    - `getEquipmentRefId`, `getLoadType` from `@/lib/workouts/`
    - `useWarmupFeedback`, `useUpdateWarmupAfterSet` from `@/features/workouts/warmup/`
    - `EnhancedSetEditor` from `@/components/workout/`
    - `WarmupBlock` from `./WarmupBlock`
  - **Functions**: `ImprovedWorkoutSession()`, desktop set forms, advanced controls

### **Supporting Desktop Components**
- **`src/components/fitness/WarmupBlock.tsx`** ✅ ACTIVE
  - **Imports**: `smartWarmupCalculator`, `useWarmupManager`
  - **Functions**: `WarmupBlock()` - warmup plan display

- **`src/components/fitness/RestTimer.tsx`** ✅ ACTIVE
  - **Functions**: `RestTimer()` - desktop rest timer

- **`src/components/fitness/EnhancedRestTimer.tsx`** ✅ ACTIVE
  - **Functions**: `EnhancedRestTimer()` - advanced rest timer

- **`src/components/fitness/MobileRestTimer.tsx`** ✅ ACTIVE
  - **Functions**: `MobileRestTimer()` - mobile-specific timer

- **`src/components/fitness/RestTimerPill.tsx`** ✅ ACTIVE
  - **Functions**: `RestTimerPill()` - compact timer display

---

## 📝 SET FORM COMPONENTS (src/components/workout/)

### **Smart Set Form Router**
- **`src/components/workout/set-forms/SmartSetForm.tsx`** ✅ **SET FORM ROUTER**
  - **Imports**: `BodyweightSetForm`, `WeightRepsSetForm`
  - **Functions**: `SmartSetForm()` - routes to appropriate set form based on exercise type
  - **Logic**: Routes by `effort_mode` (reps/time/distance) and `load_mode` (bodyweight/external)

### **Specific Set Forms**
- **`src/components/workout/set-forms/BodyweightSetForm.tsx`** ✅ ACTIVE
  - **Imports**: `BaseSetForm` types and utilities
  - **Functions**: `BodyweightSetForm()` - bodyweight exercises

- **`src/components/workout/set-forms/WeightRepsSetForm.tsx`** ✅ ACTIVE
  - **Imports**: `BaseSetForm` types and utilities
  - **Functions**: `WeightRepsSetForm()` - weight/reps exercises

- **`src/components/workout/set-forms/CardioSetForm.tsx`** ✅ ACTIVE
  - **Functions**: `CardioSetForm()` - cardio exercises

- **`src/components/workout/set-forms/BaseSetForm.tsx`** ✅ **BASE TYPES**
  - **Exports**: `BaseSetFormProps`, `Exercise` interfaces
  - **Purpose**: Shared types and utilities for all set forms

### **Set Form Wrappers**
- **`src/components/workout/EnhancedSetEditor.tsx`** ✅ ACTIVE
  - **Imports**: `SmartSetForm`, `BaseSetForm` types
  - **Functions**: `EnhancedSetEditor()` - enhanced set editing interface

- **`src/components/workout/AdaptiveSetForm.tsx`** ✅ ACTIVE
  - **Functions**: `AdaptiveSetForm()` - bilateral/unilateral set handling

- **`src/components/workout/EffortModeSetForm.tsx`** ✅ ACTIVE
  - **Imports**: `SmartSetForm`
  - **Functions**: `EffortModeSetForm()` - wrapper around SmartSetForm

### **Input Components**
- **`src/components/workout/TouchOptimizedSetInput.tsx`** ✅ ACTIVE
  - **Functions**: `TouchOptimizedSetInput()` - touch-friendly input

---

## 🧮 BUSINESS LOGIC & UTILITIES

### **Equipment & Context** (src/lib/workouts/)
- **`src/lib/workouts/equipmentContext.ts`** ✅ ACTIVE
  - **Functions**: `getEquipmentRefId()`, `getLoadType()`, `getExerciseId()`

### **Warmup System** (src/features/workouts/warmup/)
- **`src/features/workouts/warmup/useWarmupActions.ts`** ✅ ACTIVE
  - **Functions**: `useWarmupFeedback()`, `useUpdateWarmupAfterSet()`

- **`src/features/workouts/warmup/updateWarmupForWorkout.ts`** ✅ ACTIVE
  - **Functions**: `updateWarmupForWorkout()`

- **`src/features/workouts/warmup/calcWarmup.ts`** ✅ ACTIVE
  - **Functions**: `buildWarmupPlan()`

### **Targeting System** (src/features/workouts/targets/)
- **`src/features/workouts/targets/index.ts`** ✅ ACTIVE
  - **Functions**: `computeTargetUnified()`
  - **Imports**: `computeTargetV3`

- **`src/features/workouts/targets/computeTargetV3.ts`** ✅ ACTIVE
  - **Functions**: Advanced targeting calculations

### **Exercise Utilities**
- **`src/features/workouts/utils/exerciseName.ts`** ✅ ACTIVE
  - **Functions**: `getExerciseDisplayName()`

- **`src/features/workouts/utils/feel.ts`** ✅ ACTIVE
  - **Functions**: `feelEmoji()`, feel-to-RPE conversions

---

## 🏃‍♂️ SUPPORTING HOOKS & STATE

### **Workout Flow Hooks** (src/hooks/)
- **`src/hooks/useWorkoutFlow.ts`** ✅ ACTIVE
  - **Imports**: `useStartWorkout` from `@/features/workouts/hooks`
  - **Functions**: `useWorkoutFlow()` - complete workout flow management

- **`src/hooks/use-mobile.tsx`** ✅ ACTIVE
  - **Functions**: `useIsMobile()` - mobile detection for UI routing

- **`src/hooks/useWorkoutUnit.ts`** ✅ ACTIVE
  - **Functions**: `useWorkoutSessionUnit()`, `useSetWorkoutSessionUnit()`

### **State Management**
- **`src/features/workouts/state/workoutState.ts`** ✅ ACTIVE
- **`src/features/workouts/state/warmupSessionState.ts`** ✅ ACTIVE

---

## 🎨 UI COMPONENTS (src/components/ui/)

### **Shadcn Components Used**
- `@/components/ui/card` - Card, CardContent, CardHeader, CardTitle
- `@/components/ui/button` - Button
- `@/components/ui/badge` - Badge
- `@/components/ui/progress` - Progress
- `@/components/ui/dialog` - Dialog, DialogContent, DialogHeader, DialogTitle
- `@/components/ui/collapsible` - Collapsible, CollapsibleContent, CollapsibleTrigger
- `@/components/ui/popover` - Popover, PopoverContent, PopoverTrigger
- `@/components/ui/input` - Input
- `@/components/ui/alert-dialog` - AlertDialog components

---

## 🔗 SUPPORTING COMPONENTS (src/features/health/fitness/)

### **Fitness Feature Components**
- **`src/features/health/fitness/components/SetFeelSelector.tsx`** ✅ ACTIVE
- **`src/features/health/fitness/components/WarmupEditor.tsx`** ✅ ACTIVE
- **`src/features/health/fitness/components/WorkoutRecalibration.tsx`** ✅ ACTIVE
- **`src/features/health/fitness/components/GymConstraintsFilter.tsx`** ✅ ACTIVE
- **`src/features/health/fitness/components/SetPrevTargetDisplay.tsx`** ✅ ACTIVE
- **`src/features/health/fitness/components/WeightEntry.tsx`** ✅ ACTIVE

### **Fitness Hooks**
- **`src/features/health/fitness/hooks/useLastSet.ts`** ✅ ACTIVE
- **`src/features/health/fitness/hooks/useMyGym.hook.ts`** ✅ ACTIVE
- **`src/features/health/fitness/hooks/useTargetCalculation.ts`** ✅ ACTIVE

---

## 📊 TYPES & INTERFACES

### **Workout Types** (src/features/workouts/types/)
- **`src/features/workouts/types/index.ts`** ✅ ACTIVE
  - **Exports**: Main workout types, warmup types

- **`src/features/workouts/types/warmup-unified.ts`** ✅ ACTIVE
  - **Types**: `WarmupStep`, `WarmupPlan`, `WarmupFeedback`, `UnilateralSetData`

- **`src/features/workouts/warmup/types.ts`** ✅ ACTIVE
  - **Types**: Unified warmup types

### **Core API Types**
- **`src/core/api/types.ts`** ✅ ACTIVE
  - **Types**: Re-exports from shared schemas, API interfaces

- **`src/core/api/index.ts`** ✅ ACTIVE
  - **Exports**: `fitness-client`, `types`

---

## 🗂️ FEATURE EXPORTS

### **Main Feature Exports**
- **`src/features/workouts/index.ts`** ✅ **MAIN EXPORT**
  - **Exports**: `ui`, `api`, `hooks`, `types`, `logic/targets`, `logic/readiness`, `state/workoutState`

- **`src/features/index.ts`** ✅ ACTIVE
  - **Exports**: `workouts` namespace

---

## ❌ UNUSED/DISABLED FILES

### **Legacy Files (Properly Disabled)**
- **`src/features/health/fitness/pages/WorkoutSession.page.UNUSED.tsx`** ❌ DISABLED
  - **Status**: Renamed to .UNUSED.tsx, imports commented out
  - **Size**: Was 763 lines before disabling

- **`src/features/health/fitness/routes.tsx`** ❌ PARTIALLY DISABLED
  - **Status**: Workout session route commented out
  - **Line 22**: `{/* <Route path="session/:id" element={<WorkoutSessionPage />} /> */}`

- **`src/features/health/fitness/index.ts`** ❌ PARTIALLY DISABLED
  - **Line 6**: `// export { default as WorkoutSessionPage } from './pages/WorkoutSession.page';`

- **`src/features/health/fitness/pages/index.ts`** ❌ PARTIALLY DISABLED
  - **Line 4**: `// export { default as WorkoutSessionPage } from './WorkoutSession.page';`

---

## 📈 FILE SIZE ANALYSIS

### **Largest Files (Potential Refactoring Candidates)**
1. **`src/features/workouts/components/EnhancedWorkoutSession.tsx`** - 1016 lines
2. **`src/components/fitness/ImprovedWorkoutSession.tsx`** - 974 lines
3. **`src/features/workouts/api/workouts.api.ts`** - 362 lines ⚠️ **NEEDS REFACTORING**
4. **`src/components/mobile/MobileWorkoutSession.tsx`** - 371 lines

---

## 🎯 SUMMARY BY LOCATION

### **Files in src/components/**
- **Mobile UI**: `src/components/mobile/` - 4 files
- **Fitness UI**: `src/components/fitness/` - 8 files  
- **Workout Forms**: `src/components/workout/` - 12 files
- **UI Components**: `src/components/ui/` - Multiple shadcn components

### **Files in src/features/**
- **Workouts Feature**: `src/features/workouts/` - 25+ files (hooks, components, API, types)
- **Health/Fitness Feature**: `src/features/health/fitness/` - 15+ files (mostly supporting)

### **Files in src/app/**
- **Route Handlers**: `src/app/workouts/` - 2 files (main route + quick start)

### **Files in src/hooks/**
- **Shared Hooks**: 3 workout-related hooks

### **Files in src/lib/**
- **Utilities**: `src/lib/workouts/` - Equipment and context utilities

---

## 🚦 STATUS SUMMARY

- **✅ Active Files**: 50+ files across multiple directories
- **❌ Disabled Files**: 4 files (properly renamed/commented)
- **🎯 Main Flow**: `src/app/workouts/workout-detail.tsx` → `EnhancedWorkoutSession` → Mobile/Desktop UI
- **📱 Mobile Route**: Auto-detected via `useIsMobile()` → `MobileWorkoutSession`
- **🖥️ Desktop Route**: Fallback → `ImprovedWorkoutSession`

---

**Report Complete** | *All workout flow files catalogued with full paths*