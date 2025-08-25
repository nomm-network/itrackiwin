import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronDown, ChevronUp, Plus, Minus, Hand, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Feel, FEEL_TO_RPE, FEEL_OPTIONS } from '@/features/health/fitness/lib/feelToRpe';
import { SetPrevTargetDisplay } from '@/features/health/fitness/components/SetPrevTargetDisplay';
import { useLastSet } from '@/features/health/fitness/hooks/useLastSet';
import { parseFeelFromNotes, parseFeelFromRPE, suggestTarget } from '@/features/health/fitness/lib/targetSuggestions';

interface SetData {
  weight: number;
  reps: number;
  rpe?: number;
  feel?: Feel;
  pain?: boolean;
  notes?: string;
  is_completed: boolean;
}

interface ExerciseData {
  id: string;
  workout_exercise_id: string;
  name: string;
  target_sets: number;
  completed_sets: SetData[];
}

interface ImprovedWorkoutSessionProps {
  exercise: ExerciseData;
  userId?: string | null;
  exerciseId?: string;
  templateTargetReps?: number;
  templateTargetWeight?: number;
  onSetComplete: (setData: SetData) => void;
  onExerciseComplete: () => void;
  onAddExtraSet?: () => void;
  onFinishWorkout?: () => void;
  isLastExercise?: boolean;
  unit: 'kg' | 'lb';
}

export default function ImprovedWorkoutSession({
  exercise,
  userId,
  exerciseId,
  templateTargetReps,
  templateTargetWeight,
  onSetComplete,
  onExerciseComplete,
  onAddExtraSet,
  onFinishWorkout,
  isLastExercise = false,
  unit = 'kg'
}: ImprovedWorkoutSessionProps) {
  const [expandedSet, setExpandedSet] = useState<number | null>(null);
  const [showGripsDialog, setShowGripsDialog] = useState(false);
  const [showSetsDialog, setShowSetsDialog] = useState(false);
  const [targetSets, setTargetSets] = useState(exercise.target_sets);
  const [currentSetData, setCurrentSetData] = useState<SetData>({
    weight: 0,
    reps: 0,
    rpe: undefined,
    feel: '=' as Feel,
    pain: false,
    notes: '',
    is_completed: false
  });

  const currentSetNumber = exercise.completed_sets.length + 1;
  
  // Get target suggestion data for preloading
  const { data: lastSetForTarget } = useLastSet(userId, exerciseId, currentSetNumber);
  
  // Auto-preload target values when lastSet data is available
  React.useEffect(() => {
    if (lastSetForTarget && currentSetData.weight === 0 && currentSetData.reps === 0) {
      const lastFeel = parseFeelFromNotes(lastSetForTarget.notes) || parseFeelFromRPE(lastSetForTarget.rpe);
      const target = suggestTarget({
        lastWeight: lastSetForTarget.weight,
        lastReps: lastSetForTarget.reps,
        feel: lastFeel,
        templateTargetReps,
        templateTargetWeight,
        stepKg: 2.5
      });
      
      setCurrentSetData(prev => ({
        ...prev,
        weight: target.weight,
        reps: target.reps
      }));
    }
  }, [lastSetForTarget, currentSetData.weight, currentSetData.reps]);
  const isLastSet = currentSetNumber > targetSets;
  const lastSet = exercise.completed_sets[exercise.completed_sets.length - 1];

  // Auto-fill from previous set
  const handleUsePrevious = useCallback(() => {
    if (lastSet) {
      setCurrentSetData(prev => ({
        ...prev,
        weight: lastSet.weight,
        reps: lastSet.reps
      }));
    }
  }, [lastSet]);

  // Quick weight adjustments
  const adjustWeight = useCallback((delta: number) => {
    setCurrentSetData(prev => ({
      ...prev,
      weight: Math.max(0, prev.weight + delta)
    }));
  }, []);

  // Quick rep adjustments
  const adjustReps = useCallback((delta: number) => {
    setCurrentSetData(prev => ({
      ...prev,
      reps: Math.max(0, prev.reps + delta)
    }));
  }, []);

  // Auto-advance to next set when current set is completed
  const handleSetSubmit = useCallback(() => {
    if (currentSetData.weight > 0 && currentSetData.reps > 0) {
      // Calculate RPE from Feel automatically
      const rpe = currentSetData.feel ? FEEL_TO_RPE[currentSetData.feel] : 8;
      
      const completedSet = { 
        ...currentSetData, 
        rpe, // Auto-calculated from feel
        is_completed: true 
      };
      onSetComplete(completedSet);
      
      // Reset form for next set but keep feel/pain cleared
      setCurrentSetData({
        weight: 0,
        reps: 0,
        rpe: undefined,
        feel: '=' as Feel,
        pain: false,
        notes: '',
        is_completed: false
      });
      
      // Auto-expand the just-completed set briefly
      const setIndex = exercise.completed_sets.length;
      setExpandedSet(setIndex);
      setTimeout(() => setExpandedSet(null), 2000);
    }
  }, [currentSetData, onSetComplete, exercise.completed_sets.length]);

  // Handle Enter key for quick submission
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentSetData.weight > 0 && currentSetData.reps > 0) {
      handleSetSubmit();
    }
  }, [handleSetSubmit, currentSetData]);

  const toggleSetExpansion = (setIndex: number) => {
    setExpandedSet(expandedSet === setIndex ? null : setIndex);
  };

  return (
    <div className="space-y-3">
      {/* Exercise Header with Grips and Sets Icons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">{exercise.name}</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setShowGripsDialog(true)}
          >
            <Hand className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setShowSetsDialog(true)}
          >
            <Target className="h-4 w-4" />
          </Button>
        </div>
        <Badge variant="secondary">
          {exercise.completed_sets.length}/{targetSets} sets
        </Badge>
      </div>

      {/* Completed Sets - Collapsed by default */}
      {exercise.completed_sets.map((set, index) => (
        <Card key={index} className="p-3">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSetExpansion(index)}
          >
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                {index + 1}
              </Badge>
              <span className="font-medium">
                {set.weight}{unit} × {set.reps} reps
              </span>
              {set.rpe && (
                <Badge variant="secondary" className="text-xs">
                  RPE {set.rpe}
                </Badge>
              )}
            </div>
            {expandedSet === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
          
          {expandedSet === index && (
            <div className="mt-3 pt-3 border-t space-y-2 text-sm text-muted-foreground">
              {set.rpe && <div>RPE: {set.rpe}</div>}
              {set.feel && <div>Feel: {set.feel}</div>}
              {set.notes && <div>Notes: {set.notes}</div>}
              {set.notes?.includes('warmup feedback:') && (
                <div className="text-green-600">
                  Warmup feedback: excellent
                </div>
              )}
            </div>
          )}
        </Card>
      ))}

      {/* Current Set Entry */}
      {!isLastSet && (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="w-8 h-8 rounded-full flex items-center justify-center">
                {currentSetNumber}
              </Badge>
              <span className="font-medium">Current Set</span>
            </div>

            {/* Previous Set and Target Display */}
            <SetPrevTargetDisplay
              userId={userId}
              exerciseId={exerciseId}
              setIndex={currentSetNumber}
              templateTargetReps={templateTargetReps}
              templateTargetWeight={templateTargetWeight}
              onUsePrevious={(weight, reps) => {
                setCurrentSetData(prev => ({ ...prev, weight, reps }));
              }}
            />

            {/* Weight Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Weight ({unit})</label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustWeight(-2.5)}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={currentSetData.weight || ''}
                  onChange={(e) => setCurrentSetData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  onKeyPress={handleKeyPress}
                  className="text-center text-lg font-semibold"
                  placeholder="0"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustWeight(2.5)}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Reps Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Reps</label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustReps(-1)}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={currentSetData.reps || ''}
                  onChange={(e) => setCurrentSetData(prev => ({ ...prev, reps: Number(e.target.value) }))}
                  onKeyPress={handleKeyPress}
                  className="text-center text-lg font-semibold"
                  placeholder="0"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => adjustReps(1)}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Feel Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">How did that feel?</label>
              <div className="grid grid-cols-5 gap-2">
                {FEEL_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={currentSetData.feel === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSetData(prev => ({ ...prev, feel: option.value }))}
                    className={`
                      flex flex-col items-center p-2 h-auto aspect-square
                      ${currentSetData.feel === option.value ? option.color + ' text-white' : ''}
                    `}
                  >
                    <span className="text-lg">{option.emoji}</span>
                    <span className="text-xs mt-1">{option.value}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Pain Toggle */}
            <Button
              variant={currentSetData.pain ? "destructive" : "outline"}
              onClick={() => setCurrentSetData(prev => ({ ...prev, pain: !prev.pain }))}
              className="w-full"
              size="sm"
            >
              {currentSetData.pain ? '⚠️ Pain reported' : 'No pain'}
            </Button>

            {/* Submit Button */}
            <Button 
              onClick={handleSetSubmit}
              disabled={!currentSetData.weight || !currentSetData.reps}
              className="w-full"
              size="lg"
            >
              Log Set {currentSetNumber}
            </Button>
          </div>
        </Card>
      )}

      {/* Exercise Complete Message */}
      {isLastSet && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-2xl">🎉</div>
            {isLastExercise ? (
              <>
                <div className="text-lg font-semibold text-green-700">
                  Congrats. You finished last exercise!
                </div>
                <div className="text-sm text-green-600">
                  {exercise.completed_sets.length} sets completed
                </div>
                <div className="space-y-2">
                  {onFinishWorkout && (
                    <Button onClick={onFinishWorkout} className="w-full" size="lg">
                      Finish Workout
                    </Button>
                  )}
                  {onAddExtraSet && (
                    <Button 
                      onClick={onAddExtraSet} 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Extra Set
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold text-green-700">
                  Exercise Complete!
                </div>
                <div className="text-sm text-green-600">
                  {exercise.completed_sets.length} sets completed
                </div>
                <div className="space-y-2">
                  <Button onClick={onExerciseComplete} className="w-full" size="lg">
                    Next Exercise
                  </Button>
                  {onAddExtraSet && (
                    <Button 
                      onClick={onAddExtraSet} 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Extra Set
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Grips Selection Dialog */}
      <Dialog open={showGripsDialog} onOpenChange={setShowGripsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Grips</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground">
              Choose the grips you want to use for this exercise:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {/* Sample grips - you can make this dynamic */}
              {['Overhand', 'Underhand', 'Neutral', 'Wide', 'Close', 'Mixed'].map((grip) => (
                <Button key={grip} variant="outline" size="sm">
                  {grip}
                </Button>
              ))}
            </div>
            <Button onClick={() => setShowGripsDialog(false)} className="w-full">
              Save Grips
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sets Configuration Dialog */}
      <Dialog open={showSetsDialog} onOpenChange={setShowSetsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Sets</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <p className="text-sm text-muted-foreground">
              Adjust the target number of sets for this exercise:
            </p>
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Target sets:</label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setTargetSets(Math.max(1, targetSets - 1))}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={targetSets}
                  onChange={(e) => setTargetSets(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center w-16"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setTargetSets(Math.min(10, targetSets + 1))}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button onClick={() => setShowSetsDialog(false)} className="w-full">
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}