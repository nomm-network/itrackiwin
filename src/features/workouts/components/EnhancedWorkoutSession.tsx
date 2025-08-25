import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { sanitizeUuid, isUuid } from '@/utils/ids';
import ImprovedWorkoutSession from '@/components/fitness/ImprovedWorkoutSession';
import { WarmupBlock } from '@/components/fitness/WarmupBlock';

// Add readiness check imports
import ReadinessCheckIn, { ReadinessData } from '@/components/fitness/ReadinessCheckIn';
import { useShouldShowReadiness } from '@/features/health/fitness/hooks/useShouldShowReadiness';
import { usePreWorkoutCheckin } from '@/features/health/fitness/hooks/usePreWorkoutCheckin';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import PageNav from "@/components/PageNav";

interface WorkoutSessionProps {
  workout: any;
}

export default function EnhancedWorkoutSession({ workout }: WorkoutSessionProps) {
  const navigate = useNavigate();
  const { mutate: logSet, isPending: isLogging } = useLogSet();
  const { gym } = useMyGym();
  const advanceProgramState = useAdvanceProgramState();
  const { data: grips = [] } = useGrips();
  const queryClient = useQueryClient();
  const { toast: toastUtils } = useToast();
  
  // Use proper auth hook - no race conditions
  const { user, loading: authLoading } = useAuth();

  // Robust readiness check using the auth hook
  const { data: shouldShowReadiness, isLoading: isCheckingReadiness } = useShouldShowReadiness(workout?.id, user?.id);
  const { createCheckin } = usePreWorkoutCheckin(workout?.id);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showWarmupEditor, setShowWarmupEditor] = useState(false);
  const [showRecalibration, setShowRecalibration] = useState(false);
  const [workoutStartTime] = useState(new Date());
  const [warmupCompleted, setWarmupCompleted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
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

  // Get user ID on mount (backup to auth hook)
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

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

  const resolveWorkoutExerciseId = (ex: any): string => {
    // prefer the actual WE id provided by your query
    const candidate =
      ex?.workout_exercise_id ??
      ex?.we_id ??                        // if you aliased as we_id
      ex?.id;                             // fallback (only if `ex.id` really is WE id!)

    const id = sanitizeUuid(candidate);
    if (!isUuid(id)) {
      console.error('❌ Invalid workout_exercise_id', { candidate, id, ex });
      throw new Error('Invalid workout_exercise_id (not a UUID)');
    }
    return id;
  };

  const handleSetComplete = (workoutExerciseId: string, setData: any) => {
    console.log('=== SET LOGGING DEBUG ===');
    console.log('Current Exercise Object:', currentExercise);
    console.log('Workout Exercise ID being passed:', workoutExerciseId);
    console.log('Set Data:', setData);
    console.log('Type of workoutExerciseId:', typeof workoutExerciseId);
    
    const exerciseGrips = selectedGrips[workoutExerciseId] || [];
    
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
    
    const payload = {
      workout_exercise_id: workoutExerciseId,
      weight: setData.weight || 0,
      reps: setData.reps || 0,
      rpe: setData.rpe || 5,
      notes: notes,
      is_completed: true,
      grip_ids: gripIds
    };
    
    console.log('Payload being sent to set_log:', payload);
    console.log('Payload JSON:', JSON.stringify(payload));
    
        logSet(payload, {
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
        
        // Note: Removed window.location.reload() to maintain exercise navigation state
      },
      onError: (error) => {
        console.error('Failed to log set:', error);
        toast.error(`Failed to log set: ${error.message}`);
      }
    });
  };

  const handleSaveSet = () => {
    if (currentExercise && (currentSetData.weight > 0 || currentSetData.reps > 0)) {
      const weId = resolveWorkoutExerciseId(currentExercise);
      handleSetComplete(weId, currentSetData);
    } else {
      toast.error('Please enter weight or reps');
    }
  };
  
  const handleAddExtraSet = () => {
    // For adding sets beyond the target
    if (currentExercise && (currentSetData.weight > 0 || currentSetData.reps > 0)) {
      const weId = resolveWorkoutExerciseId(currentExercise);
      handleSetComplete(weId, currentSetData);
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
      
      // Force refresh the dashboard state by navigating and reloading
      navigate('/dashboard');
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Failed to complete workout:', error);
      toast.error('Failed to complete workout');
    }
  };

  const handleFinishWorkout = () => {
    navigate('/dashboard');
  };

  // Readiness check handlers
  const handleReadinessSubmit = async (readinessData: ReadinessData) => {
    try {
      // Calculate a simple readiness score (0-10 based on answers)
      const score = calculateReadinessScore(readinessData);
      
      await createCheckin.mutateAsync({
        answers: readinessData,
        readiness_score: score
      });
      
      toastUtils({
        title: "Readiness recorded",
        description: "Your pre-workout check-in has been saved."
      });
      
      // Invalidate the shouldShowReadiness query to hide the popup
      queryClient.invalidateQueries({ queryKey: ['shouldShowReadiness', workout?.id, user?.id] });
    } catch (error) {
      console.error('Error saving readiness check:', error);
      toastUtils({
        title: "Error",
        description: "Failed to save readiness check.",
        variant: "destructive"
      });
    }
  };

  // Simple readiness score calculation
  const calculateReadinessScore = (readinessData: ReadinessData): number => {
    let score = 10;
    if (readinessData.illness) score -= 3;
    if (readinessData.sleep_quality < 5) score -= 2;
    if (readinessData.energy < 5) score -= 2;
    return Math.max(0, Math.min(10, score));
  };

  const handleSkipReadiness = async () => {
    try {
      // Create a special "skipped" checkin to prevent showing again
      await createCheckin.mutateAsync({ 
        answers: { skipped: true } as any, 
        readiness_score: 5 // neutral score for skipped
      });
      
      toastUtils({
        title: "Check-in skipped",
        description: "Proceeding to workout."
      });
      
      // Invalidate the shouldShowReadiness query to hide the popup
      queryClient.invalidateQueries({ queryKey: ['shouldShowReadiness', workout?.id, user?.id] });
    } catch (error) {
      console.error('Error skipping readiness check:', error);
      toastUtils({
        title: "Error",
        description: "Failed to skip readiness check.",
        variant: "destructive"
      });
    }
  };

  const handleAbortWorkout = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to abort this workout? All progress will be deleted and cannot be recovered.'
    );
    
    if (confirmed) {
      try {
        // Delete the workout and all its associated data
        const { error } = await supabase
          .from('workouts')
          .delete()
          .eq('id', workout.id);

        if (error) throw error;

        toast.success('Workout deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to delete workout:', error);
        toast.error('Failed to delete workout');
      }
    }
  };

  // Robust decision logic - no race conditions
  const needsReadiness = shouldShowReadiness === true;
  
  // DEBUG: Log the readiness check logic
  console.log('🔍 ENHANCED READINESS DEBUG:', {
    workoutId: workout?.id,
    userId: user?.id,
    shouldShowReadiness,
    isCheckingReadiness,
    needsReadiness,
    authLoading
  });
  
  // Gate UI until we know the readiness status
  const stillLoading = isCheckingReadiness || authLoading || !user;

  // Show loading until we have all the data
  if (stillLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading workout...</span>
      </div>
    );
  }

  // Show readiness check if needed
  console.log('🚨 ENHANCED READINESS CHECK DECISION:', needsReadiness);
  if (needsReadiness) {
    console.log('🎯 RENDERING ENHANCED READINESS CHECK');
    return (
      <>
        <PageNav current="Pre-Workout Check" />
        <main className="container py-6 flex items-center justify-center min-h-[60vh] pb-32">
          <ReadinessCheckIn
            onSubmit={handleReadinessSubmit}
            isLoading={createCheckin.isPending}
          />
        </main>
      </>
    );
  }

  // DEBUG: Log when we reach main workout view
  console.log('🎯 SHOWING ENHANCED MAIN WORKOUT VIEW');

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

  const allExercisesComplete = completedExercises.size === totalExercises;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              ← Back
            </Button>
            <h1 className="text-lg font-semibold">
              Workout <em>{workout?.template_name || workout?.name || 'Session'}</em>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              🏋️ {currentExerciseIndex + 1}/{workout?.exercises?.length || 0}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 max-w-md mx-auto">
        {!workout?.exercises || workout.exercises.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No exercises found in this workout.</p>
          </div>
        ) : (
          <>
            {currentExercise && (
              <>
                {/* Hide warmup after feedback is given */}
                {!warmupCompleted && (
                  <WarmupBlock
                    workoutExerciseId={resolveWorkoutExerciseId(currentExercise)}
                    unit="kg"
                    suggestedTopWeight={currentExercise?.target_weight ?? 60}
                    suggestedTopReps={currentExercise?.target_reps ?? 8}
                    onFeedbackGiven={() => setWarmupCompleted(true)}
                  />
                )}
                <ImprovedWorkoutSession
                exercise={{
                  id: currentExercise.id,
                  workout_exercise_id: resolveWorkoutExerciseId(currentExercise),
                  name: getExerciseName(),
                  target_sets: currentExercise.target_sets || 3,
                  completed_sets: sets.filter((set: any) => set.is_completed)
                }}
                userId={userId}
                exerciseId={currentExercise?.exercise_id}
                templateTargetReps={currentExercise?.target_reps}
                templateTargetWeight={currentExercise?.target_weight}
                isLastExercise={currentExerciseIndex === totalExercises - 1}
                onSetComplete={(setData) => {
                  // Hide warmup when first set is completed
                  setWarmupCompleted(true);
                  const weId = resolveWorkoutExerciseId(currentExercise);
                  handleSetComplete(weId, setData);
                }}
                onExerciseComplete={() => {
                  // Reset warmup for next exercise
                  setWarmupCompleted(false);
                  handleExerciseComplete(currentExercise.id);
                }}
                onFinishWorkout={handleWorkoutComplete}
                onAddExtraSet={() => {
                  const weId = resolveWorkoutExerciseId(currentExercise);
                  handleSetComplete(weId, {
                    weight: 0,
                    reps: 0,
                    rpe: 5,
                    feel: '',
                    pain: false,
                    notes: '',
                    is_completed: false
                  });
                }}
                  unit="kg"
                />
              </>
            )}

            {/* Exercise Navigation at Bottom */}
            <div className="mt-8 space-y-3 pb-20">
              <div className="text-center text-sm text-muted-foreground mb-3">
                Exercise Navigation
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {workout.exercises.map((exercise: any, index: number) => {
                  // Get exercise name for each specific exercise
                  const exerciseName = exercise?.exercise?.translations?.en?.name || 
                                     exercise?.translations?.en?.name || 
                                     exercise?.exercise?.name || 
                                     exercise?.name || 
                                     'Exercise';
                  return (
                    <Button
                      key={exercise.id}
                      variant={index === currentExerciseIndex ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentExerciseIndex(index)}
                      className="flex-shrink-0"
                    >
                      {index + 1}. {exerciseName}
                    </Button>
                  );
                })}
              </div>
              
              {/* Abort Workout Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleAbortWorkout}
                  variant="destructive"
                  className="w-full"
                  size="lg"
                >
                  Abort Workout
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Complete Workout Button */}
      {allExercisesComplete && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
          <Button
            onClick={handleWorkoutComplete}
            className="w-full"
            size="lg"
          >
            Complete Workout
          </Button>
        </div>
      )}

      {/* Warmup Editor Dialog */}
      <Dialog open={showWarmupEditor} onOpenChange={setShowWarmupEditor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Warmup</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <WarmupEditor 
              exerciseId={currentExercise?.exercise_id || currentExercise?.id}
              exerciseName={getExerciseName()}
              onClose={() => setShowWarmupEditor(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}