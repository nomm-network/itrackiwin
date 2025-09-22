# Readiness Score Calculation Analysis

## Issue Summary
The readiness score is consistently showing 0/100 instead of the expected calculated value.

## Root Cause Analysis

### 1. Database Function Issues
The database has multiple readiness calculation functions:
- `compute_readiness_for_user(uuid)` - Main entry point
- `fn_compute_readiness_score_v1(uuid, boolean)` - Core calculation logic
- `save_readiness_checkin()` - Data persistence

**Problem**: The `compute_readiness_for_user` function tries to call `fn_compute_readiness_score_v1` but there may be a mismatch between the expected table schema and actual data structure.

### 2. Data Flow Issues
1. **Frontend**: `EnhancedReadinessCheckIn.tsx` collects user input
2. **Store**: `readinessStore.ts` manages state
3. **Database**: `readiness_checkins` table stores the data
4. **Calculation**: Functions should compute and return score

**Problem**: The chain breaks somewhere between data persistence and score calculation.

### 3. Schema Mismatch
The calculation function expects specific column mappings:
- `soreness` mapped from `muscle_soreness` (but table has `soreness`)
- `illness` mapped from `feeling_sick` (but table has `illness`)
- `alcohol` mapped from `had_alcohol_24h` (but table has `alcohol`)

### 4. Missing Table Records
Query shows empty `readiness_checkins` table, indicating:
- Data is not being saved to database
- Wrong table being used
- RLS policies blocking access

## Technical Investigation

### Current Database Schema
```sql
readiness_checkins:
- id (uuid)
- user_id (uuid)
- workout_id (uuid)
- checkin_at (timestamp)
- sleep_hours (numeric)
- sleep_quality (smallint)
- energy (smallint)
- soreness (smallint)
- stress (smallint)
- alcohol (boolean)
- illness (boolean)
- supplements (jsonb)
- mood (smallint)
- energizers (boolean)
- score (numeric)
- computed_at (timestamp)
```

### Function Logic
The `fn_compute_readiness_score_v1` function:
1. Retrieves checkin data
2. Normalizes values to 0-1 scale
3. Applies weighted calculation
4. Handles penalties for illness/alcohol
5. Returns score 0-10

## Immediate Fixes Needed

### 1. Data Persistence Issue
- Check if `saveTodayReadiness()` function actually saves to database
- Verify RLS policies allow user data insertion
- Ensure proper error handling in save operations

### 2. Score Calculation
- Fix any schema mismatches in calculation function
- Ensure score is properly converted to 0-100 scale (currently returns 0-10)
- Add proper error handling and logging

### 3. State Management
- Verify `useReadinessData` hook properly loads calculated scores
- Ensure store is updated with both input data AND calculated score
- Fix any race conditions between save and load operations

### 4. UI Integration
- `ReadinessBadge` should show calculated score, not input data
- Proper error states when calculation fails
- Debugging logs to trace data flow

## Recommended Solution Strategy

1. **First**: Fix data persistence - ensure readiness checkins are actually being saved
2. **Second**: Fix score calculation function to return 0-100 scale
3. **Third**: Update frontend to properly display calculated scores
4. **Fourth**: Add comprehensive error handling and logging throughout the flow

The core issue appears to be that readiness data is not being properly saved to the database, which means the calculation functions never have data to work with, resulting in the default 0/100 score.