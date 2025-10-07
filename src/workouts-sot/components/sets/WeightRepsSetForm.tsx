import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Dumbbell, Settings, Minus, Plus } from 'lucide-react';
import { 
  BaseSetFormProps, 
  useBaseFormState
} from './BaseSetForm';
import { useToast } from '@/hooks/use-toast';
import { useWorkoutSetGrips } from '@/hooks/useWorkoutSetGrips';
import { buildSupabaseErrorMessage } from '@/workouts-sot/utils/supabaseError';
import { getDualLoadMode, setDualLoadMode } from '@/lib/workouts/dualLoadMode';
import { getLoadType } from '@/lib/workouts/equipmentContext';

interface WeightRepsSetFormProps extends BaseSetFormProps {
  targetWeight?: number;
  targetReps?: number;
  feel?: string;
  isUnilateral?: boolean;
  unilateralEnabled?: boolean;
  onSettingsClick?: () => void;
}

const WeightRepsSetForm: React.FC<WeightRepsSetFormProps> = ({
  workoutExerciseId,
  exercise,
  setIndex,
  onLogged,
  onCancel,
  className,
  targetWeight,
  targetReps,
  feel,
  isUnilateral = false,
  unilateralEnabled = false,
  onSettingsClick
}) => {
  const [baseState, setBaseState] = useBaseFormState();
  const { toast } = useToast();
  const { saveSetWithGrips, isLoading } = useWorkoutSetGrips();
  
  // Detect dual-load exercises
  const loadType = getLoadType(exercise);
  const isDualLoad = loadType === 'dual_load';
  
  // Dual-load entry mode - load from localStorage
  const exerciseId = exercise?.id;
  const [entryMode, setEntryMode] = useState<'per_side' | 'total'>(() => {
    if (isDualLoad && exerciseId) {
      return getDualLoadMode(exerciseId);
    }
    return 'per_side';
  });
  
  // Weight & reps specific fields - initialize with target values if available
  const [reps, setReps] = useState<number | ''>(targetReps || '');
  const [weight, setWeight] = useState<number | ''>(targetWeight || '');
  const [side, setSide] = useState<'left' | 'right' | 'both'>('both');
  
  // Estimated bar weight for dual-load calculations
  const barWeight = 20; // Default Olympic bar weight in kg

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

    // Format notes with Feel if provided
    let finalNotes = notes || '';
    if (feel) {
      finalNotes = `Feel: ${feel}${finalNotes ? ` | ${finalNotes}` : ''}`;
    }

    const setData = {
      workout_exercise_id: workoutExerciseId,
      weight: weight ? Number(weight) : undefined,
      weight_unit: weight ? 'kg' : undefined,
      reps: Number(reps),
      side: (isUnilateral && unilateralEnabled) ? side : 'both',
      rpe: rpe ? Number(rpe) : undefined,
      notes: finalNotes || undefined,
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

      {/* Dual-Load Entry Mode Toggle */}
      {isDualLoad && (
        <div className="space-y-2">
          <Label>Entry Mode</Label>
          <ToggleGroup 
            type="single" 
            value={entryMode}
            onValueChange={(val) => {
              if (val) {
                const newMode = val as 'per_side' | 'total';
                setEntryMode(newMode);
                // Save to localStorage
                if (exerciseId) {
                  setDualLoadMode(exerciseId, newMode);
                }
              }
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="per_side" className="flex-1">
              Per Side
            </ToggleGroupItem>
            <ToggleGroupItem value="total" className="flex-1">
              Total
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Weight Input with +/- buttons */}
        <div className="space-y-2">
          <Label htmlFor="weight">
            {isDualLoad && entryMode === 'per_side' ? 'Weight Per Side (kg)' : 'Weight (kg)'}
          </Label>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => setWeight(prev => Math.max(0, (prev || 0) - 2.5))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              step={2.5}
              placeholder="0"
              className="text-center h-10"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => setWeight(prev => (prev || 0) + 2.5)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {/* Show total weight calculation for dual-load per-side entry */}
          {isDualLoad && entryMode === 'per_side' && weight !== '' && weight !== 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Total: {((Number(weight) * 2) + barWeight).toFixed(1)} kg
              <span className="ml-1">({Number(weight)} kg × 2 + {barWeight} kg bar)</span>
            </div>
          )}
        </div>

        {/* Reps Input with +/- buttons */}
        <div className="space-y-2">
          <Label htmlFor="reps">Reps *</Label>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => setReps(prev => Math.max(0, (prev || 0) - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              id="reps"
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value === '' ? '' : Number(e.target.value))}
              min={0}
              step={1}
              placeholder="8"
              required
              className="text-center h-10"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => setReps(prev => (prev || 0) + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Unilateral Training Indicator */}
      {isUnilateral && unilateralEnabled && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground flex-1">
            Unilateral enabled
          </p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onSettingsClick}
            className="h-7 w-7"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Load Summary */}
      {weight !== '' && weight !== 0 && (
        <div className="text-sm bg-muted p-3 rounded-md">
          <div className="font-medium">
            Load: {isDualLoad && entryMode === 'per_side' ? ((Number(weight) * 2) + barWeight).toFixed(1) : weight}kg × {reps || '0'} reps
            {isUnilateral && unilateralEnabled && side !== 'both' && <Badge variant="outline" className="ml-2">{side}</Badge>}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Total Volume: {weight && reps ? (
              isDualLoad && entryMode === 'per_side' 
                ? (((Number(weight) * 2) + barWeight) * Number(reps)).toFixed(1)
                : (Number(weight) * Number(reps)).toFixed(1)
            ) : '0'}kg
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