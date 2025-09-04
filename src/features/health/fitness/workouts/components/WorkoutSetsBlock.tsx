import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WorkoutSet } from '../api/useWorkout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface WorkoutSetsBlockProps {
  workoutExerciseId: string;
  targetReps: number | null;
  targetWeightKg: number | null;
  unit: 'kg' | 'lb';
  workoutSets: WorkoutSet[];
}

interface SetRowProps {
  setIndex: number;
  targetReps: number | null;
  targetWeightKg: number | null;
  unit: 'kg' | 'lb';
  workoutExerciseId: string;
  existingSet?: WorkoutSet;
  previousSet?: WorkoutSet;
}

function SetRow({ setIndex, targetReps, targetWeightKg, unit, workoutExerciseId, existingSet, previousSet }: SetRowProps) {
  const [weight, setWeight] = useState(existingSet?.weight_kg || targetWeightKg || 0);
  const [reps, setReps] = useState(existingSet?.reps || targetReps || 8);
  const [feeling, setFeeling] = useState<'terrible' | 'poor' | 'ok' | 'good' | 'excellent' | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogSet = async () => {
    setIsLogging(true);
    try {
      const { error } = await supabase.rpc('log_simple_workout_set', {
        p_workout_exercise_id: workoutExerciseId,
        p_set_index: setIndex,
        p_weight_kg: weight,
        p_reps: reps,
        p_set_kind: 'normal'
      });

      if (error) throw error;

      // Refetch workout data
      queryClient.invalidateQueries({ queryKey: ['workout'] });
      
      toast({
        title: "Set logged",
        description: `${weight}kg × ${reps} reps recorded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log set",
        variant: "destructive",
      });
    } finally {
      setIsLogging(false);
    }
  };

  const isCompleted = existingSet?.is_completed || false;

  return (
    <div className="p-4 border-b border-[#133a2f] last:border-b-0">
      {/* Previous/Target Banner */}
      {previousSet && (
        <div className="text-xs text-gray-400 mb-2">
          Prev {previousSet.weight_kg}×{previousSet.reps} | Target {targetWeightKg}×{targetReps}
        </div>
      )}

      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-emerald-300 min-w-[60px]">
          Set {setIndex}
        </span>

        {/* Weight Input */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeight(Math.max(0, weight - 2.5))}
            className="w-8 h-8 rounded-full bg-gray-700 text-white text-sm hover:bg-gray-600"
            disabled={isCompleted}
          >
            -
          </button>
          <span className="text-white min-w-[60px] text-center">
            {weight}{unit}
          </span>
          <button
            onClick={() => setWeight(weight + 2.5)}
            className="w-8 h-8 rounded-full bg-gray-700 text-white text-sm hover:bg-gray-600"
            disabled={isCompleted}
          >
            +
          </button>
        </div>

        {/* Reps Input */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReps(Math.max(1, reps - 1))}
            className="w-8 h-8 rounded-full bg-gray-700 text-white text-sm hover:bg-gray-600"
            disabled={isCompleted}
          >
            -
          </button>
          <span className="text-white min-w-[40px] text-center">
            {reps}
          </span>
          <button
            onClick={() => setReps(reps + 1)}
            className="w-8 h-8 rounded-full bg-gray-700 text-white text-sm hover:bg-gray-600"
            disabled={isCompleted}
          >
            +
          </button>
        </div>

        {/* Log Button */}
        <Button
          onClick={handleLogSet}
          disabled={isCompleted || isLogging}
          size="sm"
          className="bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50"
        >
          {isCompleted ? 'Logged' : isLogging ? 'Logging...' : 'Log'}
        </Button>
      </div>

      {/* How did that feel? */}
      {isCompleted && (
        <div className="mt-3">
          <div className="text-xs text-gray-400 mb-2">How did that feel?</div>
          <div className="flex gap-2">
            {(['terrible', 'poor', 'ok', 'good', 'excellent'] as const).map((emotion) => (
              <button
                key={emotion}
                onClick={() => setFeeling(emotion)}
                className={`p-2 rounded border text-xs ${
                  feeling === emotion
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >
                {emotion === 'terrible' && '😰'}
                {emotion === 'poor' && '😕'}
                {emotion === 'ok' && '😐'}
                {emotion === 'good' && '😊'}
                {emotion === 'excellent' && '😄'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkoutSetsBlock({ workoutExerciseId, targetReps, targetWeightKg, unit, workoutSets }: WorkoutSetsBlockProps) {
  const normalSets = workoutSets.filter(s => s.set_kind !== 'warmup').sort((a, b) => a.set_index - b.set_index);

  return (
    <div className="bg-[#0f1f1b]">
      {[1, 2, 3].map((setIndex) => {
        const existingSet = normalSets.find(s => s.set_index === setIndex);
        const previousSet = normalSets.find(s => s.set_index === setIndex - 1 && s.is_completed);
        
        return (
          <SetRow
            key={setIndex}
            setIndex={setIndex}
            targetReps={targetReps}
            targetWeightKg={targetWeightKg}
            unit={unit}
            workoutExerciseId={workoutExerciseId}
            existingSet={existingSet}
            previousSet={previousSet}
          />
        );
      })}
    </div>
  );
}