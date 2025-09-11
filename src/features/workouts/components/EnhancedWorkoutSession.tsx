import React, { useState, useMemo, useEffect } from 'react';
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
import { useLogSet, useUpdateSet } from '../hooks';
import { useAdvanceProgramState } from '@/hooks/useTrainingPrograms';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useExerciseTranslation } from '@/hooks/useExerciseTranslations';
import { useGrips, getGripIdByName } from '@/hooks/useGrips';
import { sanitizeUuid, isUuid } from '@/utils/ids';
import ImprovedWorkoutSession from '@/components/fitness/ImprovedWorkoutSession';
import { WarmupBlock } from '@/components/fitness/WarmupBlock';
import { getExerciseDisplayName } from '../utils/exerciseName';
import { useAdvancedSetLogging } from '../hooks/useAdvancedSetLogging';
import { recomputeWarmupPlan } from '../warmup/recalc';
import { submitWarmupFeedback } from '../warmup/feedback';
import { SessionHeaderMeta } from './SessionHeaderMeta';
import { useWarmupSessionState } from '../state/warmupSessionState';
import { useWarmupManager } from '../hooks/useWarmupManager';

// Add readiness check imports
import EnhancedReadinessCheckIn, { EnhancedReadinessData } from '@/components/fitness/EnhancedReadinessCheckIn';
import { useShouldShowReadiness } from '@/features/health/fitness/hooks/useShouldShowReadiness';
import { usePreWorkoutCheckin } from '@/features/health/fitness/hooks/usePreWorkoutCheckin';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import PageNav from "@/components/PageNav";
import { useExerciseEstimate } from '../hooks/useExerciseEstimate';

// Import readiness scoring utilities
import { computeReadinessScore, getCurrentUserReadinessScore } from '@/lib/readiness';
import { saveTodayReadiness } from '@/lib/api/readiness'; // Use the correct API function
import { useSessionTiming } from '@/stores/sessionTiming';

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
  const { toast: toastUtils } = useToast();
  const { logSet: newLogSet, error: setLoggingError, isLoading: setLoggingLoading } = useAdvancedSetLogging();
  
  // Use proper auth hook - no race conditions
  const { user, loading: authLoading } = useAuth();
  
  // Session timing for workout tracking
  const { startSession } = useSessionTiming();

  // Robust readiness check using the auth hook
  const { data: shouldShowReadiness, isLoading: isCheckingReadiness } = useShouldShowReadiness(workout?.id, user?.id);
  const { createCheckin } = usePreWorkoutCheckin(workout?.id);
  
  // Warmup session state for managing which warmups have been shown
  const { warmupsShown, setWarmupShown } = useWarmupSessionState();
  
  // Warmup context manager for dynamic warm-up counts
  const { resetSessionContext, logWorkingSet } = useWarmupManager();
  
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(
    workout?.exercises?.sort((a: any, b: any) => a.order_index - b.order_index)?.[0]?.id ?? null
  );
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showWarmupEditor, setShowWarmupEditor] = useState(false);
  const [showRecalibration, setShowRecalibration] = useState(false);
  const [workoutStartTime] = useState(new Date());
  const [warmupCompleted, setWarmupCompleted] = useState(false);
  const [hasExistingWarmupData, setHasExistingWarmupData] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [readinessScore, setReadinessScore] = useState<number | undefined>();

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

  // Start session timing when workout is active
  React.useEffect(() => {
    if (workout?.started_at && !workout?.ended_at) {
      startSession();
      // Reset warmup context for new session
      resetSessionContext();
    }
  }, [workout?.started_at, workout?.ended_at, startSession, resetSessionContext]);

  const currentExercise = useMemo(() => {
    const sortedExercises = workout?.exercises?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
    return sortedExercises.find((x: any) => x.id === currentExerciseId) ?? sortedExercises[0];
  }, [workout?.exercises, currentExerciseId]);

  // Get exercise estimate for current exercise - moved after currentExercise definition
  const currentExerciseEstimateId = currentExercise?.exercise_id || currentExercise?.exercise?.id;
  const { data: currentExerciseEstimate } = useExerciseEstimate(currentExerciseEstimateId, 'rm10');

  // Calculate sets data early so it can be used in useEffect
  const sets = currentExercise?.sets || [];
  const completedSetsCount = sets.filter((set: any) => set.is_completed).length;
  

  // Check if warmup feedback was already given when exercise changes
  useEffect(() => {
    const checkWarmupFeedback = async () => {
      if (currentExercise) {
        const weId = resolveWorkoutExerciseId(currentExercise);
        const { data } = await supabase
          .from('workout_exercises')
          .select('warmup_feedback, warmup_feedback_at')
          .eq('id', weId)
          .maybeSingle();
        
        // Only hide warmup if feedback was explicitly given
        if (data?.warmup_feedback && data?.warmup_feedback_at) {
          setWarmupCompleted(true);
        } else {
          setWarmupCompleted(false);
        }
      }
    };
    checkWarmupFeedback();
  }, [currentExercise]);

  // Trigger warmup display immediately when exercise loads (before any sets)
  useEffect(() => {
    if (!currentExercise) return;
    
    const weId = resolveWorkoutExerciseId(currentExercise);
    const hasTarget = currentExercise?.target_weight_kg || currentExercise?.target_reps || currentExerciseEstimate?.estimated_weight;
    const hasBeenShown = warmupsShown[weId];
    const hasNoCompletedSets = completedSetsCount === 0;
    
    console.log('🔍 Checking warmup conditions on exercise load:', {
      weId, hasTarget, hasBeenShown, warmupCompleted, hasNoCompletedSets, completedSetsCount
    });
    
    // Show warmup immediately when exercise loads if:
    // 1. We have a target weight/reps available (from template or estimate)  
    // 2. It hasn't been shown for this exercise yet in this session
    // 3. Warmup isn't marked as completed
    // 4. This is before the first set is completed
    if (hasTarget && !hasBeenShown && !warmupCompleted && hasNoCompletedSets) {
      console.log('✅ Triggering warmup display for exercise:', weId);
      setWarmupShown(weId);
      // The warmup will be shown by the existing WarmupBlock component
    }
  }, [currentExercise, warmupsShown, warmupCompleted, currentExerciseEstimate, completedSetsCount, setWarmupShown]);
  const totalExercises = workout?.exercises?.length || 0;
  const progressPercentage = totalExercises > 0 ? (completedExercises.size / totalExercises) * 100 : 0;
  
  // Add runtime check for debugging
  if (!currentExercise?.id) {
    console.warn('No workout_exercises.id on currentExercise', currentExercise);
  }

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

  
  // Get exercise translation - use the main exercise_id
  const exerciseId = currentExercise?.exercise_id || currentExercise?.exercise?.id;
  const { data: exerciseTranslation } = useExerciseTranslation(exerciseId);
  
  const getExerciseName = () => {
    // First try the dedicated exercise translation hook
    if (exerciseTranslation?.name) {
      return exerciseTranslation.name;
    }
    
    // Then try the translations from the workout query
    const translations = currentExercise?.exercise?.exercises_translations;
    
    if (translations && Array.isArray(translations)) {
      // Try English first
      const enTranslation = translations.find(t => t.language_code === 'en');
      if (enTranslation?.name) {
        return enTranslation.name;
      }
      
      // Fallback to any available translation
      const anyTranslation = translations.find(t => t.name);
      if (anyTranslation?.name) {
        return anyTranslation.name;
      }
    }
    
    // Legacy fallbacks
    if (currentExercise?.exercise?.translations?.en?.name) {
      return currentExercise.exercise.translations.en.name;
    }
    if (currentExercise?.translations?.en?.name) {
      return currentExercise.translations.en.name;
    }
    if (currentExercise?.exercise?.name) {
      return currentExercise.exercise.name;
    }
    if (currentExercise?.name) {
      return currentExercise.name;
    }
    
    return `Exercise ${exerciseId?.slice(0, 8) || 'Unknown'}`;
  };
  
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

  // Function moved above to avoid hoisting issues

  const handleSetComplete = async (workoutExerciseId: string, setData: any) => {
    console.log('🔍 handleSetComplete called with:', {
      workoutExerciseId,
      setData,
      'selectedGrips[workoutExerciseId]': selectedGrips[workoutExerciseId],
      'selectedGrips': selectedGrips,
      'grips.length': grips.length
    });

    const exerciseGrips = selectedGrips[workoutExerciseId] || [];
    console.log('🔍 exerciseGrips:', exerciseGrips);
    
    // Convert grip names to UUIDs
    const gripIds = exerciseGrips
      .map(gripName => {
        const id = getGripIdByName(grips, gripName);
        console.log(`🔍 Converting grip "${gripName}" to ID:`, id);
        return id;
      })
      .filter(id => {
        const isValid = id !== null;
        if (!isValid) console.warn('⚠️ Filtered out null grip ID');
        return isValid;
      }) as string[];
    
    console.log('🔍 Final grip IDs after conversion:', gripIds);
    
    // Build notes with feel and pain info
    let notes = setData.notes || '';
    if (setData.feel) {
      notes = notes ? `Feel: ${setData.feel}. ${notes}` : `Feel: ${setData.feel}`;
    }
    if (setData.pain) {
      notes = notes ? `${notes}. Pain reported` : 'Pain reported';
    }
    
    // Calculate planned set index (0-based: Set 1 → 0, Set 2 → 1, etc.)
    const currentSetNumber = (currentExercise?.completed_sets_count || 0) + 1;
    const plannedSetIndex = currentSetNumber - 1; // Convert to 0-based
    
    const payload = {
      workout_exercise_id: workoutExerciseId,
      weight: setData.weight || 0,
      reps: setData.reps || 0,
      rpe: setData.rpe || 5,
      notes: notes,
      is_completed: true,
      grip_ids: gripIds
    };
    
    console.log('🔍 About to call newLogSet with payload:', {
      payload,
      plannedSetIndex,
      'payload.grip_ids': payload.grip_ids,
      'payload.grip_ids.length': payload.grip_ids.length
    });
    
    try {
      const result = await newLogSet(payload, plannedSetIndex);
      
      // Only update warmup context for working sets (not warmup sets)
      const isWorkingSet = plannedSetIndex > 0; // Set index 0 and negative are warmup sets
      
      if (isWorkingSet) {
        // Log working set to warmup context for future exercise warm-up planning
        try {
          await logWorkingSet(workoutExerciseId);
          console.log('✅ Logged working set to warmup context');
        } catch (contextError) {
          console.error('Failed to log working set to context:', contextError);
          // Don't block the set logging for context issues
        }
      } else {
        console.log('⏭️ Skipping warmup context update for warmup set');
      }
      
      // Reset form for next set
      setCurrentSetData({
        weight: setData.weight || 0, // Keep weight for next set
        reps: setData.reps || 0,     // Keep reps for next set
        rpe: 5,
        feel: '',
        notes: '',
        pain: false
      });
      
      // Invalidate workout queries to refresh the UI and show the logged set
      await queryClient.invalidateQueries({ queryKey: ['workouts'] });
      await queryClient.invalidateQueries({ queryKey: ['workout', workout?.id] });
      await queryClient.invalidateQueries({ queryKey: ['active-workout'] });
      
      toast.success(`Set ${result.action} successfully!`);
      
      // Note: Removed window.location.reload() to maintain exercise navigation state
    } catch (error) {
      console.error('Failed to log set:', error);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Extract detailed error information
      let errorDetails = 'Unknown error';
      if (error instanceof Error) {
        errorDetails = error.message;
        if ((error as any).details) {
          errorDetails += ` | Details: ${(error as any).details}`;
        }
        if ((error as any).hint) {
          errorDetails += ` | Hint: ${(error as any).hint}`;
        }
        if ((error as any).code) {
          errorDetails += ` | Code: ${(error as any).code}`;
        }
      } else if (typeof error === 'object' && error !== null) {
        if ((error as any).message) {
          errorDetails = (error as any).message;
        }
        if ((error as any).error_description) {
          errorDetails += ` | ${(error as any).error_description}`;
        }
        errorDetails += ` | Raw: ${JSON.stringify(error)}`;
      } else {
        errorDetails = String(error);
      }
      
      toast.error(`SET SAVE FAILED: ${errorDetails}`);
    }
  };

  // Updated handleWarmupFeedback function
  const handleWarmupFeedback = async (exerciseId: string, feedback: 'not_enough' | 'excellent' | 'too_much') => {
    if (!user?.id || !currentExercise?.id) {
      toast.error('Missing user or exercise information');
      return;
    }

    try {
      await submitWarmupFeedback({
        workoutExerciseId: resolveWorkoutExerciseId(currentExercise),
        exerciseId,
        userId: user.id,
        feedback
      });
      
      toast.success(`Warmup feedback recorded: ${feedback.replace('_', ' ')}`);
    } catch (error) {
      console.error('Failed to submit warmup feedback:', error);
      toast.error('Failed to record warmup feedback');
    }
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
    
    // Auto-advance to next exercise using sorted exercises
    const sortedExercises = workout?.exercises?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
    const currentIndex = sortedExercises.findIndex((x: any) => x.id === currentExerciseId) ?? -1;
    if (currentIndex < totalExercises - 1) {
      const nextExercise = sortedExercises[currentIndex + 1];
      if (nextExercise?.id) {
        setCurrentExerciseId(nextExercise.id);
      }
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
  const handleReadinessSubmit = async (enhancedReadinessData: EnhancedReadinessData) => {
    try {
      const { readiness, estimates } = enhancedReadinessData;
      
      console.log('🔍 EnhancedWorkoutSession: Processing readiness and estimates:', { readiness, estimates });
      
      // Use the new RPC function to save readiness data
      const inputData = {
        energy: readiness.energy,
        sleep_quality: readiness.sleep_quality, 
        sleep_hours: readiness.sleep_hours,
        soreness: readiness.soreness,
        stress: readiness.stress,
        mood: readiness.mood || 6, // Use actual mood value from form
        energizers: readiness.energisers_taken,
        illness: readiness.illness || false, // Use actual illness value from form
        alcohol: readiness.alcohol || false, // Use actual alcohol value from form
        workout_id: workout.id, // Link to this specific workout
      };
      
      console.log('🔄 Calling saveTodayReadiness with:', inputData);
      const realScore = await saveTodayReadiness(inputData);
      console.log('✅ Readiness saved with score:', realScore);
      
      // Also create the pre-workout checkin record for tracking
      const checkinResponse = await createCheckin.mutateAsync({
        answers: {
          ...readiness,
          energizers: readiness.energisers_taken
        },
        readiness_score: realScore
      });
      
      console.log('✅ Pre-workout checkin created:', checkinResponse);
      
      // Store readiness score for header display
      setReadinessScore(realScore);
      
      toastUtils({
        title: "Check-in complete",
        description: `Readiness score: ${Math.round(realScore)}/100${Object.keys(estimates).length > 0 ? ` • ${Object.keys(estimates).length} exercise estimates saved` : ''}.`
      });
      
      // Invalidate the shouldShowReadiness query to hide the popup
      queryClient.invalidateQueries({ queryKey: ['shouldShowReadiness', workout?.id, user?.id] });
      
      // Also invalidate estimate queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['missingEstimates'] });
      queryClient.invalidateQueries({ queryKey: ['needsEstimate'] });
      
    } catch (error) {
      console.error('Error saving readiness check:', error);
      toastUtils({
        title: "Error",
        description: "Failed to save readiness check.",
        variant: "destructive"
      });
    }
  };

  const handleSkipReadiness = async () => {
    try {
      // Get user's baseline readiness score or use default
      let defaultScore = 65; // Moderate default
      try {
        defaultScore = await getCurrentUserReadinessScore();
      } catch {
        // Keep default if can't get current score
      }
      
      // Create a special "skipped" checkin to prevent showing again
      await createCheckin.mutateAsync({ 
        answers: { skipped: true } as any, 
        readiness_score: defaultScore
      });
      
      // Set readiness score for display
      setReadinessScore(defaultScore);
      
      toastUtils({
        title: "Check-in skipped",
        description: `Using baseline readiness (${Math.round(defaultScore)}/100).`
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

        // Reset session timing store
        useSessionTiming.setState({
          sessionStartedAt: null,
          totalRestMs: 0,
          restStartedAt: null,
        });

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
          <EnhancedReadinessCheckIn
            workoutId={workout.id}
            onSubmit={handleReadinessSubmit}
            onAbort={handleAbortWorkout}
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
            <h1 className="text-lg font-semibold">
              {workout?.title || workout?.template?.name || 'Free Session'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SessionHeaderMeta 
              readiness={readinessScore}
              startedAt={workout?.started_at}
              endedAt={workout?.ended_at}
            />
            <Badge variant="secondary">
              🏋️ {(workout?.exercises?.findIndex((x: any) => x.id === currentExerciseId) ?? 0) + 1}/{workout?.exercises?.length || 0}
            </Badge>
          </div>
        </div>
      </div>

      <div className="p-4 pb-24 max-w-md mx-auto">
        {/* Error Banner - Show detailed error information */}
        {setLoggingError && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-destructive font-bold text-lg">❌ SET LOGGING FAILED</span>
            </div>
            <div className="text-sm text-destructive/90 font-mono bg-destructive/5 p-3 rounded border max-h-40 overflow-y-auto">
              {setLoggingError}
            </div>
            <div className="text-xs text-destructive/70 mt-2">
              Check console logs for full details. Report this error if it persists.
            </div>
          </div>
        )}
        
        {!workout?.exercises || workout.exercises.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No exercises found in this workout.</p>
          </div>
        ) : (
          <>
            {currentExercise && (
              <>
                {/* Show warmup if conditions are met and it should be displayed */}
                {!warmupCompleted && warmupsShown[resolveWorkoutExerciseId(currentExercise)] && (
                    <WarmupBlock
                     workoutExerciseId={resolveWorkoutExerciseId(currentExercise)}
                     unit="kg"
                     suggestedTopWeight={currentExercise?.target_weight_kg || currentExerciseEstimate?.estimated_weight || 60}
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
                 completed_sets: sets
                   .filter((set: any) => set.is_completed)
                   .sort((a: any, b: any) => (a.set_index || 0) - (b.set_index || 0))
                }}
                userId={userId}
                exerciseId={currentExercise?.exercise_id}
                templateTargetReps={currentExercise?.target_reps}
                templateTargetWeight={currentExercise?.target_weight_kg || currentExerciseEstimate?.estimated_weight}
                isLastExercise={(workout?.exercises?.findIndex((x: any) => x.id === currentExerciseId) ?? 0) === totalExercises - 1}
                onSetComplete={(setData) => {
                  // Hide warmup when first set is completed
                  setWarmupCompleted(true);
                  const weId = resolveWorkoutExerciseId(currentExercise);
                  handleSetComplete(weId, setData);
                }}
                onExerciseComplete={() => {
                  // Reset warmup for next exercise
                  setWarmupCompleted(false);
                  setHasExistingWarmupData(false);
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
                onUpdateSet={(setIndex, setData) => {
                  // Find the set to update by index
                  const setToUpdate = sets[setIndex];
                  if (setToUpdate?.id) {
                    updateSet({
                      setId: setToUpdate.id,
                      weight: setData.weight,
                      reps: setData.reps,
                      notes: setData.notes
                    }, {
                      onSuccess: () => {
                        toast.success('Set updated successfully!');
                      },
                      onError: (error) => {
                        console.error('Failed to update set:', error);
                        toast.error(`Failed to update set: ${error.message}`);
                      }
                    });
                  }
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
                {workout.exercises.sort((a: any, b: any) => a.order_index - b.order_index).map((ex: any, idx: number) => {
                  const label = `${idx + 1}. ${getExerciseDisplayName(ex)}`;
                  const isActive = ex.id === currentExercise?.id;
                  
                  return (
                    <Button
                      key={ex.id}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentExerciseId(ex.id)}
                      className="flex-shrink-0"
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>
              
              {/* Abort Workout Button */}
              <div className="pt-4 border-t">
                <Button
                  onClick={handleAbortWorkout}
                  variant="secondary"
                  className="w-full bg-muted text-muted-foreground hover:bg-muted/80"
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

      {/* Debug Area */}
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h3 className="font-bold mb-2">🚨 DEBUG INFO</h3>
        <div className="space-y-2 text-xs">
          <div>
            <strong>Workout ID:</strong> {workout?.id}
          </div>
          <div>
            <strong>Current Exercise Index:</strong> {(workout?.exercises?.findIndex((x: any) => x.id === currentExerciseId) ?? 0)}
          </div>
          <div>
            <strong>Total Exercises:</strong> {workout?.exercises?.length}
          </div>
          <div>
            <strong>Exercise Translation Hook Result:</strong> 
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(exerciseTranslation, null, 2)}</pre>
          </div>
          <div>
            <strong>Current Exercise Object:</strong>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(currentExercise, null, 2)}</pre>
          </div>
          <div>
            <strong>All Exercises with Names:</strong>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(workout?.exercises?.map((ex: any, i: number) => ({
              index: i,
              id: ex.id,
              exercise_id: ex.exercise_id,
              exercise: ex.exercise,
              displayName: getExerciseDisplayName(ex)
            })), null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}