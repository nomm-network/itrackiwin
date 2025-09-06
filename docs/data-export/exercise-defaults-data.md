# Exercise Default Grips Data Export

## Current Status: No Default Grips Assigned

The query returned empty results, indicating that **no exercises currently have default grips assigned**.

### What This Means for Exercise Creation:
1. **Grip Selectors May Appear Empty**: Without default grips, the grip selector might not show any pre-selected options
2. **Compatibility-Based Fallback Required**: The system must rely on equipment→handle→grip compatibility chains
3. **Manual Selection Needed**: Users will need to manually select grips for each exercise

### Required Action:
Need to seed default grips for existing exercises to ensure proper functionality:

```sql
-- Seed default overhand grip for existing exercises
WITH grip_overhand AS (
  SELECT id FROM public.grips WHERE slug = 'overhand' LIMIT 1
)
INSERT INTO public.exercise_default_grips (exercise_id, grip_id, order_index)
SELECT e.id, g.id, 1
FROM public.exercises e
CROSS JOIN grip_overhand g
WHERE NOT EXISTS (
  SELECT 1 FROM public.exercise_default_grips edg WHERE edg.exercise_id = e.id
);
```

### Recommended Default Grip Strategy:
1. **Universal Default**: Set "overhand" as default grip for most exercises
2. **Exercise-Specific Defaults**: 
   - Bicep exercises → "underhand" 
   - Hammer curls → "neutral"
   - Deadlifts → "mixed" option
3. **Multiple Defaults**: Allow 2-3 common grips per exercise with order_index

### Impact on System:
- Without default grips, the system relies entirely on compatibility tables
- Compatibility tables are fully populated (529 mappings)
- System can still function but lacks smart defaults
- User experience improved significantly with proper default grip seeding

**Priority: HIGH** - Seed default grips before launching exercise creation UI.