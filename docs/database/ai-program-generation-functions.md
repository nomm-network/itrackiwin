# AI Program Generation Functions - Audit Documentation

## Overview
This document details all functions and systems involved in AI-powered fitness program generation for audit and compliance purposes.

## Core AI Program Generation Function

### `generate_ai_program` RPC Function
**Status**: Referenced in code but implementation not found in current schema
**Purpose**: Main entry point for AI program generation
**Expected Parameters**:
- `goal`: Training goal (recomp, fat_loss, muscle_gain, strength, general_fitness)
- `experience_level`: User experience (new, returning, intermediate, advanced, very_experienced)
- `training_days_per_week`: Number of training days
- `location_type`: Training location (home, gym)
- `available_equipment`: Array of available equipment
- `priority_muscle_groups`: Array of muscle groups to prioritize
- `time_per_session_min`: Session duration in minutes

**Expected Returns**: AI program data structure

**Security**: Uses RLS with auth.uid() for user authorization

## Edge Function: `bro-ai-coach`

### Function Location
`supabase/functions/bro-ai-coach/index.ts`

### Authentication Flow
1. Extracts user token from Authorization header
2. Creates Supabase client with service role key and user token
3. Validates user authentication via `supabase.auth.getUser()`
4. Uses RLS policies for data access control

### Data Retrieval Process
1. **User Profile Lookup**: Retrieves user fitness profile from `user_profile_fitness` table
2. **Profile Validation**: Ensures user has completed fitness configuration
3. **Data Transformation**: Converts profile data to program generation parameters

### Program Generation Data Flow
```javascript
// Data extracted from user_profile_fitness
const programData = {
  goal: fitnessProfile.goal,
  experience_level: fitnessProfile.experience_level,
  training_days_per_week: fitnessProfile.training_days_per_week,
  location_type: fitnessProfile.location_type,
  available_equipment: fitnessProfile.available_equipment || [],
  priority_muscle_groups: fitnessProfile.priority_muscle_groups || [],
  time_per_session_min: fitnessProfile.time_per_session_min || 60,
}
```

### Database RPC Call
```javascript
const { data, error } = await supabase.rpc('generate_ai_program', programData)
```

### Error Handling
- Authentication errors return 401 status
- Missing fitness profile returns 400 status with guidance message
- Database errors return 500 status with error details
- All errors are logged with detailed context

### Security Measures
1. **Token Validation**: Requires valid JWT token
2. **User Context**: All operations tied to authenticated user
3. **RLS Enforcement**: Database queries respect Row Level Security
4. **Input Validation**: Validates fitness profile existence
5. **Error Sanitization**: Sensitive data not exposed in error responses

## Supporting Database Functions

### User Profile Functions

#### `useFitnessProfile()` (Client Hook)
**Purpose**: Retrieves user fitness profile for AI generation
**Table**: `user_profile_fitness`
**Security**: User can only access own profile

#### `useUpsertFitnessProfile()` (Client Hook)  
**Purpose**: Creates/updates user fitness profile
**Validation**: Ensures required fields for AI generation
**Default Values**:
- `goal`: 'muscle_gain'
- `training_goal`: 'general_fitness'

### Readiness Integration Functions

#### `compute_readiness_for_user(_user_id uuid)`
**Purpose**: Calculates user readiness score (0-100) for workout intensity
**Algorithm**: Based on recent readiness check-ins
**Usage**: AI program intensity adjustments

#### `readiness_multiplier(readiness_score numeric)`
**Purpose**: Converts readiness score to training load multiplier
**Range**: Typically 0.90 to 1.08
**Usage**: Dynamic weight adjustments in generated programs

### Weight Selection Functions

#### `pick_base_load(user_id uuid, exercise_id uuid)`
**Purpose**: Selects appropriate starting weight for exercises
**Logic**: Analyzes last 3 workouts within 60 days
**Fallback**: Uses default weights if no history

#### `generate_warmup_steps(target_weight_kg numeric)`
**Purpose**: Creates progressive warmup protocol
**Returns**: JSONB array of warmup sets
**Usage**: Automatic warmup generation in AI programs

### Progressive Overload Functions

#### `fn_suggest_sets(p_exercise_id uuid, p_progression_type text, p_target_reps integer)`
**Purpose**: Suggests set/rep/weight schemes for progression
**Progression Types**:
- 'linear': Simple weight increases
- 'percentage': % of 1RM based
- 'pyramid': Ascending weight schemes
**Returns**: JSONB with suggested parameters

#### `fn_detect_stagnation(p_exercise_id uuid, p_lookback_sessions integer)`
**Purpose**: Identifies training plateaus
**Analysis**: Recent performance trends
**Output**: Recommendations for plateau breaking

### Exercise Selection Functions

#### Exercise Filtering Logic (Inferred)
Based on schema, AI program generation likely uses:
- `ai_exercises` table for exercise pool
- `experience_level` filtering via `experience_min` field
- `required_equipment` matching against user's available equipment
- `primary_muscle` and `secondary_muscles` for muscle group prioritization

## Data Tables Used in AI Generation

### Primary Profile Table
**Table**: `user_profile_fitness`
**Key Fields**:
- `user_id`: Links to authenticated user
- `goal`: Training objective
- `experience_level_id`: Links to experience parameters
- `training_days_per_week`: Frequency constraint
- `location_type`: Training environment
- `available_equipment`: Equipment constraints
- `priority_muscle_groups`: Focus areas
- `preferred_session_minutes`: Time constraints

### AI Exercise Pool
**Table**: `ai_exercises`
**Selection Criteria**:
- `difficulty`: Matched to experience level
- `experience_min`: Minimum experience requirement
- `required_equipment`: Equipment availability filtering
- `primary_muscle`: Muscle group targeting
- `is_bodyweight`: Location-based filtering
- `movement_type`: Exercise variety (compound, isolation)

### Generated Program Structure
**Tables**:
- `ai_programs`: Program metadata and parameters
- `ai_program_weeks`: Weekly structure
- `ai_program_workouts`: Individual workout sessions
- `ai_program_workout_exercises`: Exercise prescriptions with sets/reps/load

## Audit Trail and Logging

### Edge Function Logging
All AI generation requests logged with:
- User ID and authentication status
- Request parameters and fitness profile data
- Program generation success/failure
- Execution timing and performance metrics
- Error details for troubleshooting

### Database Activity
- All program generation creates records in `ai_programs` table
- User ownership tracked via `user_id` field
- Creation timestamps for audit trail
- Program status tracking (draft, active, completed)

## Security Compliance

### Data Access Control
1. **User Isolation**: Each user can only access their own data
2. **RLS Enforcement**: Database-level security policies
3. **Authentication Required**: No anonymous access to generation
4. **Role-Based Access**: Admin functions separated from user functions

### Data Privacy
1. **Profile Data**: Only user's own fitness profile accessible
2. **Generated Programs**: Private to creating user
3. **Exercise Pool**: Public exercise data only
4. **No Cross-User Data**: No access to other users' programs or profiles

### Input Validation
1. **Enum Validation**: Goal and experience level restricted to valid values
2. **Equipment Validation**: Equipment IDs validated against available equipment
3. **Muscle Group Validation**: Priority muscles validated against standard list
4. **Numeric Constraints**: Training days and session time within reasonable limits

## Error Handling and Recovery

### Client-Side Error Handling
**Hook**: `useGenerateProgram()`
**Error Categories**:
- Authentication failures
- Missing fitness profile
- Database connectivity issues
- Invalid parameter combinations

### Server-Side Error Handling
**Edge Function**: Comprehensive error catching and logging
**Database**: Transaction rollback on generation failures
**Recovery**: User guided to complete fitness profile setup

## API Rate Limiting
**Table**: `admin_check_rate_limit`
**Purpose**: Prevents AI generation abuse
**Mechanism**: User-based request counting with time windows

## Conclusion
The AI program generation system implements multiple layers of security, validation, and audit logging to ensure reliable and secure operation while maintaining user data privacy and system integrity.