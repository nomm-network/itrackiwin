import React, { useState } from 'react';
import { BarSelector } from './BarSelector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Exercise = {
  id: string;
  selected_bar_id?: string | null;
  exercise?: {
    is_bar_loaded?: boolean;
  };
};

type Props = {
  exercise: Exercise;
  setIndex: number;
  onLogged: () => void;
};

export function BarLoadedSetInput({ exercise, setIndex, onLogged }: Props) {
  const isBarLoaded = exercise?.exercise?.is_bar_loaded === true;
  const [barId, setBarId] = useState<string | null>(exercise?.selected_bar_id ?? null);
  const [barWeight, setBarWeight] = useState<number>(0);
  const [perSide, setPerSide] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const total = (barWeight || 0) + (perSide || 0) * 2;

  const handleLog = async () => {
    if (!barId) {
      toast({
        title: "Bar Required",
        description: "Please select a bar before logging the set.",
        variant: "destructive"
      });
      return;
    }

    if (!reps || reps <= 0) {
      toast({
        title: "Reps Required",
        description: "Please enter the number of reps.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        workout_exercise_id: exercise.id,
        set_index: setIndex,
        is_completed: true,
        reps,
        bar_id: barId,
        weight_per_side: perSide,
      };

      const { data, error } = await supabase.rpc('set_log', { p_payload: payload });
      
      if (error) {
        console.error('Error logging set:', error);
        toast({
          title: "Error",
          description: "Failed to log set. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Set Logged",
        description: `Set ${setIndex} logged: ${total} kg × ${reps} reps`,
      });

      // Reset form
      setPerSide(0);
      setReps(0);
      
      onLogged();
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error", 
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isBarLoaded) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <BarSelector
        workoutExerciseId={exercise.id}
        selectedBarId={barId}
        onChange={(id, weight) => { 
          setBarId(id); 
          setBarWeight(weight); 
        }}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Per side (kg)</label>
          <Input
            type="number"
            value={perSide || ''}
            onChange={(e) => setPerSide(parseFloat(e.target.value) || 0)}
            min={0}
            step="0.5"
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Reps</label>
          <Input
            type="number"
            value={reps || ''}
            onChange={(e) => setReps(parseInt(e.target.value) || 0)}
            min={0}
            step={1}
            placeholder="0"
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
        <strong>Total: {total.toFixed(1)} kg</strong>
        <div className="text-xs mt-1">
          {barWeight} kg bar + {perSide} kg × 2 sides
        </div>
      </div>

      <Button 
        onClick={handleLog} 
        className="w-full" 
        disabled={isLoading || !barId || !reps}
      >
        {isLoading ? 'Logging...' : `Log Set ${setIndex}`}
      </Button>
    </div>
  );
}