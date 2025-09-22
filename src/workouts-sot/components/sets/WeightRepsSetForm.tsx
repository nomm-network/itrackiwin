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
import { supabase } from '@/integrations/supabase/client';

interface WeightRepsSetFormProps extends BaseSetFormProps {}

const WeightRepsSetForm: React.FC<WeightRepsSetFormProps> = ({
  workoutExerciseId,
  exercise,
  setIndex,
  onLogged,
  onCancel,
  className
}) => {
  const [baseState, setBaseState] = useBaseFormState();
  const { toast } = useToast();
  
  // Weight & reps specific fields
  const [reps, setReps] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  
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

    try {
      setIsLoading(true);
      
      console.log('🔥 WeightRepsSetForm: Logging set with:', {
        workoutExerciseId,
        setIndex,
        weight,
        reps,
        notes,
        rpe
      });
      
      // Use simple direct supabase insert instead of complex hooks
      const { error } = await supabase
        .from('workout_sets')
        .insert({
          workout_exercise_id: workoutExerciseId,
          set_index: setIndex,
          weight_kg: weight !== '' ? Number(weight) : null,
          weight: weight !== '' ? Number(weight) : null,
          weight_unit: 'kg',
          reps: Number(reps),
          rpe: rpe ? Number(rpe) : null,
          notes: notes || null,
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging set:', error);
        toast({
          title: "Error",
          description: "Failed to log set. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      const weightDisplay = weight !== '' && weight !== 0 ? `${weight}kg` : 'No weight';
      toast({
        title: "Set Logged Successfully",
        description: `Set ${setIndex + 1}: ${weightDisplay} × ${reps} reps`,
      });

      // Reset form
      setReps('');
      setWeight('');
      setBaseState(prev => ({ ...prev, rpe: '', notes: '' }));
      
      onLogged?.();
    } catch (error) {
      console.error('Error logging set:', error);
      toast({
        title: "Error",
        description: "Failed to log set. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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