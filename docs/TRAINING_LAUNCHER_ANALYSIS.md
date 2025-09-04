# TrainingLauncher Problem Analysis - COMPLETE REFRESH

## CORE ISSUE
- ✅ **DASHBOARD TEST**: Creates workouts successfully using direct RPC call
- ❌ **TRAINING LAUNCHER**: Fails silently when starting from template selection

## EXACT TECHNICAL DIFFERENCES

### Working Implementation (Dashboard.tsx)
```typescript
const { data: workoutData, error: workoutError } = await supabase.rpc('start_workout', {
  p_template_id: templateData.id
});
// Result: workoutData = "uuid-string"
```

### Failing Implementation (TrainingLauncher.tsx via Hook)
```typescript
const result = await startWorkout({ 
  templateId: templateId || undefined
});
// Inside useStartWorkout hook:
const { data, error } = await supabase.rpc('start_workout', {
  p_template_id: options.templateId || null
});
```

## ROOT CAUSE CANDIDATES

### 1. HOOK WRAPPER COMPLEXITY
**Issue**: React Query mutation wrapper adds layers of complexity
- Direct RPC call = simple and works
- Hook-wrapped RPC call = fails silently
- **Solution**: Compare exact RPC parameters being sent

### 2. TEMPLATE ID PARAMETER HANDLING
**Issue**: Different parameter sources and formats
- Dashboard: `templateData.id` (direct from DB query)
- TrainingLauncher: `searchParams.get('templateId')` (URL string)
- **Solution**: Log exact values being passed to RPC

### 3. COMPONENT LIFECYCLE TIMING
**Issue**: useEffect execution timing on mount
- Component mounts → useEffect runs → async hook call
- Potential race conditions or premature execution
- **Solution**: Add mounting state checks

### 4. REACT QUERY MUTATION STATE
**Issue**: useMutation execution context
- Query client context
- Error handling differences
- **Solution**: Test direct RPC call in TrainingLauncher

## INVESTIGATION PLAN

1. **IMMEDIATE**: Add console logs to see if hook is even executing
2. **PRIMARY**: Compare exact RPC parameters (Dashboard vs Hook)
3. **SECONDARY**: Test direct RPC call in TrainingLauncher component
4. **FINAL**: Check component mounting and URL parameter extraction

## FILES INVOLVED

- `src/pages/Dashboard.tsx` - Working implementation
- `src/features/health/fitness/workouts/ui/TrainingLauncher.tsx` - Failing component
- `src/features/health/fitness/workouts/api/workouts.api.ts` - useStartWorkout hook
- `/workouts/start-quick` route - URL parameter handling

## DATABASE FUNCTION

```sql
start_workout: {
  Args: { p_template_id?: string }
  Returns: string  -- workout UUID
}
```

**RLS**: Requires authenticated user (`auth.uid()` must exist)
**Table**: Creates record in `workouts` table with `user_id = auth.uid()`