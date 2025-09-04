# WORKOUT CREATION FLOW - ISSUE ANALYSIS

## Problem Statement
When user clicks "Start" button to begin a workout, the system fails and the readiness form does not open. The error occurs immediately upon workout creation attempt.

## Current Workflow Analysis

### 1. Entry Points to Workout Creation

#### File: `src/features/health/fitness/workouts/ui/TrainingLauncher.tsx`
**Purpose**: Main component for starting workouts with readiness check
**Flow**:
1. Component mounts and immediately calls `startWorkout()` in `useEffect`
2. Calls `useStartWorkout` hook with optional `templateId`
3. Creates workout via `start_workout` RPC
4. Shows readiness form if workout creation succeeds
5. Navigates to workout session after readiness submission

**Key Issues Identified**:
- Automatic workout creation on mount (line 25-46)
- No validation of prerequisites before creation
- Error handling redirects to dashboard but may not clean up properly

#### File: `src/features/health/fitness/workouts/api/workouts.api.ts`
**Purpose**: Contains `useStartWorkout` hook
**Flow**:
1. Calls `start_workout` RPC with `p_template_id` parameter
2. Expects direct UUID return (not object with workout_id property)
3. Returns `{ workoutId }` object

**Recent Changes**:
- Line 149-157: Modified to handle direct UUID return from RPC
- Previous versions expected `data[0].workout_id` format

### 2. Database RPC Function

#### Function: `start_workout(p_template_id)`
**Purpose**: Creates new workout record, optionally from template
**Expected Behavior**:
- Creates workout in `workouts` table
- If template provided, copies exercises from template
- Returns workout UUID directly
- Should handle null template_id gracefully

**Critical Dependencies**:
- User authentication via `auth.uid()`
- Template existence if template_id provided
- Proper RLS policies on workouts table

### 3. Readiness System Integration

#### File: `src/features/health/fitness/readiness/hooks/useReadinessCheckin.ts`
**Purpose**: Saves readiness data to `pre_workout_checkins`
**Flow**:
1. Receives readiness input and workout_id
2. Saves to `pre_workout_checkins.answers` as JSONB
3. Links to workout via `workout_id` foreign key

#### Database Table: `pre_workout_checkins`
**Structure**:
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users)
- `workout_id` (uuid, references workouts.id)
- `answers` (jsonb, stores readiness data)
- `created_at` (timestamp)

**Critical Issue**: Recent migration modified `v_latest_readiness` view to extract from JSONB `answers` column, which may have introduced incompatibilities.

### 4. Views and Functions Affected

#### View: `v_latest_readiness`
**Purpose**: Extracts latest readiness data for users
**Recent Changes**: Updated to handle JSONB structure in `answers` column
**Potential Issues**: May not properly extract readiness values, causing downstream failures

#### Function: `compute_readiness_for_user`
**Purpose**: Calculates readiness score and recommendations
**Dependencies**: Relies on `v_latest_readiness` view
**Potential Issues**: May fail if view returns null/invalid data

## Debugging Checkpoints

### 1. Authentication Verification
- Verify `auth.uid()` returns valid user ID
- Check user exists in `auth.users` table
- Confirm user has proper profile in `profiles` table

### 2. RPC Function Execution
- Test `start_workout` RPC directly in SQL editor
- Verify it returns UUID string (not null/error)
- Check RLS policies on `workouts` table allow insertion

### 3. Template Validation (if used)
- Verify template exists if `templateId` provided
- Check template belongs to user or is public
- Ensure template has valid exercises

### 4. Readiness System
- Verify `pre_workout_checkins` table structure
- Test `v_latest_readiness` view returns expected data
- Check `compute_readiness_for_user` function works

### 5. Frontend Error Handling
- Check browser console for JavaScript errors
- Verify network requests complete successfully
- Check for authentication token issues

## Recent Changes That May Have Caused Issues

### Database Migration: `20250904090213`
**Changes Made**:
1. Dropped and recreated `v_latest_readiness` view
2. Modified to extract from JSONB `answers` column
3. Updated `compute_readiness_for_user` function error handling

**Potential Issues**:
- View may not extract JSONB data correctly
- Function may not handle null values properly
- RPC dependencies may be broken

### API Changes in `workouts.api.ts`
**Changes Made**:
1. Modified return value handling from RPC
2. Changed from `data[0].workout_id` to direct `data` access
3. Updated error handling

**Potential Issues**:
- RPC may actually return different format than expected
- Error handling may not catch all failure cases

## Recommended Investigation Steps

1. **Test RPC directly**: Execute `start_workout` in Supabase SQL editor
2. **Check view functionality**: Query `v_latest_readiness` for test user
3. **Verify JSONB structure**: Examine `pre_workout_checkins.answers` format
4. **Test authentication**: Confirm `auth.uid()` works in RPC context
5. **Review RLS policies**: Ensure workout creation is permitted
6. **Check frontend logs**: Enable detailed console logging
7. **Test minimal case**: Try workout creation without template

## Files Requiring Audit

### Critical Path Files:
1. `src/features/health/fitness/workouts/ui/TrainingLauncher.tsx` - Entry point
2. `src/features/health/fitness/workouts/api/workouts.api.ts` - API interface  
3. Database RPC: `start_workout` function
4. Database view: `v_latest_readiness`
5. Database function: `compute_readiness_for_user`
6. `src/features/health/fitness/readiness/hooks/useReadinessCheckin.ts` - Readiness saving

### Supporting Files:
7. All recent database migrations
8. RLS policies on `workouts` and `pre_workout_checkins` tables
9. `src/features/health/fitness/workouts/hooks/index.ts` - Hook exports
10. Authentication system components

## Expected vs Actual Behavior

**Expected**: Click Start → Workout created → Readiness form opens → Submit → Navigate to workout
**Actual**: Click Start → Error occurs → Readiness form never opens → User stuck

The failure point appears to be either:
1. Workout creation in `start_workout` RPC
2. View/function dependencies causing cascading failures
3. Authentication/authorization issues
4. Frontend error handling masking the real problem