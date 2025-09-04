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

const SetList: React.FC<SetListProps> = ({ sets = [], unit = "kg" }) => {
  if (!sets.length) return <div className="text-xs opacity-60">No sets yet</div>;
  
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