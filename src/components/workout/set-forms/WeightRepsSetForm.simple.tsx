// Simple WeightRepsSetForm for debugging - no external dependencies
import React, { useState } from 'react';
import { useUnifiedSetLogging } from '@/hooks/useUnifiedSetLogging';

interface WeightRepsSetFormProps {
  workoutExerciseId: string;
  exercise: any;
  setIndex: number;
  onLogged?: () => void;
  onCancel?: () => void;
  className?: string;
}

const WeightRepsSetForm: React.FC<WeightRepsSetFormProps> = ({
  workoutExerciseId,
  exercise,
  setIndex,
  onLogged,
  onCancel,
  className
}) => {
  const { logSet, isLoading } = useUnifiedSetLogging();
  const [reps, setReps] = useState<number>(8);
  const [weight, setWeight] = useState<number>(0);

  console.log('🔍 WeightRepsSetForm rendered with:', {
    workoutExerciseId,
    exerciseName: exercise?.exercise?.display_name || exercise?.display_name,
    setIndex
  });

  const handleSubmit = async () => {
    try {
      await logSet({
        workoutExerciseId,
        setIndex,
        metrics: {
          reps,
          weight: weight || undefined,
          weight_unit: 'kg',
          effort: 'reps',
          settings: {},
          load_meta: { source: 'weight-reps-form-v1' },
        }
      });
      
      console.log('✅ WeightRepsSetForm: Set logged successfully');
      onLogged?.();
    } catch (error) {
      console.error('❌ WeightRepsSetForm: Error logging set:', error);
    }
  };

  return (
    <div className={`space-y-4 ${className}`} data-form-type="weight-reps">
      <div className="text-xs bg-blue-900/20 border border-blue-500 rounded p-2">
        <strong>WeightRepsSetForm</strong> (fallback/default)
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-muted-foreground mb-1">Weight (kg)</div>
          <input
            type="number"
            className="h-10 w-full rounded-md border bg-background px-3"
            value={weight}
            onChange={e => setWeight(Number(e.target.value || 0))}
            step={2.5}
            min={0}
          />
        </div>
        
        <div>
          <div className="text-sm text-muted-foreground mb-1">Reps</div>
          <input
            type="number"
            className="h-10 w-full rounded-md border bg-background px-3"
            value={reps}
            onChange={e => setReps(Number(e.target.value || 0))}
            min={0}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading || !reps}
        className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-50"
      >
        {isLoading ? 'Logging...' : `Log Set ${setIndex}`}
      </button>
    </div>
  );
};

export default WeightRepsSetForm;