# Admin Exercise Edit Flow Documentation

## Current Implementation Status: BROKEN ❌

### File Locations
- **Edit Form**: `src/admin/pages/AdminExerciseEdit.tsx`
- **Management Page**: `src/admin/pages/AdminExercisesManagement.tsx`
- **Route**: `/admin/exercises/:id/edit`

## Expected User Flow

1. **Navigate to Exercise Edit**
   - User clicks "Edit" button on exercise in management page
   - Routes to `/admin/exercises/{exercise-id}/edit`

2. **Load Exercise Data**
   - Form loads existing exercise data
   - Populates all form fields including:
     - Movement Pattern dropdown
     - Movement dropdown (filtered by pattern)
     - Load Type dropdown
     - All other exercise attributes

3. **Edit Exercise**
   - User modifies any form fields
   - Form validates changes

4. **Save Changes**
   - User clicks "Save Changes" button
   - Debug modal appears with full information
   - Form submits to Supabase
   - Success: Redirects to management page
   - Error: Shows error message and debug info

5. **View Results**
   - Management page shows updated exercise
   - Debug information persists from edit page

## Current Issues (All Broken)

### 1. Debug Modal Issues
- **Problem**: Modal appears for fraction of a second then disappears
- **Expected**: Modal stays visible until user closes it
- **Code Location**: `AdminExerciseEdit.tsx` lines ~618-671

### 2. Database Save Issues  
- **Problem**: Movement fields not saving to database
- **Fields Affected**:
  - `movement_id`
  - `movement_pattern_id` 
  - `load_type`
- **Expected**: All form fields save successfully
- **Code Location**: `AdminExerciseEdit.tsx` lines ~235-295

### 3. Debug Information Display
- **Problem**: Debug info not showing anywhere
- **Expected Locations**:
  - Bottom of edit page (always visible)
  - Management page after redirect (from localStorage)
- **Code Locations**: 
  - Edit page: lines ~617-650
  - Management page: lines ~803-850

### 4. Form Validation
- **Problem**: Unknown if form validation is preventing saves
- **Expected**: Clear validation errors if form invalid

## Form Data Structure

### FormValues Type
```typescript
type FormValues = {
  // Movement fields (NOT SAVING)
  movement_pattern_id?: string;
  movement_id?: string;
  load_type?: string;
  
  // Basic fields
  equipment_id: string;
  primary_muscle_id?: string;
  body_part_id?: string;
  exercise_skill_level?: string;
  complexity_score?: number;
  
  // Metadata
  source_url?: string;
  image_url?: string;
  thumbnail_url?: string;
  loading_hint?: string;
  is_public: boolean;
}
```

### Database Payload
```typescript
const exercisePayload = {
  primary_muscle_id: values.primary_muscle_id || null,
  body_part_id: values.body_part_id || null,
  equipment_id: values.equipment_id,
  exercise_skill_level: values.exercise_skill_level || null,
  complexity_score: values.complexity_score || null,
  // THESE MIGHT BE MISSING:
  movement_pattern_id: values.movement_pattern_id || null,
  movement_id: values.movement_id || null,
  load_type: values.load_type || null,
  // ... other fields
};
```

## Debug Information Structure

### Expected Debug Data
```typescript
{
  timestamp: "2025-08-31T...",
  exerciseId: "uuid-string",
  criticalFields: {
    load_type: "stack",
    movement_id: "uuid-string", 
    movement_pattern_id: "uuid-string",
    equipment_id: "uuid-string",
    exercise_skill_level: "medium",
    complexity_score: 3
  },
  sqlQuery: "UPDATE exercises SET ... WHERE id = 'uuid'",
  payload: { /* full payload object */ },
  supabaseResponse: { 
    error: null, 
    data: [{ /* updated record */ }] 
  }
}
```

## Supabase Update Query

### Expected SQL
```sql
UPDATE exercises 
SET 
  movement_pattern_id = $movement_pattern_id,
  movement_id = $movement_id,
  load_type = $load_type,
  equipment_id = $equipment_id,
  primary_muscle_id = $primary_muscle_id,
  -- ... all other fields
WHERE id = 'exercise-uuid'
```

## Investigation Steps Needed

1. **Check Form Field Binding**
   - Verify movement dropdowns are properly bound to form state
   - Check if form.setValue() calls are working

2. **Verify Database Update**
   - Check if payload includes movement fields
   - Verify SQL query generation
   - Check RLS policies on exercises table

3. **Debug State Management**
   - Fix debug modal persistence
   - Fix debug info display areas
   - Fix localStorage transfer

4. **Console Error Analysis**
   - Check browser console for JavaScript errors
   - Check network tab for failed requests
   - Check Supabase logs for errors

## Priority Fix Order

1. **FIRST**: Get debug information working so we can see what's happening
2. **SECOND**: Fix the database save operation
3. **THIRD**: Verify all form fields are properly bound and saving

## Test Case

### Test Exercise
- ID: `b0bb1fa8-83c4-4f39-a311-74f014d85bec`
- Current movement_id: `null`
- Current movement_pattern_id: `null`  
- Current load_type: `stack`

### Test Steps
1. Edit this exercise
2. Set movement_pattern_id to "push" (02024706-63ca-4f34-a4d6-7df57a6d6899)
3. Set movement_id to "horizontal_push" (d217303d-0dcb-4a79-a8ad-128573468aa0)
4. Change load_type to "dual_load"
5. Save and verify changes persist

### Expected Result
All three fields should be saved with new values.

### Current Result  
Fields remain unchanged (NULL or original values).
