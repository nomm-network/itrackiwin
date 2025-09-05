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
  const [weight, setWeight] = useState<number | string>(existingSet?.weight_kg || targetWeightKg || 0);
  const [reps, setReps] = useState<number | string>(existingSet?.reps || targetReps || 8);
  const [feeling, setFeeling] = useState<'terrible' | 'poor' | 'ok' | 'good' | 'excellent' | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogSet = async () => {
    // Convert to numbers and validate
    const weightNum = typeof weight === 'string' ? parseFloat(weight) : weight;
    const repsNum = typeof reps === 'string' ? parseInt(reps) : reps;
    
    if (isNaN(weightNum) || weightNum <= 0 || isNaN(repsNum) || repsNum <= 0) {
      toast({
        title: "Invalid values",
        description: "Please enter valid weight and reps values",
        variant: "destructive",
      });
      return;
    }

    setIsLogging(true);
    try {
      const { error } = await supabase.rpc('log_simple_workout_set', {
        p_workout_exercise_id: workoutExerciseId,
        p_set_index: setIndex,
        p_weight_kg: weightNum,
        p_reps: repsNum,
        p_set_kind: 'normal'
      });

      if (error) throw error;

      // Refetch workout data
      queryClient.invalidateQueries({ queryKey: ['workout'] });
      
      toast({
        title: "Set logged",
        description: `${weightNum}kg × ${repsNum} reps recorded`,
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
    <div className="p-2 border-b border-[#133a2f] last:border-b-0">
      {/* Previous/Target Banner */}
      {previousSet && (
        <div className="text-xs text-gray-400 mb-1">
          Prev {previousSet.weight_kg}×{previousSet.reps} | Target {targetWeightKg}×{targetReps}
        </div>
      )}

      <div className="flex items-center gap-1 text-sm">
        <span className="text-xs font-medium text-emerald-300 min-w-[35px]">
          Set {setIndex}
        </span>

        {/* Weight Input */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const currentWeight = typeof weight === 'string' ? parseFloat(weight) || 0 : weight;
              setWeight(Math.max(0, currentWeight - 2.5));
            }}
            className="w-6 h-6 rounded-full bg-gray-700 text-white text-xs hover:bg-gray-600 flex items-center justify-center"
            disabled={isCompleted}
          >
            -
          </button>
          <input
            type="number"
            value={weight}
            onChange={(e) => {
              const inputValue = e.target.value;
              if (inputValue === '') {
                setWeight('');
                return;
              }
              const value = parseFloat(inputValue);
              if (!isNaN(value) && value >= 0) {
                // Round to 2 decimal places
                setWeight(Math.round(value * 100) / 100);
              }
            }}
            onBlur={(e) => {
              // Ensure valid number on blur or set to 0 if empty
              const value = parseFloat(e.target.value);
              if (isNaN(value) || value < 0 || e.target.value === '') {
                setWeight(0);
              }
            }}
            step="0.01"
            min="0"
            disabled={isCompleted}
            className="w-12 h-6 bg-transparent text-white text-center text-xs border border-gray-600 rounded focus:border-emerald-500 focus:outline-none disabled:opacity-50"
          />
          <span className="text-gray-400 text-xs">{unit}</span>
          <button
            onClick={() => {
              const currentWeight = typeof weight === 'string' ? parseFloat(weight) || 0 : weight;
              setWeight(currentWeight + 2.5);
            }}
            className="w-6 h-6 rounded-full bg-gray-700 text-white text-xs hover:bg-gray-600 flex items-center justify-center"
            disabled={isCompleted}
          >
            +
          </button>
        </div>

        {/* Reps Input */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              const currentReps = typeof reps === 'string' ? parseInt(reps) || 1 : reps;
              setReps(Math.max(1, currentReps - 1));
            }}
            className="w-6 h-6 rounded-full bg-gray-700 text-white text-xs hover:bg-gray-600 flex items-center justify-center"
            disabled={isCompleted}
          >
            -
          </button>
          <input
            type="number"
            value={reps}
            onChange={(e) => {
              const inputValue = e.target.value;
              if (inputValue === '') {
                setReps('');
                return;
              }
              const value = parseInt(inputValue);
              if (!isNaN(value) && value >= 1) {
                setReps(value);
              }
            }}
            onBlur={(e) => {
              // Ensure valid number on blur or set to 1 if empty
              const value = parseInt(e.target.value);
              if (isNaN(value) || value < 1 || e.target.value === '') {
                setReps(1);
              }
            }}
            step="1"
            min="1"
            disabled={isCompleted}
            className="w-8 h-6 bg-transparent text-white text-center text-xs border border-gray-600 rounded focus:border-emerald-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={() => {
              const currentReps = typeof reps === 'string' ? parseInt(reps) || 1 : reps;
              setReps(currentReps + 1);
            }}
            className="w-6 h-6 rounded-full bg-gray-700 text-white text-xs hover:bg-gray-600 flex items-center justify-center"
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
          className="bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-50 h-6 px-2 text-xs"
        >
          {isCompleted ? 'Logged' : isLogging ? 'Logging...' : 'Log'}
        </Button>
      </div>

      {/* How did that feel? */}
      {isCompleted && (
        <div className="mt-2">
          <div className="text-xs text-gray-400 mb-1">How did that feel?</div>
          <div className="flex gap-1">
            {(['terrible', 'poor', 'ok', 'good', 'excellent'] as const).map((emotion) => (
              <button
                key={emotion}
                onClick={() => setFeeling(emotion)}
                className={`p-1 rounded border text-xs ${
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