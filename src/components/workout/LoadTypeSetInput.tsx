import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BarSelector } from './BarSelector';
import { useEquipmentEffective } from '@/hooks/useEquipmentEffective';
import { logSet } from '@/features/health/fitness/workouts/api/workouts.api';
import { toast } from '@/hooks/use-toast';

type Exercise = {
  id: string;
  selected_bar_id?: string | null;
  exercise?: {
    is_bar_loaded?: boolean;
    equipment_id?: string;
  };
  equipment?: {
    load_type?: string;
    load_medium?: string;
  };
};

type Props = {
  exercise: Exercise;
  setIndex: number;
  onLogged: () => void;
};

export function LoadTypeSetInput({ exercise, setIndex, onLogged }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: effective } = useEquipmentEffective(
    exercise?.exercise?.equipment_id,
    undefined // TODO: Add gym_id when gym selection is implemented
  );

  const loadType = effective?.load_type || exercise?.equipment?.load_type;
  const loadMedium = effective?.load_medium || exercise?.equipment?.load_medium;
  const isDualLoad = loadType === 'dual_load';
  const isBarMedium = loadMedium === 'bar';
  const barWeight = effective?.bar_weight_kg || 0;

  const [entryMode, setEntryMode] = useState<'perSide' | 'total'>(
    isDualLoad ? 'perSide' : 'total'
  );
  const [barId, setBarId] = useState<string | null>(exercise?.selected_bar_id ?? null);
  const [perSide, setPerSide] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);

  // Auto-calculate total when in per-side mode
  useEffect(() => {
    if (entryMode === 'perSide') {
      const calculatedTotal = (perSide * 2) + (isBarMedium ? barWeight : 0);
      setTotal(calculatedTotal);
    }
  }, [perSide, entryMode, isBarMedium, barWeight]);

  // Auto-calculate per-side when in total mode
  useEffect(() => {
    if (entryMode === 'total' && isDualLoad) {
      const remainingWeight = total - (isBarMedium ? barWeight : 0);
      setPerSide(Math.max(0, remainingWeight / 2));
    }
  }, [total, entryMode, isDualLoad, isBarMedium, barWeight]);

  const handleLog = async () => {
    if (!reps || reps <= 0) {
      toast({
        title: "Reps Required",
        description: "Please enter the number of reps.",
        variant: "destructive"
      });
      return;
    }

    const payload = {
      workout_exercise_id: exercise.id,
      set_index: setIndex,
      is_completed: true,
      reps,
      ...(isDualLoad && entryMode === 'perSide' ? {
        bar_id: barId,
        weight_per_side: perSide
      } : {
        weight_total: total
      })
    };

    try {
      setIsLoading(true);
      await logSet({
        workout_exercise_id: exercise.id,
        set_index: setIndex,
        weight_kg: total,
        reps,
      });
      toast({
        title: "Set Logged",
        description: `Set ${setIndex + 1} logged: ${total.toFixed(1)} kg × ${reps} reps`,
      });
      
      // Reset form
      setPerSide(0);
      setTotal(0);
      setReps(0);
      onLogged();
    } catch (error) {
      console.error('Error logging set:', error);
      toast({
        title: "Error",
        description: "Failed to log set",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      {/* Bar selector for bar-loaded exercises */}
      {isBarMedium && (
        <BarSelector
          workoutExerciseId={exercise.id}
          selectedBarId={barId}
          onChange={(id, weight) => { 
            setBarId(id);
            // Note: barWeight is handled via effective hook
          }}
        />
      )}

      {/* Entry mode toggle for dual-load equipment */}
      {isDualLoad && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Entry Mode</label>
          <ToggleGroup 
            type="single" 
            value={entryMode} 
            onValueChange={(value) => value && setEntryMode(value as 'perSide' | 'total')}
            className="justify-start"
          >
            <ToggleGroupItem value="perSide" className="text-xs">
              Per Side
            </ToggleGroupItem>
            <ToggleGroupItem value="total" className="text-xs">
              Total
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Weight input based on mode and load type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {isDualLoad && entryMode === 'perSide' ? 'Per side (kg)' : 'Weight (kg)'}
          </label>
          <Input
            type="number"
            value={isDualLoad && entryMode === 'perSide' ? perSide || '' : total || ''}
            onChange={(e) => {
              const value = parseFloat(e.target.value) || 0;
              if (isDualLoad && entryMode === 'perSide') {
                setPerSide(value);
              } else {
                setTotal(value);
              }
            }}
            min={0}
            step={effective?.side_min_plate_kg || effective?.single_min_increment_kg || 1.25}
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

      {/* Total weight display */}
      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
        <strong>Total: {total.toFixed(1)} kg</strong>
        {isDualLoad && entryMode === 'perSide' && (
          <div className="text-xs mt-1">
            {isBarMedium ? `${barWeight} kg bar + ` : ''}
            {perSide} kg × 2 sides
          </div>
        )}
      </div>

      <Button 
        onClick={handleLog} 
        className="w-full" 
        disabled={isLoading || !reps || (isDualLoad && entryMode === 'perSide' && isBarMedium && !barId)}
      >
        {isLoading ? 'Logging...' : `Log Set ${setIndex + 1}`}
      </Button>
    </div>
  );
}