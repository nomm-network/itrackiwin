# Debugging Edge Function Authentication Issues

## Problem Statement

Edge functions calling database RPC functions with user authentication context are failing with 500 errors. The specific issue is that `auth.uid()` returns NULL in the database function context when called from edge functions.

## Technical Deep Dive

### Authentication Flow in Supabase

1. **Client Request**: User makes authenticated request with JWT token
2. **Edge Function**: Receives request with `Authorization: Bearer <JWT>` header  
3. **Database RPC**: Edge function calls database function via `supabase.rpc()`
4. **Auth Context**: Database function calls `auth.uid()` to get user ID

### The Problem

When an edge function calls a database RPC function, the authentication context doesn't automatically carry over. The `auth.uid()` function in PostgreSQL depends on the current session's JWT token being properly set.

## Authentication Strategies

### Strategy 1: Service Role with RLS Bypass (CURRENT - BROKEN)
```typescript
// Edge function creates service role client
const supabase = createClient(url, serviceRoleKey)

// Then tries to override with user JWT - THIS DOESN'T WORK
const userClient = createClient(url, serviceRoleKey, {
  global: { headers: { Authorization: `Bearer ${jwt}` } }
})
```

**Issues**:
- Service role key bypasses RLS completely
- JWT override doesn't properly set auth context for RPC calls
- Mixed authentication approach causes conflicts

### Strategy 2: User JWT Only (RECOMMENDED)
```typescript
// Extract JWT from request
const jwt = authHeader.replace('Bearer ', '')

// Create client with user JWT and anon key
const supabase = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${jwt}` } }
})
```

**Benefits**:
- Maintains user authentication context
- RLS policies work correctly
- `auth.uid()` returns proper user ID

### Strategy 3: Pass User ID Explicitly
```typescript
// Extract user ID from JWT in edge function
const { data: { user } } = await supabase.auth.getUser(jwt)

// Pass user_id as parameter to RPC function
const { data, error } = await supabase.rpc('generate_ai_program', {
  user_id: user.id, // Explicit parameter
  goal: mappedGoal,
  // ... other params
})
```

## Database Function Considerations

### Current Function Design
```sql
CREATE OR REPLACE FUNCTION generate_ai_program(...)
RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Relies on auth.uid() - THIS FAILS IN EDGE FUNCTION CONTEXT
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required - user not found';
  END IF;
  -- ... rest of function
END;
$$;
```

### Alternative: Accept User ID Parameter
```sql
CREATE OR REPLACE FUNCTION generate_ai_program(
  p_user_id uuid,  -- Explicit user ID parameter
  p_goal text,
  -- ... other parameters
)
RETURNS jsonb AS $$
BEGIN
  -- Use provided user ID instead of auth.uid()
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID required';
  END IF;
  
  -- Verify user exists and is authenticated (optional security check)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Invalid user ID';
  END IF;
  
  -- ... rest of function using p_user_id
END;
$$;
```

## Debugging Tools

### 1. Edge Function Logging
```typescript
console.log('Auth header received:', authHeader);
console.log('JWT token:', jwt);
console.log('User from JWT:', user);
```

### 2. Database Function Logging
```sql
RAISE LOG 'Function called with user_id: %, auth.uid(): %', p_user_id, auth.uid();
```

### 3. RPC Call Error Handling
```typescript
const { data, error } = await supabase.rpc('generate_ai_program', params);

if (error) {
  console.error('RPC Error Details:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code
  });
  return json({ error: 'Detailed error info', details: error }, 500);
}
```

## Recommended Implementation

### Step 1: Update Edge Function
```typescript
export default async function handler(req: Request) {
  // Get JWT from request
  const authHeader = req.headers.get('Authorization');
  const jwt = authHeader?.replace('Bearer ', '');
  
  // Create authenticated client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!, // Use anon key, not service role
    {
      global: {
        headers: { Authorization: `Bearer ${jwt}` }
      }
    }
  );
  
  // Verify user authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return json({ error: 'Authentication required' }, 401);
  }
  
  // Call RPC with authenticated context
  const { data, error } = await supabase.rpc('generate_ai_program', params);
}
```

### Step 2: Test Authentication Context
```sql
-- Test function to verify auth context
CREATE OR REPLACE FUNCTION test_auth_context()
RETURNS jsonb AS $$
BEGIN
  RETURN jsonb_build_object(
    'auth_uid', auth.uid(),
    'current_user', current_user,
    'session_user', session_user
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Gradual Migration
1. First, test auth context with simple function
2. Update database function to log auth details
3. Modify edge function authentication strategy
4. Test with actual program generation
5. Remove debug logging once working

## Security Considerations

### RLS Policy Verification
Ensure RLS policies on `ai_programs` table properly restrict access:
```sql
-- Verify current policy
SELECT * FROM pg_policies WHERE tablename = 'ai_programs';

-- Expected policy
CREATE POLICY "Users can manage their own AI programs" 
ON ai_programs FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Edge Function Security
- Always validate user authentication
- Don't expose sensitive error details to client
- Use proper CORS headers
- Validate all input parameters

## Testing Strategy

### 1. Unit Tests for Auth Context
- Test `auth.uid()` in various contexts
- Verify RLS policies work correctly
- Test edge function authentication

### 2. Integration Tests
- End-to-end program generation flow
- Error handling scenarios
- Authentication edge cases

### 3. Manual Testing
- Test with different user accounts
- Verify error messages are appropriate
- Check database logs for auth context

---

This debugging guide provides a systematic approach to resolving the authentication issues in edge function to database RPC calls.
