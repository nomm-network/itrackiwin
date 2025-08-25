import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Timer, 
  Target,
  Settings,
  ArrowLeft,
  ArrowRight,
  Zap,
  Plus,
  ChevronDown,
  Hand
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExerciseCard from './ExerciseCard';
import TouchOptimizedSetInput from '@/components/workout/TouchOptimizedSetInput';
import { SetFeelSelector } from '@/features/health/fitness/components/SetFeelSelector';
import { WarmupEditor } from '@/features/health/fitness/components/WarmupEditor';
import { WorkoutRecalibration } from '@/features/health/fitness/components/WorkoutRecalibration';
import { GymConstraintsFilter } from '@/features/health/fitness/components/GymConstraintsFilter';
import { DefaultSetsManager } from './DefaultSetsManager';
import { useMyGym } from '@/features/health/fitness/hooks/useMyGym.hook';
import { useLogSet } from '../hooks';
import { useAdvanceProgramState } from '@/hooks/useTrainingPrograms';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useExerciseTranslation } from '@/hooks/useExerciseTranslations';
import { useGrips, getGripIdByName } from '@/hooks/useGrips';

interface WorkoutSessionProps {
  workout: any;
}

export default function EnhancedWorkoutSession({ workout }: WorkoutSessionProps) {
  const navigate = useNavigate();
  const { mutate: logSet, isPending: isLoading } = useLogSet();
  const { gym } = useMyGym();
  const advanceProgramState = useAdvanceProgramState();
  const { data: grips = [] } = useGrips();
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showWarmupEditor, setShowWarmupEditor] = useState(false);
  const [showRecalibration, setShowRecalibration] = useState(false);
  const [workoutStartTime] = useState(new Date());
  
  // Grip selection state - per exercise
  const [selectedGrips, setSelectedGrips] = useState<Record<string, string[]>>({});
  const [showGripSelector, setShowGripSelector] = useState<Record<string, boolean>>({});
  
  // Set input state - always show for current set
  const [currentSetData, setCurrentSetData] = useState({
    weight: 0,
    reps: 0,
    rpe: 5,
    feel: '',
    notes: '',
    pain: false
  });

  const currentExercise = workout?.exercises?.[currentExerciseIndex];
  const totalExercises = workout?.exercises?.length || 0;
  const progressPercentage = totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0;
  
  // Get exercise translation
  const { data: exerciseTranslation } = useExerciseTranslation(
    currentExercise?.exercise_id || currentExercise?.id || ''
  );
  
  const getExerciseName = () => {
    if (exerciseTranslation?.name) return exerciseTranslation.name;
    if (currentExercise?.exercise?.translations?.en?.name) return currentExercise.exercise.translations.en.name;
    if (currentExercise?.translations?.en?.name) return currentExercise.translations.en.name;
    if (currentExercise?.exercise?.name) return currentExercise.exercise.name;
    if (currentExercise?.name) return currentExercise.name;
    return 'Exercise';
  };
  
  const sets = currentExercise?.sets || [];
  const completedSetsCount = sets.filter((set: any) => set.is_completed).length;
  const targetSetsCount = sets.length || 3;
  const currentSetNumber = completedSetsCount + 1;
  
  // Find current set index (first non-completed set)
  const currentSetIndex = useMemo(() => {
    const index = sets.findIndex(s => !s.is_completed);
    return index === -1 ? sets.length : index;
  }, [sets]);

  // Filter exercises based on gym constraints
  const filteredExercises = useMemo(() => {
    if (!workout?.exercises || !gym) return workout?.exercises || [];
    
    // This would integrate with GymConstraintsFilter logic
    return workout.exercises.filter((exercise: any) => {
      // Basic gym equipment filtering logic would go here
      return true; // For now, show all exercises
    });
  }, [workout?.exercises, gym]);

  const handleSetComplete = (exerciseId: string, setData: any) => {
    console.log('Logging set:', { exerciseId, setData });
    
    const exerciseGrips = selectedGrips[exerciseId] || [];
    
    // Convert grip names to UUIDs
    const gripIds = exerciseGrips
      .map(gripName => getGripIdByName(grips, gripName))
      .filter(id => id !== null) as string[];
    
    // Build notes with feel and pain info
    let notes = setData.notes || '';
    if (setData.feel) {
      notes = notes ? `Feel: ${setData.feel}. ${notes}` : `Feel: ${setData.feel}`;
    }
    if (setData.pain) {
      notes = notes ? `${notes}. Pain reported` : 'Pain reported';
    }
    
    logSet({
      workout_exercise_id: exerciseId,
      weight: setData.weight || 0,
      reps: setData.reps || 0,
      rpe: setData.rpe || 5,
      notes: notes,
      is_completed: true,
      grip_ids: gripIds
    }, {
      onSuccess: (data) => {
        console.log('Set logged successfully:', data);
        // Reset form for next set
        setCurrentSetData({
          weight: setData.weight || 0, // Keep weight for next set
          reps: setData.reps || 0,     // Keep reps for next set
          rpe: 5,
          feel: '',
          notes: '',
          pain: false
        });
        toast.success('Set logged successfully!');
        
        // Force refresh the workout data to show updated sets
        window.location.reload();
      },
      onError: (error) => {
        console.error('Failed to log set:', error);
        toast.error(`Failed to log set: ${error.message}`);
      }
    });
  };

  const handleSaveSet = () => {
    if (currentExercise && (currentSetData.weight > 0 || currentSetData.reps > 0)) {
      handleSetComplete(currentExercise.id, currentSetData);
    } else {
      toast.error('Please enter weight or reps');
    }
  };
  
  const handleAddExtraSet = () => {
    // For adding sets beyond the target
    if (currentExercise && (currentSetData.weight > 0 || currentSetData.reps > 0)) {
      handleSetComplete(currentExercise.id, currentSetData);
    }
  };

  const handleExerciseComplete = (exerciseId: string) => {
    setCompletedExercises(prev => new Set([...prev, exerciseId]));
    
    // Auto-advance to next exercise
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handleWorkoutComplete = async () => {
    try {
      // Mark workout as completed in the database
      const { error } = await supabase
        .from('workouts')
        .update({ 
          ended_at: new Date().toISOString(),
          perceived_exertion: null // Could be set via a form later
        })
        .eq('id', workout.id);

      if (error) throw error;

      // Advance program state if this was from a program
      if (workout.program_block_id) {
        await advanceProgramState.mutateAsync(workout.program_block_id);
      }
      
      toast.success('Workout completed! 🎉');
      
      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Failed to complete workout:', error);
      toast.error('Failed to complete workout');
    }
  };

  const handleFinishWorkout = () => {
    navigate('/dashboard');
  };

  if (!workout?.exercises?.length) {
    return (
      <Card className="m-6">
        <CardContent className="pt-6 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No exercises found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This workout doesn't have any exercises yet.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 pb-24">
      {/* Workout Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {workout.title || 'Active Workout'}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Started at {workoutStartTime.toLocaleTimeString()}
                {gym && ` • ${gym.name}`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {completedExercises.size}/{totalExercises} exercises
              </Badge>
              {workout.program_block_id && (
                <Badge variant="default" className="bg-green-500">
                  Program
                </Badge>
              )}
            </div>
          </div>
          
          <Progress value={progressPercentage} className="w-full" />
        </CardHeader>
      </Card>

      {/* Exercise Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={handlePreviousExercise}
          disabled={currentExerciseIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex-1 text-center">
          <p className="text-sm text-muted-foreground">
            Exercise {currentExerciseIndex + 1} of {totalExercises}
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={handleNextExercise}
          disabled={currentExerciseIndex === totalExercises - 1}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Current Exercise */}
      {currentExercise && (
        <div className="space-y-4">
          {/* Exercise Info Card */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {getExerciseName()}
                </h3>
                <Badge variant="outline">
                  {completedSetsCount}/{targetSetsCount} sets
                </Badge>
              </div>
              
              {/* Grip Selection - Collapsible */}
              <Collapsible 
                open={showGripSelector[currentExercise.id]} 
                onOpenChange={(open) => setShowGripSelector(prev => ({ ...prev, [currentExercise.id]: open }))}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full mb-4">
                    <Hand className="h-4 w-4 mr-2" />
                    Grip Selection
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mb-4">
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-3">
                      Select grip(s) for this exercise. This will be applied to all sets.
                    </p>
                    
                    {/* Use actual grip data from database */}
                     <div className="grid grid-cols-2 gap-2">
                       {grips.length === 0 ? (
                         <div className="col-span-2 text-center text-sm text-muted-foreground py-4">
                           Loading grips...
                           <div className="text-xs mt-1">Database has {grips.length} grips</div>
                           <div className="text-xs">Try refreshing if this persists</div>
                        </div>
                      ) : (
                        grips.map((grip) => (
                          <Button
                            key={grip.id}
                            variant={selectedGrips[currentExercise.id]?.includes(grip.name) ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              setSelectedGrips(prev => {
                                const current = prev[currentExercise.id] || [];
                                const updated = current.includes(grip.name)
                                  ? current.filter(g => g !== grip.name)
                                  : [...current, grip.name];
                                return { ...prev, [currentExercise.id]: updated };
                              });
                            }}
                          >
                            {grip.name}
                          </Button>
                        ))
                      )}
                    </div>
                    
                    {selectedGrips[currentExercise.id]?.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">Selected:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedGrips[currentExercise.id].map((grip) => (
                            <Badge key={grip} variant="secondary" className="text-xs">
                              {grip}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Default Sets Manager - Bro's Recommendations */}
              <DefaultSetsManager
                exerciseId={currentExercise.id}
                currentSets={targetSetsCount}
                onSetsChange={(newSets) => {
                  // This would ideally update the workout template or add/remove sets
                  console.log('Bro recommends changing sets to:', newSets);
                  toast.info(`Bro suggests ${newSets} sets for this exercise`);
                }}
                onApplyDefaults={(sets, reps) => {
                  toast.success(`Applied Bro's recommendation: ${sets} sets × ${reps} reps`);
                  console.log('Applied defaults:', { sets, reps });
                }}
              />
              
              {/* Sets Display */}
              <div className="space-y-3 mb-4">
                {sets.map((set: any, index: number) => {
                  const isCompleted = !!set.is_completed;
                  const isCurrent = index === currentSetIndex && !isCompleted;
                  const setNumber = index + 1;
                  
                  return (
                    <Card key={set.id || index} className="mb-3">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base">Set {setNumber}</CardTitle>
                        {isCompleted && (
                          <Badge variant="secondary" className="shrink-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                      </CardHeader>

                      <CardContent className="space-y-3 pt-2">
                        {/* Completed set summary */}
                        {isCompleted && (
                          <div className="text-sm text-muted-foreground">
                            {set.weight && set.reps
                              ? `${set.weight}kg × ${set.reps} reps`
                              : set.target_weight && set.target_reps
                              ? `Target: ${set.target_weight}kg × ${set.target_reps} reps`
                              : 'Completed'}
                            {set.rpe ? ` • RPE ${set.rpe}` : null}
                          </div>
                        )}

                        {/* Not current and not completed → show target/placeholder */}
                        {!isCompleted && !isCurrent && (
                          <div className="text-sm text-muted-foreground">
                            {set.target_weight && set.target_reps
                              ? `Target: ${set.target_weight}kg × ${set.target_reps} reps`
                              : 'Not started'}
                          </div>
                        )}

                        {/* CURRENT SET → the form lives INSIDE THIS CardContent */}
                        {isCurrent && (
                          <>
                            <div className="text-sm font-medium text-center mb-3">
                              {getExerciseName()}
                            </div>

                            {/* Weight input */}
                            <TouchOptimizedSetInput
                              label="Weight"
                              value={currentSetData.weight}
                              onChange={(value) =>
                                setCurrentSetData(prev => ({ ...prev, weight: value || 0 }))
                              }
                              suffix="kg"
                              min={0}
                              max={500}
                              step={2.5}
                            />

                            {/* Reps input */}
                            <TouchOptimizedSetInput
                              label="Reps"
                              value={currentSetData.reps}
                              onChange={(value) =>
                                setCurrentSetData(prev => ({ ...prev, reps: value || 0 }))
                              }
                              min={0}
                              max={100}
                              step={1}
                            />

                            {/* RPE input */}
                            <TouchOptimizedSetInput
                              label="RPE"
                              value={currentSetData.rpe}
                              onChange={(value) =>
                                setCurrentSetData(prev => ({ ...prev, rpe: value || 5 }))
                              }
                              min={1}
                              max={10}
                              step={0.5}
                            />

                            {/* Feel selector (compact) */}
                            <div className="space-y-2">
                              <div className="text-sm">How did that set feel?</div>
                              <div className="grid grid-cols-5 gap-2">
                                {['terrible','bad','okay','good','amazing'].map((feel, i) => {
                                  const emoji = ['😣','😐','😊','😎','🔥'][i];
                                  const active = currentSetData.feel === feel;
                                  return (
                                    <button
                                      key={feel}
                                      type="button"
                                      onClick={() =>
                                        setCurrentSetData(prev => ({ ...prev, feel }))
                                      }
                                      className={`p-3 rounded-md border text-lg ${
                                        active
                                          ? 'border-primary bg-primary/10'
                                          : 'border-border'
                                      }`}
                                    >
                                      {emoji}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Pain toggle */}
                            <button
                              type="button"
                              onClick={() =>
                                setCurrentSetData(prev => ({ ...prev, pain: !prev.pain }))
                              }
                              className={`w-full px-4 py-2 rounded-md border ${
                                currentSetData.pain
                                  ? 'border-red-500 text-red-600 bg-red-500/10'
                                  : 'border-border'
                              }`}
                            >
                              {currentSetData.pain ? '⚠️ Pain reported' : 'No pain'}
                            </button>

                            {/* Log Set */}
                            <div className="pt-1">
                              <Button
                                className="w-full"
                                onClick={() => handleSetComplete(currentExercise.id, currentSetData)}
                                disabled={isLoading}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {isLoading ? 'Logging…' : `Log Set ${setNumber}`}
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* Add Extra Set Button - Show only if all target sets completed */}
              {completedSetsCount >= targetSetsCount && (
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">All target sets completed!</p>
                  </div>
                  
                  <Button 
                    onClick={handleAddExtraSet}
                    variant="outline" 
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Extra Set
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workout Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => setShowWarmupEditor(true)}
          className="flex-1"
        >
          <Settings className="h-4 w-4 mr-2" />
          Edit Warmup
        </Button>
        
        <Button
          onClick={handleWorkoutComplete}
          disabled={false} // Allow completion at any time
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Workout
        </Button>
      </div>

      {/* Warmup Editor */}
      {showWarmupEditor && currentExercise && (
        <WarmupEditor
          exerciseId={currentExercise.exercise_id || currentExercise.id}
          exerciseName={getExerciseName()}
          onClose={() => setShowWarmupEditor(false)}
        />
      )}

      {/* Recalibration Panel */}
      {showRecalibration && (
        <Card>
          <CardHeader>
            <CardTitle>Workout Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkoutRecalibration
              workoutId={workout.id}
              exerciseIds={workout.exercises.map((ex: any) => ex.exercise_id)}
              onApplyPrescriptions={(prescriptions) => {
                console.log('Prescriptions applied:', prescriptions);
                handleFinishWorkout();
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}