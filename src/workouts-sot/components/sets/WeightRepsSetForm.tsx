import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dumbbell } from 'lucide-react';
import { 
  BaseSetFormProps, 
  useBaseFormState
} from './BaseSetForm';
import { useToast } from '@/hooks/use-toast';
import { useWorkoutSetGrips } from '@/hooks/useWorkoutSetGrips';
import { buildSupabaseErrorMessage } from '@/workouts-sot/utils/supabaseError';

interface WeightRepsSetFormProps extends BaseSetFormProps {
  targetWeight?: number;
  targetReps?: number;
}

const WeightRepsSetForm: React.FC<WeightRepsSetFormProps> = ({
  workoutExerciseId,
  exercise,
  setIndex,
  onLogged,
  onCancel,
  className,
  targetWeight,
  targetReps
}) => {
  const [baseState, setBaseState] = useBaseFormState();
  const { toast } = useToast();
  const { saveSetWithGrips, isLoading } = useWorkoutSetGrips();
  
  // Weight & reps specific fields - initialize with target values if available
  const [reps, setReps] = useState<number | ''>(targetReps || '');
  const [weight, setWeight] = useState<number | ''>(targetWeight || '');

  // Update form when target values change
  React.useEffect(() => {
    if (targetWeight !== undefined) setWeight(targetWeight);
    if (targetReps !== undefined) setReps(targetReps);
  }, [targetWeight, targetReps]);
  
  const { rpe, notes, restSeconds } = baseState;
  const loadMode = exercise.load_mode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reps) {
      toast({
        title: "Reps Required",
        description: "Please enter the number of reps for this set.",
        variant: "destructive"
      });
      return;
    }

    if (loadMode === 'external_added' && weight !== '' && Number(weight) < 0) {
      toast({
        title: "Invalid Weight",
        description: "External added load cannot be negative.",
        variant: "destructive"
      });
      return;
    }

    const setData = {
      workout_exercise_id: workoutExerciseId,
      weight: weight ? Number(weight) : undefined,
      weight_unit: weight ? 'kg' : undefined,
      reps: Number(reps),
      rpe: rpe ? Number(rpe) : undefined,
      notes: notes || undefined,
      is_completed: true
    };

    console.log('🔥 WeightRepsSetForm v112.13: DETAILED LOGGING START');
    console.log('🔥 Load Mode:', loadMode);
    console.log('🔥 Weight Input:', weight);
    console.log('🔥 Reps Input:', reps);
    console.log('🔥 Final setData payload being sent to saveSetWithGrips:', JSON.stringify(setData, null, 2));
    console.log('🔥 workoutExerciseId:', workoutExerciseId);

    try {
      const result = await saveSetWithGrips(setData);
      console.log('🔥 saveSetWithGrips SUCCESS result:', result);
      
      const weightDisplay = weight !== '' && weight !== 0 ? `${weight}kg` : 'No weight';
      toast({
        title: "Set Logged Successfully",
        description: `${weightDisplay} × ${reps} reps`,
      });

      // Reset form
      setReps('');
      setWeight('');
      setBaseState(prev => ({ ...prev, rpe: '', notes: '' }));
      
      console.log('🔥 Calling onLogged callback');
      onLogged?.();

    } catch (error) {
      console.error('❌ WeightRepsSetForm v112.13: CRITICAL ERROR in saveSetWithGrips:', error);
      
      // ❌ show the exact DB error
      const msg = buildSupabaseErrorMessage(error, 'FormSubmit');
      toast({
        title: "SET SAVE FAILED",
        description: msg,
        variant: "destructive"
      });

      if ((error as any)?.raw) {
        // raw PostgREST / SQL object for operators
        // eslint-disable-next-line no-console
        console.error('🔴 raw DB error:', (error as any).raw);
      }
    }
  };

  const getEquipmentBadge = () => {
    const equipmentSlug = exercise.equipment?.slug;
    if (equipmentSlug?.includes('barbell')) return 'Barbell';
    if (equipmentSlug?.includes('dumbbell')) return 'Dumbbell';
    if (equipmentSlug?.includes('machine')) return 'Machine';
    if (equipmentSlug?.includes('cable')) return 'Cable';
    return 'Weight Training';
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>

      <div className="grid grid-cols-2 gap-4">
        {/* Weight Input */}
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
            min={0}
            step={2.5}
            placeholder="0"
          />
        </div>

        {/* Reps Input */}
        <div className="space-y-2">
          <Label htmlFor="reps">Reps *</Label>
          <Input
            id="reps"
            type="number"
            value={reps}
            onChange={(e) => setReps(e.target.value === '' ? '' : Number(e.target.value))}
            min={0}
            step={1}
            placeholder="8"
            required
          />
        </div>
      </div>

      {/* Load Summary */}
      {weight !== '' && weight !== 0 && (
        <div className="text-sm bg-muted p-3 rounded-md">
          <div className="font-medium">Load: {weight}kg × {reps || '0'} reps</div>
          <div className="text-xs text-muted-foreground mt-1">
            Total Volume: {weight && reps ? (Number(weight) * Number(reps)).toFixed(1) : '0'}kg
          </div>
        </div>
      )}


      {/* Action Buttons */}
      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isLoading || !reps} 
          className="flex-1"
        >
          {isLoading ? 'Logging...' : `Log Set ${setIndex + 1}`}
        </Button>
      </div>
    </form>
  );
};

export default WeightRepsSetForm;