// src/features/health/fitness/workouts/components/SetList.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import WorkoutSetsBlock from './WorkoutSetsBlock';

interface SetListProps {
  sets?: any[];
  unit?: "kg" | "lb";
  workoutExerciseId?: string;
  targetReps?: number;
  targetWeightKg?: number;
  onSetsChanged?: () => Promise<void>;
}

const SetList: React.FC<SetListProps> = ({ 
  sets = [], 
  unit = "kg", 
  workoutExerciseId,
  targetReps = 8,
  targetWeightKg = 0,
  onSetsChanged 
}) => {
  // If no sets logged yet, show target sets for logging
  if (!sets.length && targetReps && targetWeightKg) {
    return (
      <div className="mt-2 space-y-1">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex justify-between items-center text-sm p-2 border rounded">
            <span>Set {i + 1}</span>
            <span className="text-muted-foreground">Target: {targetReps} reps @ {targetWeightKg} {unit}</span>
            <Button size="sm" variant="outline">
              Log Set
            </Button>
          </div>
        ))}
      </div>
    );
  }
  
  // Show actual logged sets
  if (!sets.length) return <div className="text-xs opacity-60">No sets configured</div>;
  
  return (
    <div className="mt-2 space-y-1">
      {sets.sort((a, b) => a.set_index - b.set_index).map(s => (
        <div key={s.id} className="flex justify-between text-sm">
          <span>Set {s.set_index}</span>
          <span>{s.reps ?? "—"} reps @ {s.weight_kg ?? "—"} {unit}</span>
        </div>
      ))}
    </div>
  );
};

export default SetList;