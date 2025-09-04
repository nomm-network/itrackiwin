// src/features/health/fitness/workouts/components/SetList.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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

interface PendingSet {
  weight: string;
  reps: string;
}

const SetList: React.FC<SetListProps> = ({ 
  sets = [], 
  unit = "kg", 
  workoutExerciseId,
  targetReps = 8,
  targetWeightKg = 0,
  onSetsChanged 
}) => {
  const [pendingSets, setPendingSets] = useState<Record<number, PendingSet>>({});

  const handleInputChange = (setIndex: number, field: 'weight' | 'reps', value: string) => {
    setPendingSets(prev => ({
      ...prev,
      [setIndex]: {
        ...prev[setIndex],
        [field]: value
      }
    }));
  };

  const logSet = async (setIndex: number) => {
    if (!workoutExerciseId) return;
    
    const pendingSet = pendingSets[setIndex];
    if (!pendingSet?.weight || !pendingSet?.reps) return;

    try {
      await supabase.from('workout_sets').insert({
        workout_exercise_id: workoutExerciseId,
        set_index: setIndex,
        weight_kg: parseFloat(pendingSet.weight),
        reps: parseInt(pendingSet.reps),
        is_completed: true,
        completed_at: new Date().toISOString()
      });

      // Clear the pending set
      setPendingSets(prev => {
        const newState = { ...prev };
        delete newState[setIndex];
        return newState;
      });

      if (onSetsChanged) {
        await onSetsChanged();
      }
    } catch (error) {
      console.error('Error logging set:', error);
    }
  };

  // Show logged sets
  if (sets.length > 0) {
    return (
      <div className="mt-2 space-y-2">
        {sets.sort((a, b) => a.set_index - b.set_index).map(s => (
          <Card key={s.id} className="p-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Set {s.set_index}</span>
              <span className="text-sm">{s.reps} reps @ {s.weight_kg} {unit}</span>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Show target sets for logging
  return (
    <div className="mt-2 space-y-2">
      {Array.from({ length: 3 }, (_, i) => {
        const setIndex = i + 1;
        const pending = pendingSets[setIndex] || { weight: targetWeightKg.toString(), reps: targetReps.toString() };
        
        return (
          <Card key={i} className="p-3">
            <div className="flex items-center gap-3">
              <span className="font-medium min-w-[50px]">Set {setIndex}</span>
              <div className="flex items-center gap-2 flex-1">
                <Input
                  type="number"
                  placeholder="Weight"
                  value={pending.weight}
                  onChange={(e) => handleInputChange(setIndex, 'weight', e.target.value)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">{unit}</span>
                <span className="text-sm text-muted-foreground">×</span>
                <Input
                  type="number"
                  placeholder="Reps"
                  value={pending.reps}
                  onChange={(e) => handleInputChange(setIndex, 'reps', e.target.value)}
                  className="w-16"
                />
                <span className="text-sm text-muted-foreground">reps</span>
              </div>
              <Button 
                size="sm" 
                onClick={() => logSet(setIndex)}
                disabled={!pending.weight || !pending.reps}
              >
                Log
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default SetList;