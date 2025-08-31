# CRITICAL BUG REPORT: Exercise Edit Form Not Saving & Debug Features Broken

## Date: 2025-08-31
## Severity: HIGH - Core functionality broken
## Reporter: User

## ISSUE SUMMARY
The exercise edit form in the admin panel has multiple critical failures:
1. Form data not saving to database (specifically movement fields)
2. Debug popup disappears instantly
3. Debug information not displaying in edit page
4. Debug information not transferring to management page
5. Overall save functionality not working

## EXPECTED BEHAVIOR
- User edits exercise fields (load_type, movement_id, movement_pattern_id)
- Clicks "Save Changes"
- Debug popup appears and stays visible
- Debug information shows at bottom of edit page
- After redirect, debug info appears on management page
- All form fields are successfully saved to database

## ACTUAL BEHAVIOR
- Debug popup appears for fraction of a second and disappears
- No debug information visible anywhere
- Form fields (especially movement-related) NOT saving to database
- Save functionality appears broken

## AFFECTED COMPONENTS
- `src/admin/pages/AdminExerciseEdit.tsx` - Primary edit form
- `src/admin/pages/AdminExercisesManagement.tsx` - Management listing page
- Database UPDATE queries for exercises table

## DATABASE STRUCTURE

### exercises table structure:
```sql
-- Key columns related to the bug:
movement_id: uuid (nullable: YES)
movement_pattern_id: uuid (nullable: YES)  
load_type: USER-DEFINED (nullable: YES)
equipment_id: uuid (nullable: NO)
equipment_ref_id: uuid (nullable: YES)
```

### Related tables:
- `movements` table: Contains movement definitions
- `movement_patterns` table: Contains movement pattern definitions
- `equipment` table: Contains equipment definitions

### Sample data from movements table:
```
ID: d217303d-0dcb-4a79-a8ad-128573468aa0, slug: horizontal_push
ID: 0c64f081-5cb8-4682-8395-315d5533362c, slug: vertical_push
ID: c13388d5-e568-4166-9081-8b5b4e8ebc53, slug: dip
```

### Sample data from movement_patterns table:
```
ID: 02024706-63ca-4f34-a4d6-7df57a6d6899, slug: push
ID: ac7157d7-4324-4a40-b98f-5183e47eed32, slug: pull
ID: 640e7fb0-6cc5-448a-b822-409f05ee68e9, slug: squat
```

## DEBUGGING ATTEMPTS MADE
1. Added debug state to AdminExerciseEdit component
2. Added debug modal popup 
3. Added localStorage transfer to management page
4. Added debug info display at bottom of edit page
5. Added SQL query logging to debug info

## CODE ISSUES IDENTIFIED
1. Debug modal state management appears broken
2. LocalStorage persistence not working
3. Database update payload may be missing critical fields
4. Form validation may be preventing saves

## TECHNICAL DETAILS

### Current Form Submit Flow:
```javascript
onSubmit(values) -> 
  setDebugInfo() -> 
  supabase.update(exercisePayload) -> 
  navigate to management page
```

### Suspected Issues:
- Debug modal `showDebugModal` state resets immediately
- `exercisePayload` missing movement fields
- Supabase update query failing silently
- Form validation blocking submission

## SAMPLE EXERCISE RECORD
```json
{
  "id": "b0bb1fa8-83c4-4f39-a311-74f014d85bec",
  "movement_id": null,
  "movement_pattern_id": null,
  "load_type": "stack",
  "equipment_id": "5e6739f8-3ed5-4f0b-b274-1e3a9e2dd0f0",
  "equipment_ref_id": null
}
```

## RECOMMENDED INVESTIGATION STEPS
1. Check if form values are properly bound to form fields
2. Verify database UPDATE statement includes movement fields
3. Check for console errors during save operation
4. Verify RLS policies allow updates to exercises table
5. Test with simpler payload to isolate issue
6. Check if navigation is interrupting save operation

## FILES TO REVIEW
- `src/admin/pages/AdminExerciseEdit.tsx` (lines 235-295)
- `src/admin/pages/AdminExercisesManagement.tsx` (debug display logic)
- Database RLS policies for exercises table
- Form validation schema in AdminExerciseEdit

## PRIORITY
**CRITICAL** - This breaks core admin functionality for exercise management.

## STATUS
**UNRESOLVED** - Multiple debugging attempts failed. Requires complete review of save flow.