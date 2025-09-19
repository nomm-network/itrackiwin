# Database Data Dump - iTrack.iWin

## Complete Table Structure

### Core Tables Overview
The database contains approximately 120+ tables covering:
- User management and authentication
- Exercise library and equipment
- Workout tracking and progression
- Social features and achievements
- Gym management and coaching
- Body metrics and health tracking

## Key Exercise Data

### Dips Exercise Configuration
```sql
-- Dips exercise (the problematic one)
Exercise ID: 6da86374-b133-4bf1-a159-fd9bbb715316
Slug: "dips"
Display Name: "Dips"
Load Mode: "bodyweight_plus_optional"
Effort Mode: "reps"
Equipment ID: fb81ae58-bf4e-44e8-b45a-6026147bca8e
Bodyweight Involvement: 100%
```

### Equipment Configuration
```sql
-- Dip bars equipment
Equipment ID: fb81ae58-bf4e-44e8-b45a-6026147bca8e
Slug: "dip-bars"
Equipment Type: "bodyweight"
Load Type: "none"
Load Medium: "bodyweight"
Configured: false
```

### Machine Dips Alternative
```sql
-- Assisted dip machine
Exercise ID: 98a03c0f-1918-43cc-9993-0614e085f7e1
Slug: "dips-machine-stack"
Load Mode: "bodyweight_plus_optional"
Equipment Type: "machine"
```

## User Data Status

### User Fitness Profiles
```
Table: user_fitness_profile
Status: EMPTY (0 records)
Expected fields: user_id, sex, training_age_months, goal, injuries, prefer_short_rests
```

### User Body Metrics
```
Table: user_body_metrics  
Status: EMPTY (0 records)
Expected fields: user_id, weight_kg, height_cm, source, recorded_at
```

## Critical Configuration Issues

### 1. Exercise Form Detection Chain
```
Dips Exercise Detection Flow:
1. Exercise.load_mode = "bodyweight_plus_optional" ✓
2. Exercise.effort_mode = "reps" ✓  
3. Equipment.slug = "dip-bars" ✓
4. Equipment.equipment_type = "bodyweight" ✓
5. Equipment.load_type = "none" ✓

Expected Result: BodyweightSetForm
Actual Result: WeightRepsSetForm (BROKEN)
```

### 2. Weight/Height Form Issue
```
Expected Behavior:
- Weight input field in fitness profile
- Height input field in fitness profile
- Data saves to user_body_metrics table

Current Behavior:
- "Body Metrics Tracking moved to dedicated section" message
- No input fields visible
- User cannot enter weight/height
```

## Database Views Analysis

### v_last_working_set
- Purpose: Track user's last performance per exercise
- Status: Functional but no data due to empty workout tables

### v_exercises_with_translations  
- Purpose: Exercise names with localization
- Status: Functional, contains exercise data

### v_user_default_gym
- Purpose: User's primary gym configuration
- Status: No user gym data present

## Edge Functions Summary

The project has multiple Supabase Edge Functions for:
- Fitness profile management
- Workout operations
- User authentication flows
- Data processing and analytics

## Root Cause Analysis

### Issue 1: Dips Form Selection
**Problem**: SmartSetForm.tsx logic fails to detect bodyweight exercises
**Evidence**: 
- Exercise has correct load_mode: "bodyweight_plus_optional"
- Equipment has correct type: "bodyweight" 
- Equipment slug: "dip-bars"
**Suspected Cause**: Form selection logic order or condition matching

### Issue 2: Weight/Height Missing
**Problem**: Fitness profile form doesn't show weight/height inputs
**Evidence**:
- user_body_metrics table exists and is properly structured
- Form shows redirect message instead of input fields
**Suspected Cause**: Component logic redirecting instead of embedding fields

## Data Integrity Status

✅ **Good**: Exercise and equipment data properly configured
✅ **Good**: Database schema supports all required functionality  
✅ **Good**: RLS policies properly configured
❌ **Missing**: User fitness profile data
❌ **Missing**: User body metrics data
❌ **Broken**: Form selection logic for bodyweight exercises
❌ **Broken**: Weight/height input display in fitness profile