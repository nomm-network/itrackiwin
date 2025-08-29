# Relevant Code Files for ChatGPT Analysis

## Core Problem: Grips not visible in Add Exercise dialog

### 1. HandleGripSelector Component
**File:** `src/components/exercise/HandleGripSelector.tsx`
```typescript
// Key props and logic
interface HandleGripSelectorProps {
  exerciseId?: string;  // ← PROBLEM: undefined for new exercises
  selectedHandleId?: string;
  selectedGripIds?: string[];
  onHandleChange: (handleId: string) => void;
  onGripChange: (gripIds: string[]) => void;
  multiSelect?: boolean;
}

// Current data fetching (BROKEN for new exercises)
const { data: exerciseHandles, isLoading: handlesLoading } = useExerciseHandles(exerciseId);
const { data: allGrips, isLoading: gripsLoading } = useGrips();

// Render logic
{exerciseHandles?.map((exerciseHandle) => (  // ← Empty when exerciseId is undefined
  <Button
    key={exerciseHandle.handle_id}
    onClick={() => onHandleChange(exerciseHandle.handle_id)}
  >
    {pickHandleName(exerciseHandle)}
  </Button>
))}

// Grips only show when handle selected
{selectedHandleId && (
  allGrips.map((grip) => (  // ← Shows ALL grips, no equipment filtering
    <Badge onClick={() => handleGripToggle(grip.id)}>
      {grip.name}
    </Badge>
  ))
)}
```

### 2. useExerciseHandles Hook  
**File:** `src/hooks/useExerciseHandles.ts`
```typescript
export function useExerciseHandles(exerciseId?: string, lang: 'en' | 'ro' = 'en') {
  return useQuery({
    queryKey: ['exercise-handles', exerciseId, lang],
    enabled: !!exerciseId,  // ← PROBLEM: Disabled when exerciseId is undefined
    queryFn: async (): Promise<ExerciseHandleRow[]> => {
      const { data, error } = await supabase
        .from('exercise_handles')  // ← Empty table for new exercises
        .select(`
          handle_id, is_default,
          handle:handles (
            id, slug,
            translations:handle_translations (language_code, name, description)
          )
        `)
        .eq('exercise_id', exerciseId);  // ← No results for new exercises

      if (error) throw error;
      const rows = (data || []) as ExerciseHandleRow[];
      return rows.sort((a,b) => (a.is_default === b.is_default ? 0 : a.is_default ? -1 : 1));
    },
  });
}
```

### 3. CreateExerciseDialogV2 Integration
**File:** `src/components/admin/CreateExerciseDialogV2.tsx` (Lines ~830-870)
```typescript
// HandleGripSelector is used in Attributes tab
{formData.allowsGrips && (
  <div className="space-y-4">
    <Label>Handle & Grip Selection</Label>
    <HandleGripSelector
      exerciseId={undefined}  // ← NEW exercise has no ID yet
      selectedHandleId={selectedHandleId}
      selectedGripIds={selectedGripIds}
      onHandleChange={setSelectedHandleId}
      onGripChange={setSelectedGripIds}
    />
  </div>
)}

// State management
const [selectedHandleId, setSelectedHandleId] = useState<string>('');
const [selectedGripIds, setSelectedGripIds] = useState<string[]>([]);
```

### 4. useGrips Hook (Working)
**File:** `src/hooks/useGrips.ts`
```typescript
export const useGrips = () => {
  return useQuery({
    queryKey: ['grips'],
    queryFn: async (): Promise<Grip[]> => {
      const { data, error } = await supabase
        .from('grips')
        .select('id, slug, category')
        .order('slug');

      // Get translations separately
      const gripIds = data?.map(grip => grip.id) || [];
      const { data: translations } = await supabase
        .from('grips_translations')
        .select('grip_id, name, language_code')
        .in('grip_id', gripIds)
        .eq('language_code', 'en');

      // Process data to include translated names
      const processedData = data?.map(grip => {
        const translation = translations?.find(t => t.grip_id === grip.id);
        return {
          ...grip,
          name: translation?.name || 
                grip.slug.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')
        };
      }) || [];

      return processedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

## Required Solution Architecture

### New Hook Needed: useAvailableHandlesForEquipment
```typescript
// Should fetch handles available for specific equipment
// Query: equipment_handle_grips → handles → handle_translations
export function useAvailableHandlesForEquipment(equipmentId?: string) {
  // Fetch handles that are compatible with the equipment
  // Should return similar structure to useExerciseHandles
}
```

### New Hook Needed: useCompatibleGripsForHandle  
```typescript
// Should fetch grips compatible with specific handle + equipment
// Query: equipment_handle_grips WHERE equipment_id AND handle_id
export function useCompatibleGripsForHandle(equipmentId?: string, handleId?: string) {
  // Return grips that work with this equipment + handle combination
}
```

### Modified HandleGripSelector Logic
```typescript
// Should handle both existing exercises AND new exercise creation
const isNewExercise = !exerciseId;

// For existing exercises: use current logic
// For new exercises: use equipment-based handle/grip fetching
const handleData = isNewExercise 
  ? useAvailableHandlesForEquipment(equipmentId)
  : useExerciseHandles(exerciseId);

const gripData = isNewExercise
  ? useCompatibleGripsForHandle(equipmentId, selectedHandleId)  
  : useGrips(); // Current fallback
```