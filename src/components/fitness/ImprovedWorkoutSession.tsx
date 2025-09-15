import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getEquipmentRefId, getLoadType } from '@/lib/workouts/equipmentContext';
import { ChevronDown, ChevronUp, Plus, Minus, Hand, Target, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Feel, FEEL_TO_RPE, FEEL_OPTIONS } from '@/features/health/fitness/lib/feelToRpe';
import { SetPrevTargetDisplay } from '@/features/health/fitness/components/SetPrevTargetDisplay';
import { useLastSet } from '@/features/health/fitness/hooks/useLastSet';
import { parseFeelFromNotes, parseFeelFromRPE, suggestTarget } from '@/features/health/fitness/lib/targetSuggestions';
import { supabase } from '@/integrations/supabase/client';
import { useWarmupFeedback, useUpdateWarmupAfterSet } from '@/features/workouts/warmup/useWarmupActions';
import { SetEditor } from '@/features/workouts/components/SetEditor';
import { noteWorkingSet } from '@/lib/training/warmupManager';
import { useGrips } from '@/hooks/useGrips';
import { useSessionTiming } from '@/stores/sessionTiming';
import { WarmupBlock } from './WarmupBlock';
import { getBarMeta } from '@/lib/equipment/barMeta';

interface SetData {
  weight: number;
  reps: number;
  feel?: Feel;
  pain?: boolean;
  notes?: string;
  is_completed: boolean;
  set_index?: number;
}

interface ExerciseData {
  id: string;
  workout_exercise_id: string;
  name: string;
  target_sets: number;
  completed_sets: SetData[];
  load_type?: string;
  equipment_ref?: string;
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
  onDeleteSet?: (setIndex: number) => void;
  onUpdateSet?: (setIndex: number, setData: SetData) => void;
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
  onDeleteSet,
  onUpdateSet,
  isLastExercise = false,
  unit = 'kg'
}: ImprovedWorkoutSessionProps) {
  const [expandedSet, setExpandedSet] = useState<number | null>(null);
  const [editingSet, setEditingSet] = useState<number | null>(null);
  const [editSetData, setEditSetData] = useState<SetData | null>(null);
  const [showGripsDialog, setShowGripsDialog] = useState(false);
  const [showSetsDialog, setShowSetsDialog] = useState(false);
  const [targetSets, setTargetSets] = useState(exercise.target_sets);
  const [showWarmupDialog, setShowWarmupDialog] = useState(true); // Show by default
  const [warmupFeedback, setWarmupFeedback] = useState<string | null>(null);
  const [currentSetData, setCurrentSetData] = useState<SetData & {
    weightKg?: number;
    perSideKg?: number;
    entryMode?: 'total' | 'per_side';
  }>({
    weight: 0,
    reps: 0,
    feel: '=' as Feel,
    pain: false,
    notes: '',
    is_completed: false,
    weightKg: undefined,
    perSideKg: undefined,
    entryMode: 'total'
  });

  const currentSetNumber = exercise.completed_sets.length + 1;
  
  // Session timing for rest tracking
  const { startRest, stopRest, restStartedAt } = useSessionTiming();
  
  // Auto-start rest timer if there are completed sets but no active timer (for refreshed pages)
  React.useEffect(() => {
    const hasCompletedSets = exercise.completed_sets.length > 0;
    const isLastSet = currentSetNumber >= exercise.target_sets;
    
    console.log('🕐 Auto-start check:', {
      hasCompletedSets,
      isLastSet,
      restStartedAt,
      currentSetNumber,
      targetSets: exercise.target_sets,
      completedSetsLength: exercise.completed_sets.length
    });
    
    if (hasCompletedSets && !isLastSet && !restStartedAt) {
      console.log('🎯 Auto-starting rest timer for continued workout');
      startRest();
    }
  }, [exercise.completed_sets.length, currentSetNumber, exercise.target_sets, restStartedAt, startRest]);
  
  // Use the new warmup hooks
  const warmupFeedbackMutation = useWarmupFeedback();
  const updateWarmupAfterSetMutation = useUpdateWarmupAfterSet();
  
  // Fetch grips data
  const { data: grips = [], isLoading: gripsLoading } = useGrips();

  // Load current grip when component mounts
  const [currentGripId, setCurrentGripId] = useState<string | null>(null);
  const [currentGripName, setCurrentGripName] = useState<string | null>(null);
  
  React.useEffect(() => {
    const loadCurrentGrip = async () => {
      if (exercise.workout_exercise_id) {
        const { data } = await supabase
          .from('workout_exercises')
          .select('grip_id')
          .eq('id', exercise.workout_exercise_id)
          .maybeSingle();
        
        if (data?.grip_id) {
          setCurrentGripId(data.grip_id);
          
          // Fetch grip name with translation
          const { data: gripData } = await supabase
            .from('grips')
            .select(`
              id, slug,
              grips_translations(name, language_code)
            `)
            .eq('id', data.grip_id)
            .eq('grips_translations.language_code', 'en')
            .maybeSingle();
          
          if (gripData?.grips_translations && Array.isArray(gripData.grips_translations) && gripData.grips_translations.length > 0) {
            setCurrentGripName((gripData.grips_translations[0] as any).name);
          } else {
            // Fallback to slug if no translation
            const { data: fallbackGrip } = await supabase
              .from('grips')
              .select('slug')
              .eq('id', data.grip_id)
              .maybeSingle();
            
            if (fallbackGrip?.slug) {
              setCurrentGripName(fallbackGrip.slug.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' '));
            }
          }
        }
      }
    };
    loadCurrentGrip();
  }, [exercise.workout_exercise_id]);

  // Check warmup feedback from database
  React.useEffect(() => {
    const checkWarmupFeedback = async () => {
      if (exercise.workout_exercise_id && currentSetNumber === 1) {
        const { data } = await supabase
          .from('workout_exercises')
          .select('warmup_plan')
          .eq('id', exercise.workout_exercise_id)
          .maybeSingle();
        
        if (data?.warmup_plan && typeof data.warmup_plan === 'object' && 'feedback' in data.warmup_plan) {
          setWarmupFeedback(data.warmup_plan.feedback as string);
        }
      }
    };
    checkWarmupFeedback();
  }, [exercise.workout_exercise_id, currentSetNumber]);
  
  // Target values are now handled by SetPrevTargetDisplay component via onApplyTarget callback

  // Debug logging
  React.useEffect(() => {
    console.log('🚀 ImprovedWorkoutSession DEBUG:', {
      userId,
      exerciseId,
      setIndex: currentSetNumber,
      templateTargetReps,
      templateTargetWeight,
      userIdType: typeof userId,
      exerciseIdType: typeof exerciseId,
      setIndexType: typeof currentSetNumber,
      setIndexValue: currentSetNumber,
      setIndexIsFinite: Number.isFinite(currentSetNumber),
      hasUserId: !!userId,
      hasExerciseId: !!exerciseId
    });
  }, [userId, exerciseId, currentSetNumber, templateTargetReps, templateTargetWeight]);
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
  const handleSetSubmit = useCallback(async () => {
    // Calculate final weight from per-side if needed
    const finalWeight = currentSetData.entryMode === 'per_side' && currentSetData.perSideKg 
      ? 20 + currentSetData.perSideKg * 2  // Default to 20kg bar weight for now
      : currentSetData.weightKg || currentSetData.weight;
      
    if (finalWeight > 0 && currentSetData.reps > 0) {
      // Stop any current rest timer since we're starting the next set
      stopRest();
      
      // Create notes with feel information
      const notesWithFeel = currentSetData.feel ? `Feel: ${currentSetData.feel}${currentSetData.notes ? ` | ${currentSetData.notes}` : ''}` : currentSetData.notes;
      
      const setData = {
        ...currentSetData,
        weight: finalWeight,
        notes: notesWithFeel || '',
        pain: currentSetData.pain || false,
        is_completed: true
      };
      onSetComplete(setData);
      
      // DO NOT track muscle usage here - this is called after each SET, not each EXERCISE
      // The warmup context should only be updated when completing an entire exercise
      
      // Update warmup plan based on current workout data after each set
      // (in case this set is heavier than previous ones)
      if (exercise.workout_exercise_id && userId) {
        console.log('🔄 Triggering warmup update after set completion');
        console.log('📊 Set data:', { weight: finalWeight, reps: currentSetData.reps, feel: currentSetData.feel });
        
        updateWarmupAfterSetMutation.mutate({
          workoutExerciseId: exercise.workout_exercise_id,
          userId: userId,
          workoutId: exercise.id,
          lastFeel: currentSetData.feel,
        });
      }
      
      // Keep weight and reps for next set progression, reset everything else
      setCurrentSetData({
        weight: finalWeight,
        weightKg: finalWeight,
        reps: currentSetData.reps,
        feel: '=' as Feel,
        pain: false,
        notes: '',
        is_completed: false,
        entryMode: 'total',
        perSideKg: undefined
      });

      // Start rest timer for next set (if not the last set)
      const isLastSet = currentSetNumber >= exercise.target_sets;
      if (!isLastSet) {
        startRest();
      }
      
      // Auto-expand the just-completed set briefly
      const setIndex = exercise.completed_sets.length;
      setExpandedSet(setIndex);
      setTimeout(() => setExpandedSet(null), 2000);
    }
  }, [currentSetData, onSetComplete, exercise.completed_sets.length, currentSetNumber, warmupFeedback, startRest, stopRest, exercise.target_sets]);

  // Handle Enter key for quick submission
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentSetData.weight > 0 && currentSetData.reps > 0) {
      handleSetSubmit();
    }
  }, [handleSetSubmit, currentSetData]);

  const toggleSetExpansion = (setIndex: number) => {
    setExpandedSet(expandedSet === setIndex ? null : setIndex);
  };

  // Helper function to get feel emoji using consistent FEEL_OPTIONS
  const getFeelEmoji = (feel?: Feel, notes?: string) => {
    const actualFeel = feel || parseFeelFromNotes(notes);
    if (!actualFeel) return '';
    const feelOption = FEEL_OPTIONS.find(opt => opt.value === actualFeel);
    return feelOption?.emoji || '';
  };

  return (
    <div className="space-y-3">
      {/* Exercise Header with Grips and Sets Icons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-foreground">
            {exercise.name}
            {exercise.completed_sets.length > 0 && currentGripName && (
              <span className="text-muted-foreground flex items-center gap-1">
                {' - '}{currentGripName} <Hand className="h-3 w-3" />
              </span>
            )}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("h-8 w-8 p-0", exercise.completed_sets.length > 0 && "opacity-50 cursor-not-allowed")}
            onClick={() => {
              if (exercise.completed_sets.length === 0) {
                setShowGripsDialog(true);
              } else {
                // Show tooltip message on click when disabled
                const tooltip = document.createElement('div');
                tooltip.textContent = 'Grips can be changed only before the first set';
                tooltip.style.cssText = 'position: fixed; z-index: 9999; background: black; color: white; padding: 8px 12px; border-radius: 6px; font-size: 12px; pointer-events: none; top: 50%; left: 50%; transform: translate(-50%, -50%);';
                document.body.appendChild(tooltip);
                setTimeout(() => document.body.removeChild(tooltip), 2000);
              }
            }}
            disabled={exercise.completed_sets.length > 0}
            title={exercise.completed_sets.length > 0 ? "Grips can be changed only before the first set" : "Change grips"}
          >
            <Hand className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setShowSetsDialog(true)}
          >
            🔢
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("h-8 w-8 p-0", showWarmupDialog && "opacity-50 cursor-not-allowed")}
            onClick={() => !showWarmupDialog && setShowWarmupDialog(true)}
            disabled={showWarmupDialog}
            title={showWarmupDialog ? "Warmup is already open" : "Open warmup"}
          >
            🤸
          </Button>
        </div>
        <Badge variant="secondary">
          {exercise.completed_sets.length}/{targetSets} sets
        </Badge>
      </div>

      {/* Warmup Block - Positioned below exercise name, open by default */}
      {showWarmupDialog && (
        <div className="mb-4">
          <WarmupBlock
            workoutExerciseId={exercise.workout_exercise_id}
            unit={unit}
            suggestedTopWeight={templateTargetWeight || currentSetData.weight || 60}
            suggestedTopReps={templateTargetReps || currentSetData.reps || 8}
            onFeedbackGiven={() => {
              // Close warmup after feedback is given
              setShowWarmupDialog(false);
              console.log('Warmup feedback given - closing warmup');
            }}
            onClose={() => setShowWarmupDialog(false)}
          />
        </div>
      )}

      {/* Completed Sets - Ordered with Set labels */}
      {exercise.completed_sets.map((set, index) => (
        <Card key={index} className="p-3">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSetExpansion(index)}
          >
            <div className="flex items-center gap-3">
              <span className="font-medium">Set</span>
              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                {index + 1}
              </Badge>
              <span className="font-medium">
                📜 {set.weight}{unit} × {set.reps} reps {getFeelEmoji(set.feel, set.notes)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSet(index);
                  // Show previously selected values for Feel and Pain
                  const feelFromNotes = parseFeelFromNotes(set.notes);
                  const painFromNotes = set.notes?.includes('PAIN REPORTED') || false;
                  setEditSetData({ 
                    ...set, 
                    feel: feelFromNotes || '=',
                    pain: painFromNotes
                  });
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              {onDeleteSet && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Set</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete Set {index + 1}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteSet(index)}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {expandedSet === index ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
          
          {expandedSet === index && (
            <div className="mt-3 pt-3 border-t space-y-2 text-sm text-muted-foreground">
               {(set.feel || parseFeelFromNotes(set.notes)) && (
                 <div className="flex items-center gap-2">
                   {getFeelEmoji(set.feel, set.notes)}
                 </div>
               )}
               {set.notes && !set.notes.includes('Feel:') && <div>Notes: {set.notes}</div>}
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-medium">Set</span>
                <Badge className="w-8 h-8 rounded-full flex items-center justify-center">
                  {currentSetNumber}
                </Badge>
                <span className="font-medium">Current Set</span>
              </div>
            </div>

            {/* Previous Set and Target Display */}
            <SetPrevTargetDisplay
              userId={userId}
              exerciseId={exerciseId}
              setIndex={currentSetNumber - 1} // Convert to 0-based index for set queries
              templateTargetReps={templateTargetReps}
              templateTargetWeight={templateTargetWeight}
              onApplyTarget={(weight, reps) => {
                console.log('🎯 Applying target from SetPrevTargetDisplay:', { weight, reps });
                setCurrentSetData(prev => ({ ...prev, weight, reps }));
              }}
            />

            
            {/* SetEditor for dual-load support */}
            <SetEditor
              exercise={{
                load_type: exercise.load_type,
                equipment_ref: exercise.equipment_ref
              }}
              value={{
                weightKg: currentSetData.weight,
                perSideKg: currentSetData.perSideKg,
                reps: currentSetData.reps,
                entryMode: currentSetData.entryMode || 'total'
              }}
              onChange={(value) => {
                console.log('🔧 SetEditor onChange:', value);
                setCurrentSetData(prev => ({
                  ...prev,
                  weight: value.weightKg || 0,
                  weightKg: value.weightKg,
                  perSideKg: value.perSideKg,
                  reps: value.reps || prev.reps,
                  entryMode: value.entryMode || 'total'
                }));
              }}
              className="space-y-4"
            />

            {/* Feel Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">How did that feel?</label>
              <div className="grid grid-cols-5 gap-1">
                {FEEL_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={currentSetData.feel === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSetData(prev => ({ ...prev, feel: option.value }))}
                     className="flex flex-col items-center p-1 min-w-[60px] h-14"
                  >
                     <span className="text-lg">{option.emoji}</span>
                     <span className="text-xs font-medium">{option.value}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Pain Toggle */}
            <Button
              variant={currentSetData.pain ? "destructive" : "outline"}
              onClick={() => setCurrentSetData(prev => ({ ...prev, pain: !prev.pain }))}
              className={cn(
                "w-full",
                currentSetData.pain 
                  ? "bg-red-500 text-white hover:bg-red-600 border-red-500" 
                  : "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
              )}
              size="sm"
            >
              {currentSetData.pain ? '⚠ Pain reported 🔄' : '🔄 No pain 💢'}
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
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
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
                    <Button onClick={async () => {
                      // Track muscle usage for adaptive warmups ONLY when completing entire exercise (last exercise)
                      try {
                        const { data: exerciseData } = await supabase
                          .from('exercises')
                          .select('body_part_id, secondary_muscle_group_ids')
                          .eq('id', exerciseId)
                          .single();
                          
                        if (exerciseData) {
                          const primaryGroup = exerciseData.body_part_id || '';
                          const secondaryGroups = exerciseData.secondary_muscle_group_ids || [];
                          noteWorkingSet(primaryGroup, secondaryGroups);
                          console.log('🏁 Last exercise completed - tracked muscle usage for adaptive warmups:', { 
                            primaryGroup, 
                            secondaryGroups, 
                            exerciseId, 
                            exerciseName: exercise.name 
                          });
                        }
                      } catch (error) {
                        console.warn('Failed to track muscle usage on workout finish:', error);
                      }
                      onFinishWorkout();
                    }} className="w-full" size="lg">
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
                  <Button onClick={async () => {
                    // Track muscle usage for adaptive warmups ONLY when completing entire exercise
                    try {
                      const { data: exerciseData } = await supabase
                        .from('exercises')
                        .select('body_part_id, secondary_muscle_group_ids')
                        .eq('id', exerciseId)
                        .single();
                        
                      if (exerciseData) {
                        const primaryGroup = exerciseData.body_part_id || '';
                        const secondaryGroups = exerciseData.secondary_muscle_group_ids || [];
                        noteWorkingSet(primaryGroup, secondaryGroups);
                        console.log('🏁 Exercise completed - tracked muscle usage for adaptive warmups:', { 
                          primaryGroup, 
                          secondaryGroups, 
                          exerciseId, 
                          exerciseName: exercise.name 
                        });
                      }
                    } catch (error) {
                      console.warn('Failed to track muscle usage on exercise completion:', error);
                    }
                    onExerciseComplete();
                  }} className="w-full" size="lg">
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
            {gripsLoading ? (
              <div className="text-center">Loading grips...</div>
            ) : (
               <div className="grid grid-cols-2 gap-2">
                 {grips.map((grip) => (
                   <Button 
                     key={grip.id} 
                     variant={currentGripId === grip.id ? "default" : "outline"} 
                     size="sm"
                     onClick={() => {
                       setCurrentGripId(grip.id);
                       setCurrentGripName(grip.name);
                     }}
                   >
                     {grip.name}
                   </Button>
                 ))}
               </div>
             )}
             <Button 
               onClick={async () => {
                 try {
                   // Save single grip_id to workout_exercise
                   const { error } = await supabase
                     .from('workout_exercises')
                     .update({ grip_id: currentGripId })
                     .eq('id', exercise.workout_exercise_id);
                   
                   if (error) throw error;
                   setShowGripsDialog(false);
                 } catch (error) {
                   console.error('Error saving grip:', error);
                 }
               }} 
               className="w-full"
               disabled={gripsLoading}
             >
               Save Grip
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

      
      {/* Edit Set Dialog */}
      {editingSet !== null && editSetData && (
        <Dialog open={true} onOpenChange={() => setEditingSet(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Set {editingSet + 1}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Weight */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight ({unit})</label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditSetData(prev => prev ? { ...prev, weight: Math.max(0, prev.weight - 2.5) } : null)}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    step="0.5"
                    value={editSetData.weight || ''}
                    onChange={(e) => setEditSetData(prev => prev ? { ...prev, weight: parseFloat(e.target.value) || 0 } : null)}
                    className="text-center text-lg font-semibold"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditSetData(prev => prev ? { ...prev, weight: prev.weight + 2.5 } : null)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Reps */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Reps</label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditSetData(prev => prev ? { ...prev, reps: Math.max(0, prev.reps - 1) } : null)}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    value={editSetData.reps || ''}
                    onChange={(e) => setEditSetData(prev => prev ? { ...prev, reps: parseInt(e.target.value) || 0 } : null)}
                    className="text-center text-lg font-semibold"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setEditSetData(prev => prev ? { ...prev, reps: prev.reps + 1 } : null)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Feel Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Feel</label>
                <div className="grid grid-cols-5 gap-1">
                  {FEEL_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={editSetData.feel === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setEditSetData(prev => prev ? { ...prev, feel: option.value } : null)}
                      className="flex flex-col items-center p-1 min-w-[60px] h-14"
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <span className="text-xs font-medium">{option.value}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Pain Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pain</label>
                <div className="flex gap-2">
                  <Button
                    variant={editSetData.pain === false ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditSetData(prev => prev ? { ...prev, pain: false } : null)}
                    className="flex-1"
                  >
                    ✅ No Pain
                  </Button>
                  <Button
                    variant={editSetData.pain === true ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setEditSetData(prev => prev ? { ...prev, pain: true } : null)}
                    className="flex-1"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Pain
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingSet(null)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (editSetData && editingSet !== null && onUpdateSet) {
                      // Create notes with feel and pain information
                      const feelNote = editSetData.feel ? `Feel: ${editSetData.feel}` : '';
                      const painNote = editSetData.pain ? 'PAIN REPORTED' : '';
                      const existingNotes = editSetData.notes?.replace(/Feel:\s*(--|-|=|\+|\+\+)/, '').replace('PAIN REPORTED', '').trim() || '';
                      
                      const notesArray = [feelNote, painNote, existingNotes].filter(Boolean);
                      const updatedNotes = notesArray.join(' | ');
                      
                      const updatedSetData = {
                        ...editSetData,
                        notes: updatedNotes
                      };
                      
                      onUpdateSet(editingSet, updatedSetData);
                      setEditingSet(null);
                      setEditSetData(null);
                    }
                  }}
                  disabled={!editSetData?.weight || !editSetData?.reps}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}