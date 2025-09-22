# AI Program Generation Bug Report

## Issue Summary
**Status**: CRITICAL FAILURE  
**Error**: Edge Function returning 500 status code  
**User Impact**: Complete inability to generate AI workout programs  
**Date**: 2025-09-17  

## Error Details

### Client-Side Error
```
Edge Function Error: Edge Function returned a non-2xx status code
```

### Request Payload
```json
{
  "goal": "recomp",
  "experience_level": "intermediate", 
  "training_days_per_week": 3,
  "location_type": "gym",
  "available_equipment": [
    "1328932a-54fe-42fc-8846-6ead942c2b98",
    "a7394c99-1b07-4340-9e22-21aa8bda24bc"
  ],
  "priority_muscle_groups": ["shoulders", "biceps"],
  "time_per_session_min": 75
}
```

## System Analysis

### 1. Edge Function Status
- **Function Name**: `bro-ai-coach`
- **Function ID**: `83d037ca-7d7f-4603-851b-e91f8042b67b`
- **Last Response**: 500 Internal Server Error
- **Execution Time**: 846ms

### 2. Authentication Status
- **User ID**: `f3024241-c467-4d6a-8315-44928316cfa9`
- **Email**: `solmyr09@gmail.com`
- **Auth Status**: Confirmed and active
- **Last Sign In**: 2025-09-17 23:49:31

### 3. Database Function Analysis
- **Function Name**: `generate_ai_program`
- **Parameters**: 7 arguments (all required fields present)
- **Return Type**: jsonb
- **Security**: DEFINER with search_path = public

### 4. Database Schema Validation
**AI Programs Table Structure**:
- `id`: uuid (NOT NULL, auto-generated)
- `user_id`: uuid (NOT NULL) ✓
- `title`: text (NOT NULL) ✓ 
- `goal`: program_goal enum (NOT NULL) ✓
- `weeks`: integer (NOT NULL, default: 8) ✓
- `status`: program_status enum (NOT NULL, default: 'draft') ✓
- `created_by`: program_creator enum (NOT NULL, default: 'user') ✓

## Root Cause Analysis

### Hypothesis 1: Authentication Context Loss
The edge function uses a `userClient` with JWT token but the authentication context may not be properly preserved when calling the RPC function.

**Evidence**:
- Function expects `auth.uid()` to return valid user ID
- Database function includes "Authentication required - user not found" error handling
- Previous logs showed "Authentication required" errors

### Hypothesis 2: Service Role Key vs JWT Token Conflict  
The edge function creates a client with service role key but tries to override with user JWT. This may cause authentication conflicts.

**Evidence**:
- Mixed authentication approach in edge function
- Service role key should bypass RLS but we're trying to use user context
- Possible conflict between service role permissions and user authentication

### Hypothesis 3: Equipment UUID Resolution Failure
The equipment lookup step may be failing, causing the function to crash before reaching the RPC call.

**Evidence**:
- Equipment UUIDs need to be resolved to slugs
- Function performs database query before RPC call
- No error handling if equipment lookup fails silently

## Current Edge Function Issues

### 1. Mixed Authentication Strategy
```typescript
// PROBLEMATIC: Using service role key with user JWT override
const supabase = createClient(url, serviceRoleKey)
const userClient = createClient(url, serviceRoleKey, {
  global: { headers: { Authorization: `Bearer ${jwt}` } }
})
```

### 2. Insufficient Error Logging
- No specific error details captured from RPC call failures
- Missing detailed error context for debugging
- Edge function logs not accessible through analytics queries

### 3. Equipment Resolution Logic
- UUIDs converted to slugs but function expects text arrays
- No validation of equipment data before RPC call

## Recommended Solutions

### Immediate Fix (Authentication)
1. Use consistent authentication strategy - either service role OR user JWT, not both
2. For user-scoped operations, use proper user authentication
3. Add comprehensive error logging to edge function

### Database Function Improvements
1. Add more detailed logging in `generate_ai_program` function
2. Validate authentication context before proceeding
3. Add proper error handling for enum conversions

### Edge Function Refactoring
1. Simplify authentication approach
2. Add request/response logging
3. Improve error handling and reporting

## Testing Strategy

### 1. Authentication Test
- Verify `auth.uid()` returns correct user ID in database context
- Test with both service role and user JWT approaches

### 2. Equipment Resolution Test  
- Verify equipment UUID to slug conversion works correctly
- Test with missing/invalid equipment IDs

### 3. Database Function Test
- Test `generate_ai_program` function directly with known good parameters
- Verify all enum conversions work correctly

## Files Requiring Changes

1. `supabase/functions/bro-ai-coach/index.ts` - Fix authentication strategy
2. Database function `generate_ai_program` - Add more logging
3. Client-side error handling - Improve error display

## Next Steps

1. **STOP** making blind code changes
2. Enable proper edge function logging to capture actual errors
3. Test authentication context in database function
4. Implement systematic debugging approach
5. Create comprehensive test cases

---

**Report Generated**: 2025-09-17 23:55:00 UTC  
**Status**: Ready for systematic debugging approach