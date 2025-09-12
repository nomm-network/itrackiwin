import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useLogSet, useUpdateSet } from '../hooks';
import { useAdvanceProgramState } from '@/hooks/useTrainingPrograms';
import { useMyGym } from '@/features/health/fitness/hooks/useMyGym.hook';
import { useExerciseTranslation } from '@/hooks/useExerciseTranslations';
import { useGrips } from '@/hooks/useGrips';
import { WarmupBlock } from '@/components/fitness/WarmupBlock';
import { getExerciseDisplayName } from '../utils/exerciseName';
import { useAdvancedSetLogging } from '../hooks/useAdvancedSetLogging';
import { useWarmupManager } from '../hooks/useWarmupManager';
import { useAuth } from '@/hooks/useAuth';
import { SetEditor } from './SetEditor';

interface WorkoutSessionProps {
  workout: any;
}

export default function EnhancedWorkoutSession({ workout }: WorkoutSessionProps) {
  const navigate = useNavigate();
  const { mutate: logSet, isPending: isLogging } = useLogSet();
  const { mutate: updateSet } = useUpdateSet();
  const { gym } = useMyGym();
  const advanceProgramState = useAdvanceProgramState();
  const { data: grips = [] } = useGrips();
  const queryClient = useQueryClient();
  const { logSet: newLogSet, error: setLoggingError, isLoading: setLoggingLoading } = useAdvancedSetLogging();
  const { user } = useAuth();

  const [currentExercise, setCurrentExercise] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [warmupsShown, setWarmupsShown] = useState({});
  const [warmupCompleted, setWarmupCompleted] = useState(false);

  const exercises = workout?.exercises || [];
  const sets = workout?.sets || [];

  // Find current exercise
  useEffect(() => {
    if (exercises.length > 0) {
      const activeExercise = exercises.find(ex => !completedExercises.has(ex.id)) || exercises[0];
      setCurrentExercise(activeExercise);
    }
  }, [exercises, completedExercises]);

  const setWarmupShown = (exerciseId: string) => {
    setWarmupsShown(prev => ({ ...prev, [exerciseId]: true }));
  };

  const resolveWorkoutExerciseId = (exercise: any) => {
    return exercise?.id || exercise?.workout_exercise_id;
  };

  const getExerciseName = () => {
    if (!currentExercise) return '';
    return getExerciseDisplayName(currentExercise);
  };

  const handleFinishWorkout = () => {
    navigate('/dashboard');
  };

  // Show warmup logic
  useEffect(() => {
    if (!currentExercise) return;
    
    const weId = resolveWorkoutExerciseId(currentExercise);
    const hasBeenShown = warmupsShown[weId];
    const hasTarget = currentExercise.target_weight_kg || currentExercise.target_reps;
    const completedSetsCount = sets.filter((set: any) => 
      set.workout_exercise_id === weId && set.is_completed
    ).length;
    const hasNoCompletedSets = completedSetsCount === 0;

    // Show warmup if:
    // 1. Has target weight/reps (indicates this is a strength exercise)
    // 2. Warmup hasn't been shown yet for this exercise  
    // 3. Warmup not completed yet
    // 4. This is before the first set is completed
    if (hasTarget && !hasBeenShown && !warmupCompleted && hasNoCompletedSets) {
      console.log('✅ Triggering warmup display for exercise:', weId);
      setWarmupShown(weId);
    }
  }, [currentExercise, warmupsShown, warmupCompleted, sets, setWarmupShown]);

  const currentExerciseEstimate = null; // TODO: Implement if needed

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-4 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main workout area */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Workout Session</span>
                  <Button variant="outline" onClick={handleFinishWorkout}>
                    Finish Workout
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentExercise && (
                  <>
                    {/* Exercise name */}
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold">{getExerciseName()}</h2>
                      <Badge variant="outline">
                        {exercises.findIndex(ex => ex.id === currentExercise.id) + 1} of {exercises.length}
                      </Badge>
                    </div>

                    {/* Show warmup if conditions are met and it should be displayed */}
                    {!warmupCompleted && warmupsShown[resolveWorkoutExerciseId(currentExercise)] && (
                      <WarmupBlock
                        workoutExerciseId={resolveWorkoutExerciseId(currentExercise)}
                        unit="kg"
                        suggestedTopWeight={currentExercise?.target_weight_kg || currentExerciseEstimate?.estimated_weight || 60}
                        suggestedTopReps={currentExercise?.target_reps ?? 8}
                        onFeedbackGiven={() => {
                          console.log('🔥 Warmup feedback given, hiding warmup');
                          setWarmupCompleted(true);
                        }}
                        onClose={() => {
                          console.log('❌ Warmup closed manually');
                          setWarmupCompleted(true);
                        }}
                      />
                    )}

                    {/* Current exercise sets */}
                    <div className="space-y-3">
                      {/* Show completed sets */}
                      {sets
                        .filter((set: any) => 
                          set.workout_exercise_id === resolveWorkoutExerciseId(currentExercise) && 
                          set.is_completed
                        )
                        .map((set: any, index: number) => (
                          <div key={set.id} className="flex items-center gap-3 text-sm p-2 bg-muted/20 rounded">
                            <span className="w-12 font-medium">Set {set.set_index || index + 1}</span>
                            <span className="w-24">{set.weight ?? '-'} kg</span>
                            <span className="w-16">× {set.reps ?? '-'}</span>
                            <span className="w-16">RPE {set.rpe ?? '-'}</span>
                            <span className="text-muted-foreground text-xs">{set.notes || ''}</span>
                          </div>
                        ))}

                      {/* Set input form */}
                      <div className="border-2 border-dashed border-primary/30 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">
                            Set {sets.filter((s: any) => 
                              s.workout_exercise_id === resolveWorkoutExerciseId(currentExercise) && 
                              s.is_completed
                            ).length + 1}
                          </Badge>
                          <span className="text-sm text-muted-foreground">Next up</span>
                        </div>
                        
                        <SetEditor
                          exercise={{
                            load_type: currentExercise.load_type,
                            equipment_ref: currentExercise.equipment_ref,
                            id: currentExercise.id
                          }}
                          value={{
                            weightKg: undefined,
                            perSideKg: undefined,
                            reps: undefined,
                            entryMode: currentExercise.load_type === 'dual_load' ? 'per_side' : 'total'
                          }}
                          onChange={(value) => {
                            console.log('🎯 Set data changed:', value);
                          }}
                          setIndex={sets.filter((s: any) => 
                            s.workout_exercise_id === resolveWorkoutExerciseId(currentExercise) && 
                            s.is_completed
                          ).length}
                          userId={user?.id}
                          templateTargetReps={currentExercise.target_reps}
                          templateTargetWeight={currentExercise.target_weight_kg}
                        />
                      </div>
                    </div>
                  </>
                )}

                {!currentExercise && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No exercises in this workout</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side panel */}
          <div className="space-y-4">
            {/* Debug info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">🎯 DEBUG INFO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs font-mono">
                  <div><strong>Workout ID:</strong> {workout?.id}</div>
                  <div><strong>Current Exercise:</strong> {currentExercise?.id}</div>
                  <div><strong>Load Type:</strong> {currentExercise?.load_type || 'Not set'}</div>
                  <div><strong>Equipment Ref:</strong> {currentExercise?.equipment_ref || 'Not set'}</div>
                  <div><strong>Dual Load Enabled:</strong> {currentExercise?.load_type === 'dual_load' ? 'YES' : 'NO'}</div>
                  <div><strong>Total Exercises:</strong> {exercises.length}</div>
                  <div><strong>Completed Sets:</strong> {sets.filter((s: any) => s.is_completed).length}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}