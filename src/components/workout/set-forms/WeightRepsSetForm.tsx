import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Plus, Minus } from 'lucide-react';
import { 
  BaseSetFormProps, 
  useBaseFormState,
  useUnifiedSetLogging,
  toast 
} from './BaseSetForm';
import RestTimerBadge from '../RestTimerBadge';
import PerSideToggle from '../PerSideToggle';
import QuickWeightChips from '../QuickWeightChips';
import SetProgressDisplay from '../SetProgressDisplay';
import FeelSelector from '../FeelSelector';
// Removed WorkoutDebugFooter import - debug handled by session level
// Removed individual form components - session handles title/menus now
// import ExerciseTitleRow from '../ExerciseTitleRow';

interface WeightRepsSetFormProps extends BaseSetFormProps {}

const WeightRepsSetForm: React.FC<WeightRepsSetFormProps> = ({
  workoutExerciseId,
  exercise,
  setIndex,
  onLogged,
  onCancel,
  className
}) => {
  const { logSet, isLoading } = useUnifiedSetLogging();
  const [baseState, setBaseState] = useBaseFormState();
  
  // Enhanced state for all the restored features
  const [reps, setReps] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [selectedGrip, setSelectedGrip] = useState<string | null>(null);
  const [entryMode, setEntryMode] = useState<'per_side' | 'total'>('total');
  const [selectedFeel, setSelectedFeel] = useState<string | null>(null);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [previousSet] = useState<any>(null);
  const [targetSet] = useState<any>(null);
  
  // Menu states removed - handled by session level
  
  // Settings states
  const [autoRestTimer, setAutoRestTimer] = useState(true);
  const [showTargets, setShowTargets] = useState(true);
  const [enableQuickAdd, setEnableQuickAdd] = useState(true);
  
  const { rpe, notes, restSeconds } = baseState;
  const loadMode = exercise.load_mode;
  const equipmentType = exercise.equipment?.slug || '';

  // Initialize entry mode based on equipment
  useEffect(() => {
    const defaultMode = equipmentType.includes('dumbbell') || equipmentType.includes('cable') 
      ? 'per_side' : 'total';
    setEntryMode(defaultMode);
  }, [equipmentType]);

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
      const finalWeight = entryMode === 'per_side' && weight !== '' && weight !== 0 
        ? Number(weight) * 2 : Number(weight) || 0;

      const metrics: any = {
        notes: notes || undefined,
        rpe: rpe ? Number(rpe) : undefined,
        effort: 'reps',
        load_mode: loadMode,
        reps: Number(reps),
        feel: selectedFeel || undefined,
        rest_seconds: restSeconds ? Number(restSeconds) : 120,
        grip_key: selectedGrip || null,
        settings: {
          entry_mode: entryMode,
          version: 'v0.5.4'
        },
        load_meta: {
          entry_mode: entryMode,
          weight_per_side: entryMode === 'per_side' ? Number(weight) || 0 : undefined,
          total_weight: finalWeight
        }
      };

      // Add weight if specified
      if (weight !== '') {
        metrics.weight = finalWeight;
        metrics.weight_unit = 'kg';
        if (entryMode === 'per_side') {
          metrics.weight_per_side = Number(weight);
        }
      }

      await logSet({
        workoutExerciseId,
        setIndex,
        metrics,
        gripIds: selectedGrip ? [selectedGrip] : undefined
      });
      
      const weightDisplay = weight !== '' && weight !== 0 ? `${weight}kg` : 'No weight';
      toast({
        title: "Set Logged Successfully",
        description: `Set ${setIndex + 1}: ${weightDisplay} × ${reps} reps`,
      });

      // Start rest timer
      setRestTimerActive(true);

      // Reset form
      setReps('');
      setWeight('');
      setSelectedFeel(null);
      setBaseState(prev => ({ ...prev, rpe: '', notes: '' }));
      
      onLogged();
    } catch (error) {
      console.error('Error logging set:', error);
      toast({
        title: "Error",
        description: "Failed to log set. Please try again.",
        variant: "destructive"
      });
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

  const handleWarmupStepComplete = async (step: any, stepIndex: number) => {
    try {
      await logSet({
        workoutExerciseId,
        setIndex: stepIndex,
        metrics: {
          effort: 'reps' as const,
          reps: step.reps,
          weight: step.weight
        }
      });
      toast({
        title: "Warmup Step Logged",
        description: `${step.weight}kg × ${step.reps} reps`,
      });
    } catch (error) {
      console.error('Error logging warmup step:', error);
    }
  };

  const debugInfo = {
    version: 'workout-flow-v0.5.4',
    router: 'SmartSetForm',
    logger: 'useUnifiedSetLogging',
    restTimer: true,
    grips: true,
    gripKey: selectedGrip,
    warmup: true,
    warmupSteps: 3,
    entryMode,
    payloadPreview: {
      effort: 'reps',
      reps: Number(reps) || 0,
      weight_kg: entryMode === 'per_side' && weight ? Number(weight) * 2 : Number(weight) || 0,
      weight_per_side: entryMode === 'per_side' ? Number(weight) || 0 : undefined,
      set_kind: 'working',
      rest_seconds: Number(restSeconds) || 120,
      grip_key: selectedGrip,
      settings: { entry_mode: entryMode, version: 'v0.5.4' },
      load_meta: { entry_mode: entryMode }
    }
  };

  return (
    <>
      {/* Exercise Title and Menus handled by session level - removed duplicate */}

      <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
        {/* Rest Timer */}
        {setIndex > 0 && autoRestTimer && (
          <RestTimerBadge
            initialSeconds={Number(restSeconds) || 120}
            isActive={restTimerActive}
            onComplete={() => setRestTimerActive(false)}
          />
        )}

        {/* Previous/Target Set Display */}
        {showTargets && (
          <SetProgressDisplay
            previousSet={previousSet}
            targetSet={targetSet}
            currentSet={{ weight: Number(weight) || 0, reps: Number(reps) || 0 }}
          />
        )}

        {/* Per-side/Total Toggle */}
        <PerSideToggle
          mode={entryMode}
          onModeChange={setEntryMode}
          equipmentType={equipmentType}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Weight Input */}
          <div className="space-y-2">
            <Label htmlFor="weight">
              Weight ({entryMode === 'per_side' ? 'per side' : 'total'} kg)
            </Label>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWeight(prev => Math.max(0, Number(prev || 0) - 2.5))}
                className="px-2 h-9"
              >
                <Minus className="w-3 h-3" />
              </Button>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                step={2.5}
                placeholder="0"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWeight(prev => Number(prev || 0) + 2.5)}
                className="px-2 h-9"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Reps Input */}
          <div className="space-y-2">
            <Label htmlFor="reps">Reps *</Label>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReps(prev => Math.max(0, Number(prev || 0) - 1))}
                className="px-2 h-9"
              >
                <Minus className="w-3 h-3" />
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
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReps(prev => Number(prev || 0) + 1)}
                className="px-2 h-9"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Weight Chips */}
        {enableQuickAdd && (
          <QuickWeightChips
            currentWeight={weight}
            onWeightChange={setWeight}
            mode="loaded"
            equipmentIncrement={2.5}
          />
        )}

        {/* Feel Selector */}
        <FeelSelector
          selectedFeel={selectedFeel}
          onFeelChange={setSelectedFeel}
        />

        {/* Load Summary */}
        {weight !== '' && weight !== 0 && (
          <div className="text-sm bg-muted p-3 rounded-md">
            <div className="font-medium">
              Load: {entryMode === 'per_side' ? `${weight}kg per side (${Number(weight) * 2}kg total)` : `${weight}kg`} × {reps || '0'} reps
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Volume: {weight && reps ? (
                entryMode === 'per_side' 
                  ? (Number(weight) * 2 * Number(reps)).toFixed(1)
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

      {/* Debug Footer removed - handled by session level */}
    </>
  );
};

export default WeightRepsSetForm;