# Detailed Issue Analysis Report

## ISSUE 1: DIPS FORM ROUTING FAILURE

### Current State
- **Exercise Name**: Dips
- **Exercise ID**: `6da86374-b133-4bf1-a159-fd9bbb715316`
- **Equipment ID**: `fb81ae58-bf4e-44e8-b45a-6026147bca8e`
- **Current Form**: WeightRepsSetForm (shows "Weight (kg)")
- **Expected Form**: BodyweightSetForm (should show "Added / Assist (kg)")

### Database Fields Present
```json
{
  "id": "6da86374-b133-4bf1-a159-fd9bbb715316",
  "load_type": "single_load",
  "body_part_id": "0a62bb38-28fa-4f0e-b34f-d3f6abeb62c5",
  "equipment_id": "fb81ae58-bf4e-44e8-b45a-6026147bca8e"
}
```

### Database Fields Missing
- `effort_mode` (expected: "reps")
- `load_mode` (expected: "bodyweight_plus_optional")

### Code Files Involved

#### Form Router Files
1. **src/components/workout/set-forms/SmartSetForm.tsx**
   - Function: `getFormType()` - main routing logic
   - Expects: `exercise.load_mode` and `exercise.effort_mode`
   - Problem: Checks for undefined fields

2. **src/components/workout/EffortModeSetForm.tsx**
   - Function: Direct passthrough to SmartSetForm
   - No additional logic

3. **src/components/workout/EnhancedSetEditor.tsx**
   - Function: `detectLoadMode()` - equipment-based fallback
   - Should detect dips but currently failing

#### Target Form Files
1. **src/components/workout/set-forms/BodyweightSetForm.tsx**
   - Target form for dips
   - Shows "Added / Assist (kg)" label
   - Handles bodyweight + additional weight logic

2. **src/components/workout/set-forms/WeightRepsSetForm.tsx**
   - Currently being used (incorrect)
   - Shows "Weight (kg)" label

#### Hook Files
1. **src/hooks/useUnifiedSetLogging.ts**
   - Function: `logSet()` - logs workout sets
   - Needs bodyweight for `load_meta.logged_bodyweight_kg`

### Root Cause Analysis
1. **Database Schema Issue**: Exercise table has `load_type` but components expect `load_mode`
2. **Missing Fields**: No `effort_mode` and `load_mode` in exercises table
3. **Fallback Logic**: Equipment-based detection not triggering for dips equipment_id

---

## ISSUE 2: FITNESS PROFILE WEIGHT/HEIGHT MISSING

### Current State
- **Component**: FitnessProfile
- **Expected**: Editable weight and height input fields
- **Actual**: Message "Body Metrics Tracking has been moved..."
- **Required**: Fields sourced from `user_body_metrics` table ONLY

### Database Tables Involved

#### user_body_metrics (Source of Truth)
- `weight_kg` - current weight
- `height_cm` - current height
- `recorded_at` - timestamp
- `source` - 'manual', 'profile', etc.

#### user_fitness_profile (Should NOT store weight/height)
- Should only store: sex, training_age, goal, injuries, preferences
- Should NOT store: bodyweight, height_cm

### Code Files Involved

#### Main Component
1. **src/features/health/fitness/components/FitnessProfile.tsx**
   - Query: `user_body_metrics` for latest weight/height
   - Query: `user_fitness_profile` for other profile data
   - Mutation: `upsertProfile` - saves to both tables
   - Problem: May be showing info card instead of input fields

#### Alternative Component
1. **src/components/health/BodyMetricsForm.tsx**
   - Dedicated body metrics component
   - Separate from fitness profile
   - May cause user confusion

### Root Cause Analysis
1. **UI Logic**: Component may be showing info card instead of input fields
2. **Data Source**: Confusion between which table stores what
3. **Mutation Logic**: Profile mutation may not be updating body metrics correctly

---

## DUPLICATE/STRAY CODE IDENTIFICATION

### Multiple Form Entry Points
1. **EffortModeSetForm.tsx** → SmartSetForm
2. **EnhancedSetEditor.tsx** → SmartSetForm (with detection)
3. Direct form usage in other components

### Multiple Set Logging Hooks
1. **useUnifiedSetLogging.ts** - primary hook
2. **useAdvancedSetLogging.ts** - alternative/legacy hook
3. **features/workouts/hooks/useAdvancedSetLogging.ts** - duplicate?

### Multiple Body Metrics Components
1. **FitnessProfile.tsx** - should include weight/height
2. **BodyMetricsForm.tsx** - dedicated component

### Database Function Overlap
- Multiple set logging functions in database
- Multiple personal record update functions

---

## RECOMMENDED FIXES

### Issue 1: Dips Form
1. **Option A**: Update exercises table to include `load_mode` and `effort_mode`
2. **Option B**: Enhance equipment-based detection with specific equipment_id
3. **Option C**: Add mapping table for equipment_id → load_mode

### Issue 2: Fitness Profile
1. **Ensure Input Fields**: Add weight/height inputs to FitnessProfile component
2. **Single Source**: Use only `user_body_metrics` for weight/height
3. **Remove Duplication**: Consolidate or remove BodyMetricsForm

### Code Cleanup
1. **Consolidate Form Routing**: Use single entry point
2. **Remove Duplicate Hooks**: Standardize on one set logging hook
3. **Clear Data Flow**: Document which component handles what data