import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Weight, AlertCircle } from 'lucide-react';
import { BodyweightPromptDialog, BodyweightQuickAdd } from '@/components/workout/BodyweightPromptDialog';
import { 
  BaseSetFormProps, 
  AssistanceSelector,
  useBaseFormState,
  toast 
} from './BaseSetForm';
import { useUnifiedSetLogging } from '@/hooks/useUnifiedSetLogging';
import { useBodyweight } from '@/hooks/useBodyweight';
import RestTimerBadge from '../RestTimerBadge';
import GripSelector from '../GripSelector';
import SetProgressDisplay from '../SetProgressDisplay';
import FeelSelector from '../FeelSelector';
import WorkoutDebugFooter from '../WorkoutDebugFooter';

interface BodyweightSetFormProps extends BaseSetFormProps {}

const BodyweightSetForm: React.FC<BodyweightSetFormProps> = ({
  workoutExerciseId,
  exercise,
  setIndex,
  onLogged,
  onCancel,
  className
}) => {
  const { logSet, isLoading } = useUnifiedSetLogging();
  const { fetchBodyweight, recordBodyweight } = useBodyweight();
  const [baseState, setBaseState] = useBaseFormState();
  const [currentBodyweight, setCurrentBodyweight] = useState<number | null>(null);
  const [showBodyweightDialog, setShowBodyweightDialog] = useState(false);
  
  // State for assist mode (bodyweight_plus_optional only)
  const [assistMode, setAssistMode] = useState<'added' | 'assist'>('added');
  const [inputMagnitude, setInputMagnitude] = useState<number | ''>('');
  const [selectedGrip, setSelectedGrip] = useState<string | null>(null);
  const [selectedFeel, setSelectedFeel] = useState<string | null>(null);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [previousSet] = useState<any>(null);
  const [targetSet] = useState<any>(null);
  
  // Bodyweight-specific fields
  const [reps, setReps] = useState<number | ''>('');
  
  const { rpe, notes, restSeconds, assistType, loadMeta } = baseState;
  const loadMode = exercise.load_mode;

  // Fetch current bodyweight and initialize mode on component mount
  React.useEffect(() => {
    const loadBodyweight = async () => {
      const weight = await fetchBodyweight();
      setCurrentBodyweight(weight);
    };
    loadBodyweight();

    // Initialize assist mode based on exercise type or previous sets
    // TODO: Could check previous set's weight sign to infer mode
    const initialMode = 'added'; // Default to added mode
    setAssistMode(initialMode);
  }, [fetchBodyweight]);

  const handleAssistTypeChange = (type: 'band' | 'machine' | null) => {
    setBaseState(prev => ({
      ...prev,
      assistType: type,
      loadMeta: { ...prev.loadMeta, assist_type: type }
    }));
  };

  // Quick weight adjustment - only for bodyweight_plus_optional
  const quickWeights = [0, 5, 10, 15, 20, 25];

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

    // Check if bodyweight is needed but missing
    if (!currentBodyweight) {
      setShowBodyweightDialog(true);
      return;
    }

    // Validation for assist mode
    if (loadMode === 'bodyweight_plus_optional' && assistMode === 'assist' && inputMagnitude !== '' && Number(inputMagnitude) < 0) {
      toast({
        title: "Invalid Weight", 
        description: "In assist mode, enter positive values for assistance amount.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get user's bodyweight for bodyweight exercises (already fetched)
      const userBodyweight = currentBodyweight;
      
      const metrics: any = {
        notes: notes || undefined,
        rpe: rpe ? Number(rpe) : undefined,
        effort: 'reps',
        load_mode: loadMode,
        reps: Number(reps),
        feel: selectedFeel || undefined,
        rest_seconds: restSeconds ? Number(restSeconds) : 120,
        grip_key: selectedGrip || null,
        set_kind: 'working',
        settings: {
          assist_mode: assistMode,
          version: 'v0.5.4'
        }
      };

      // Handle weight based on assist/added mode for bodyweight_plus_optional
      if (loadMode === 'bodyweight_plus_optional' && inputMagnitude !== '') {
        let finalWeight = Number(inputMagnitude);
        
        // For assist mode, make weight negative
        if (assistMode === 'assist' && finalWeight > 0) {
          finalWeight = -finalWeight;
        }
        
        metrics.weight = finalWeight;
        metrics.weight_unit = 'kg';
      }

      // Add load metadata for bodyweight_plus_optional exercises
      if (loadMode === 'bodyweight_plus_optional' || Object.keys(loadMeta).length > 0) {
        metrics.load_meta = {
          ...(loadMeta || {}),
          assist_mode: assistMode,
          logged_bodyweight_kg: userBodyweight
        };
      }

      await logSet({
        workoutExerciseId,
        setIndex,
        metrics,
        userBodyweight: userBodyweight || undefined,
        gripIds: selectedGrip ? [selectedGrip] : undefined
      });
      
      const weightDisplay = getWeightDisplay(inputMagnitude, assistMode, assistType);
      toast({
        title: "Set Logged Successfully",
        description: `Set ${setIndex + 1}: ${weightDisplay} × ${reps} reps`,
      });

      // Start rest timer
      setRestTimerActive(true);

      // Reset form
      setReps('');
      setInputMagnitude('');
      setSelectedFeel(null);
      setBaseState(prev => ({ ...prev, rpe: '', notes: '', assistType: null, loadMeta: {} }));
      
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

  const getWeightDisplay = (weight: number | '', assistMode: 'added' | 'assist', assistType: 'band' | 'machine' | null): string => {
    if (weight === '' || weight === 0) {
      return 'Bodyweight';
    }
    
    if (assistMode === 'assist') {
      const assistText = assistType ? ` (${assistType})` : '';
      return `BW - ${Math.abs(Number(weight))}kg${assistText}`;
    }
    
    return `BW + ${weight}kg`;
  };

  const handleBodyweightRecorded = (weight: number) => {
    setCurrentBodyweight(weight);
    setShowBodyweightDialog(false);
    // Automatically submit the form after recording bodyweight
    setTimeout(() => {
      handleSubmit(new Event('submit') as any);
    }, 100);
  };

  // Debug info removed - handled by session level WorkoutDebugFooter

  return (
    <>
      <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
        {/* Rest Timer */}
        {setIndex > 0 && (
          <RestTimerBadge
            initialSeconds={Number(restSeconds) || 120}
            isActive={restTimerActive}
            onComplete={() => setRestTimerActive(false)}
          />
        )}

        {/* Previous/Target Set Display */}
        <SetProgressDisplay
          previousSet={previousSet}
          targetSet={targetSet}
          currentSet={{ weight: Number(inputMagnitude) || 0, reps: Number(reps) || 0 }}
        />

        {/* Grips Selector */}
        <GripSelector
          selectedGrip={selectedGrip}
          onGripChange={setSelectedGrip}
          exerciseId={exercise.id}
          allowsGrips={true}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Weight Input - LEFT SIDE */}
          {(loadMode === 'bodyweight_plus_optional' || loadMode === 'external_assist') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="weight">
                  Added / Assist (kg)
                  <span className="text-xs text-muted-foreground ml-1">
                    ({assistMode === 'assist' ? 'assistance' : 'additional weight'})
                  </span>
                </Label>
                {/* Only show toggle for bodyweight_plus_optional */}
                {loadMode === 'bodyweight_plus_optional' && (
                  <div className="flex bg-muted rounded-md p-1">
                    <Button
                      type="button"
                      variant={assistMode === 'added' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAssistMode('added')}
                      className="text-xs px-2 h-6"
                    >
                      Added
                    </Button>
                    <Button
                      type="button"
                      variant={assistMode === 'assist' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setAssistMode('assist')}
                      className="text-xs px-2 h-6"
                    >
                      Assist
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMagnitude(prev => Math.max(0, Number(prev || 0) - 2.5))}
                  className="px-2 h-9"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <Input
                  id="weight"
                  type="number"
                  value={inputMagnitude}
                  onChange={(e) => setInputMagnitude(e.target.value === '' ? '' : Number(e.target.value))}
                  step={2.5}
                  min={0}
                  placeholder="0"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setInputMagnitude(prev => Number(prev || 0) + 2.5)}
                  className="px-2 h-9"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Reps Input - RIGHT SIDE */}
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

        {/* Bodyweight Exercise Indicator */}
        {(loadMode === 'bodyweight_plus_optional' || loadMode === 'external_assist') && (
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Weight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Bodyweight Exercise
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              You can {assistMode === 'assist' ? 'use assistance to make the exercise easier' : 'add extra weight to increase difficulty'} or perform bodyweight only
            </p>
          </div>
        )}

        {/* Quick Weight Buttons - context dependent */}
        {loadMode === 'bodyweight_plus_optional' && (
          <div className="space-y-2">
            <Label className="text-sm">Quick Weights</Label>
            <div className="flex gap-2 flex-wrap">
              {quickWeights.map((weight) => (
                <Button
                  key={weight}
                  type="button"
                  variant={inputMagnitude === weight ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInputMagnitude(weight)}
                  className="text-xs px-3"
                >
                  {weight === 0 ? 'BW' : (assistMode === 'assist' ? `${weight}kg` : `+${weight}kg`)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Feel Selector */}
        <FeelSelector
          selectedFeel={selectedFeel}
          onFeelChange={setSelectedFeel}
        />

        {/* Assistance Type Selector - only show in assist mode */}
        {assistMode === 'assist' && (
          <AssistanceSelector 
            assistType={assistType}
            onAssistTypeChange={handleAssistTypeChange}
          />
        )}

        {/* Bodyweight Status */}
        <div className="text-sm bg-muted p-3 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Current Weight: {currentBodyweight ? `${currentBodyweight}kg` : 'Not set'}</div>
              {!currentBodyweight && (
                <div className="text-xs text-orange-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  Bodyweight needed for accurate load calculation
                </div>
              )}
            </div>
            <BodyweightQuickAdd 
              onWeightRecorded={setCurrentBodyweight}
              currentWeight={currentBodyweight}
            />
          </div>
        </div>

        {/* Total Load Display */}
        <div className="text-sm bg-muted p-3 rounded-md">
          <div className="font-medium">Total Load: {getWeightDisplay(inputMagnitude, assistMode, assistType)}</div>
          {assistMode === 'added' && inputMagnitude !== '' && Number(inputMagnitude) > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Bodyweight + {inputMagnitude}kg additional
            </div>
          )}
          {assistMode === 'assist' && inputMagnitude !== '' && Number(inputMagnitude) > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              Bodyweight with {inputMagnitude}kg assistance
            </div>
          )}
        </div>

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

      {/* Bodyweight Prompt Dialog */}
      <BodyweightPromptDialog
        isOpen={showBodyweightDialog}
        onClose={() => setShowBodyweightDialog(false)}
        onWeightRecorded={handleBodyweightRecorded}
        currentWeight={currentBodyweight}
      />

      {/* Debug Footer removed - handled by session level */}
    </>
  );
};

export default BodyweightSetForm;