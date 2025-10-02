import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getEquipmentRefId, getLoadType, getExerciseId } from '@/lib/workouts/equipmentContext';
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
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExerciseCard from './shim-ExerciseCard';
import { SmartSetForm } from '../sets';
import { SetFeelSelector } from '@/features/health/fitness/components/SetFeelSelector';
import { SetPrevTargetDisplay } from '@/features/health/fitness/components/SetPrevTargetDisplay';
import { WarmupEditor } from '@/features/health/fitness/components/WarmupEditor';
import { WorkoutRecalibration } from '@/features/health/fitness/components/WorkoutRecalibration';
import { GymConstraintsFilter } from '@/features/health/fitness/components/GymConstraintsFilter';
import { type Feel, FEEL_TO_RPE, FEEL_OPTIONS } from '@/features/health/fitness/lib/feelToRpe';
import { feelEmoji, parseFeelFromNotes } from '@/features/workouts/utils/feel';
import { useMyGym } from '@/features/health/fitness/hooks/useMyGym.hook';
import { useLogSet, useUpdateSet } from '../../hooks';
import { useAdvanceProgramState } from '@/hooks/useTrainingPrograms';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useExerciseTranslation } from '@/hooks/useExerciseTranslations';
import { useGrips, getGripIdByName } from '@/hooks/useGrips';
import { sanitizeUuid, isUuid } from '@/utils/ids';
import { buildSupabaseErrorMessage } from '@/workouts-sot/utils/supabaseError';
import { cn } from '@/lib/utils';
// import ImprovedWorkoutSession from '@/components/fitness/ImprovedWorkoutSession'; // REMOVED - using SOT components directly
import { WarmupBlock } from '@/components/fitness/WarmupBlock';
import { getExerciseDisplayName } from '../../utils/exerciseName';

// Add readiness check imports
import EnhancedReadinessCheckIn, { EnhancedReadinessData } from '@/components/fitness/EnhancedReadinessCheckIn';
import { useShouldShowReadiness } from '@/features/health/fitness/hooks/useShouldShowReadiness';
import { usePreWorkoutCheckin } from '@/features/health/fitness/hooks/usePreWorkoutCheckin';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import PageNav from "@/components/PageNav";

// Import missing SOT hooks and components
import { useExerciseEstimate, useWarmupSessionState, useWarmupManager } from '../../hooks';
import { submitWarmupFeedback } from '../../warmup';
import { SessionHeaderMeta } from './';
import { workoutKeys } from '../../api/workouts-api';

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
  // Simple direct database logging instead of complex hooks
  
  // Use proper auth hook - no race conditions
  const { user, loading: authLoading } = useAuth();
  
  // Session timing for workout tracking and rest timer
  const { startSession, startRest, stopRest, restStartedAt } = useSessionTiming();

  // Robust readiness check using the auth hook
  const { data: shouldShowReadiness, isLoading: isCheckingReadiness } = useShouldShowReadiness(workout?.id, user?.id);
  const { createCheckin } = usePreWorkoutCheckin(workout?.id);
  
  // Warmup session state for managing which warmups have been shown
  const { warmupsShown, setWarmupShown } = useWarmupSessionState();
  
  // Warmup context manager for dynamic warm-up counts
  const { resetSessionContext, logWorkingSet } = useWarmupManager();
  
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(() => {
    // Try to restore from localStorage first
    const key = `workout_${workout?.id}_currentExercise`;
    try {
      const stored = localStorage.getItem(key);
      if (stored && workout?.exercises?.some((ex: any) => ex.id === stored)) {
        return stored;
      }
    } catch {}
    // Fallback to first exercise
    return workout?.exercises?.sort((a: any, b: any) => a.order_index - b.order_index)?.[0]?.id ?? null;
  });
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [showWarmupEditor, setShowWarmupEditor] = useState(false);
  const [showRecalibration, setShowRecalibration] = useState(false);
  const [workoutStartTime] = useState(new Date());
  const [warmupCompleted, setWarmupCompleted] = useState(false);
  const [hasExistingWarmupData, setHasExistingWarmupData] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [readinessScore, setReadinessScore] = useState<number | undefined>(() => {
    // Try to restore readiness score from localStorage
    const key = `workout_${workout?.id}_readiness`;
    try {
      const stored = localStorage.getItem(key);
      return stored ? parseFloat(stored) : undefined;
    } catch {
      return undefined;
    }
  });

  // Grip selection state - per exercise
  const [selectedGrips, setSelectedGrips] = useState<Record<string, string[]>>({});
  const [showGripSelector, setShowGripSelector] = useState<Record<string, boolean>>({});
  
  // Mini-menu state for feel feedback
  const [currentSetFeel, setCurrentSetFeel] = useState<Feel | undefined>(undefined);
  const [currentSetPain, setCurrentSetPain] = useState<boolean>(false);
  const [showWarmup, setShowWarmup] = useState(false);
  
  // Edit set state
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [editSetData, setEditSetData] = useState<any>(null);
  
  // Set input state - always show for current set
  const [currentSetData, setCurrentSetData] = useState({
    weight: 0,
    reps: 0,
    rpe: 5,
    feel: '',
    notes: '',
    pain: false
  });

  // Initialize readiness store from localStorage and populate store on mount
  useEffect(() => {
    const initializeReadiness = async () => {
      if (readinessScore) {
        const { useReadinessStore } = await import('@/stores/readinessStore');
        useReadinessStore.getState().setScore(readinessScore);
      }
    };
    initializeReadiness();
  }, [readinessScore]);

  // Cleanup localStorage on component unmount (page refresh/navigation)
  useEffect(() => {
    return () => {
      // Don't clear on unmount since user might be refreshing
      // Only clear when workout is actually completed via handleWorkoutComplete
    };
  }, []);

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

  // Calculate sets data early so it can be used in useEffect - ALWAYS SORT BY set_index
  const sets = useMemo(() => {
    const rawSets = currentExercise?.sets || [];
    return [...rawSets].sort((a, b) => (a.set_index ?? 0) - (b.set_index ?? 0));
  }, [currentExercise?.sets]);
  
  const completedSetsCount = sets.filter((set: any) => set.is_completed).length;
  

  // Check if warmup feedback was already given AND auto-open if not
  useEffect(() => {
    const checkWarmupFeedback = async () => {
      if (currentExercise) {
        const weId = resolveWorkoutExerciseId(currentExercise);
        const { data } = await supabase
          .from('workout_exercises')
          .select('warmup_feedback, warmup_feedback_at')
          .eq('id', weId)
          .maybeSingle();
        
        const hasGivenFeedback = data?.warmup_feedback && data?.warmup_feedback_at;
        
        // Set warmup completed state
        setWarmupCompleted(!!hasGivenFeedback);
        
        // Auto-open warmup if:
        // 1. No feedback has been given yet
        // 2. No sets have been completed yet
        if (!hasGivenFeedback && completedSetsCount === 0) {
          setShowWarmup(true);
        } else {
          setShowWarmup(false);
        }
      }
    };
    checkWarmupFeedback();
  }, [currentExercise, completedSetsCount]);

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
  
  const targetSetsCount = currentExercise?.target_sets || 3;
  const currentSetNumber = completedSetsCount + 1;
  
  // Find current set index (first non-completed set)
  const currentSetIndex = useMemo(() => {
    const index = sets.findIndex(s => !s.is_completed);
    // If all sets completed, cap at target sets to prevent "Log Set 4" when only 3 sets
    if (index === -1) {
      return Math.min(sets.length, targetSetsCount - 1);
    }
    return index;
  }, [sets, targetSetsCount]);

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
    
    try {
      console.log('✅ Logging set for exercise:', workoutExerciseId);
      console.log('✅ Set data:', setData);

      // Query database directly for current MAX set_index to avoid race conditions
      const { data: maxSetData, error: maxError } = await supabase
        .from('workout_sets')
        .select('set_index')
        .eq('workout_exercise_id', workoutExerciseId)
        .order('set_index', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxError) {
        console.error('❌ Error getting max set_index:', maxError);
        throw maxError;
      }

      const nextSetIndex = (maxSetData?.set_index ?? -1) + 1;
      console.log('✅ Current max from DB:', maxSetData?.set_index, '→ Next set index:', nextSetIndex);

      // Use simple direct Supabase insert
      const { error } = await supabase
        .from('workout_sets')
        .insert({
          workout_exercise_id: workoutExerciseId,
          set_index: nextSetIndex,
          weight_kg: setData.weight || null,
          weight: setData.weight || null,
          weight_unit: 'kg',
          reps: setData.reps || null,
          rpe: setData.feel ? FEEL_TO_RPE[setData.feel] : null,
          notes: setData.notes || null,
          is_completed: true,
          completed_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Failed to log set - FULL ERROR DETAILS:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        
        const errorMsg = buildSupabaseErrorMessage(error, 'Set Logging');
        toastUtils({
          title: "Set Save Failed",
          description: errorMsg,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Set logged successfully with simple insert');
      
      // Start rest timer after logging set (except for last set of exercise)
      // Use the already-calculated completedSetsCount and add 1 for the set we just logged
      const newCompletedCount = completedSetsCount + 1;
      const targetCount = currentExercise?.target_sets || 3;
      
      console.log('🕐 Rest timer check:', { newCompletedCount, targetCount });
      
      if (newCompletedCount < targetCount) {
        console.log('🕐 Starting rest timer after set completion');
        startRest();
      } else {
        console.log('🕐 Last set - stopping rest timer');
        stopRest();
      }
      
      // Force immediate refetch to update UI with new set
      await queryClient.invalidateQueries({ queryKey: workoutKeys.byId(workout?.id) });
      await queryClient.refetchQueries({ queryKey: workoutKeys.byId(workout?.id) });
      
      toastUtils({
        title: "Set Logged",
        description: `${setData.weight || 0}kg × ${setData.reps || 0} reps`,
      });

    } catch (error) {
      console.error('❌ handleSetComplete CATCH ERROR - FULL DETAILS:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error constructor:', error?.constructor?.name);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      
      const errorMsg = buildSupabaseErrorMessage(error, 'Set Logging - Catch Block');
      toastUtils({
        title: "Set Save Failed",
        description: errorMsg,
        variant: "destructive"
      });
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
        // Persist the exercise progression
        try {
          localStorage.setItem(`workout_${workout?.id}_currentExercise`, nextExercise.id);
        } catch (error) {
          console.warn('Failed to persist current exercise:', error);
        }
      }
    }
  };

  const handleWorkoutComplete = async () => {
    try {
      // Clean up localStorage when workout is completed
      localStorage.removeItem(`workout_${workout?.id}_currentExercise`);
      localStorage.removeItem(`workout_${workout?.id}_readiness`);
      
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

  const handleFinishWorkout = async () => {
    // If this workout is part of a program, advance the progress
    if (workout.program_id && workout.program_position) {
      try {
        await supabase.rpc('advance_program_progress', {
          p_program_id: workout.program_id,
          p_user_id: workout.user_id,
          p_position: workout.program_position,
          p_workout_id: workout.id
        });
      } catch (progError) {
        console.error('Failed to advance program progress:', progError);
        // Don't fail the workout completion if this fails
      }
    }
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
        energizers: readiness.energisers_taken, // Fixed: use US spelling for saveTodayReadiness
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
      
      // Store readiness score for header display AND persistence
      setReadinessScore(realScore);
      
      // Update the readiness store as well
      const { useReadinessStore } = await import('@/stores/readinessStore');
      useReadinessStore.getState().setScore(realScore);
      
      try {
        localStorage.setItem(`workout_${workout?.id}_readiness`, realScore.toString());
      } catch (error) {
        console.warn('Failed to persist readiness score:', error);
      }
      
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
            <div>
              {workout.program_id && (
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm text-primary font-medium">
                    Program: {workout.training_programs?.name || 'Unknown Program'}
                  </span>
                </div>
              )}
              <h1 className="text-lg font-semibold">
                {workout?.title || workout?.template?.name || 'Free Session'}
              </h1>
            </div>
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
        
        {!workout?.exercises || workout.exercises.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No exercises found in this workout.</p>
          </div>
        ) : (
          <>
            {currentExercise && (
              <>
                {/* SOT Set Form - Direct usage instead of ImprovedWorkoutSession wrapper */}
                <div className="space-y-4">
                  <div className="bg-card border rounded-lg p-4">
                    {/* 🎯 LEGACY MINI-MENU: Exercise Header with grips/sets/warmup buttons */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {getExerciseName()}
                        </h3>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          title="Change grips"
                        >
                          ✋
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          title="Configure sets"
                        >
                          🔢
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => setShowWarmup(!showWarmup)}
                          title={showWarmup ? "Hide warmup" : "Show warmup"}
                        >
                          🤸
                        </Button>
                      </div>
                      <Badge variant="secondary">
                        {completedSetsCount}/{targetSetsCount} sets
                      </Badge>
                    </div>

                    {/* 🎯 LEGACY MINI-MENU: Warmup Block */}
                    {showWarmup && (
                      <div className="mb-4 bg-muted/50 border rounded-lg p-4">
                        <WarmupBlock
                          workoutExerciseId={resolveWorkoutExerciseId(currentExercise)}
                          existingFeedback={null}
                          onFeedbackGiven={async () => {
                            console.log('Warmup feedback given');
                            setShowWarmup(false);
                            setWarmupCompleted(true);
                            // Refetch to update UI
                            await queryClient.invalidateQueries({ queryKey: workoutKeys.byId(workout?.id) });
                          }}
                          onClose={() => setShowWarmup(false)}
                        />
                      </div>
                    )}
                    
                    {/* Completed Sets - with proper weight display and edit dialog */}
                    {sets.filter(set => set.is_completed).map((set, index) => {
                      const displayWeight = set.weight_kg || set.weight || 0;
                      const feel = parseFeelFromNotes(set.notes);
                      const emoji = feelEmoji(feel);
                      
                      // Calculate total load for bodyweight exercises
                      const isBodyweight = currentExercise?.load_mode === 'bodyweight_plus_optional' || 
                                          currentExercise?.exercise?.load_mode === 'bodyweight_plus_optional';
                      const totalLoad = isBodyweight && displayWeight !== 0 
                        ? `BW${displayWeight > 0 ? '+' : ''}${displayWeight}kg`
                        : displayWeight > 0 ? `${displayWeight}kg` : '';
                      
                      return (
                        <Card key={set.id || index} className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">Set</span>
                              <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                                {(set.set_index ?? index) + 1}
                              </Badge>
                      <span className="font-medium">
                                {totalLoad || (set.reps && isBodyweight ? 'BW' : '')}
                                {((totalLoad || (set.reps && isBodyweight)) && set.reps) ? ' × ' : ''}
                                {set.reps ? `${set.reps} reps` : ''}
                                {emoji ? ` ${emoji}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => {
                                  setEditingSetIndex(index);
                                  setEditSetData({
                                    weight: displayWeight,
                                    reps: set.reps || 0,
                                    setId: set.id
                                  });
                                }}
                              >
                                ✏️
                              </Button>
                              <Badge variant="default" className="text-xs bg-green-500">
                                ✓ Done
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      );
                    })}

                    {/* Current Set Entry - ONLY show if not complete */}
                    {completedSetsCount < targetSetsCount && (
                      <Card className="p-4 border-primary/20 bg-primary/5">
                        <div className="space-y-4">
                          {/* Set X Current Set Title - EXACT OLD CODE */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="font-medium">Set</span>
                              <Badge className="w-8 h-8 rounded-full flex items-center justify-center">
                                {currentSetIndex + 1}
                              </Badge>
                              <span className="font-medium">Current Set</span>
                            </div>
                          </div>

                          {/* Previous Set and Target Display - EXACT OLD CODE */}
                          <SetPrevTargetDisplay
                            userId={user?.id}
                            exerciseId={currentExercise?.exercise_id}
                            setIndex={currentSetIndex}
                            templateTargetReps={currentExercise?.target_reps}
                            templateTargetWeight={currentExercise?.target_weight}
                            currentSetNumber={currentSetIndex + 1}
                            onApplyTarget={(weight, reps) => {
                              console.log('🎯 Applying target from SetPrevTargetDisplay:', { weight, reps });
                              setCurrentSetData(prev => ({ ...prev, weight, reps }));
                            }}
                          />

                          <SmartSetForm
                          exercise={currentExercise}
                          workoutExerciseId={resolveWorkoutExerciseId(currentExercise)}
                          setIndex={currentSetIndex}
                          targetWeight={currentSetData.weight}
                          targetReps={currentSetData.reps}
                          feel={currentSetFeel}
                          onLogged={async () => {
                            console.log('✅ Set logged successfully via SOT SmartSetForm');
                            
                            // Start rest timer if not the last set
                            const newCompletedCount = completedSetsCount + 1;
                            if (newCompletedCount < targetSetsCount) {
                              console.log('🕐 Starting rest timer after set completion');
                              startRest();
                            }
                            
                            // Reset feel after logging
                            setCurrentSetFeel(undefined);
                            setCurrentSetPain(false);
                            
                            // Force immediate refetch to update UI
                            await queryClient.invalidateQueries({ queryKey: workoutKeys.byId(workout?.id) });
                            await queryClient.refetchQueries({ queryKey: workoutKeys.byId(workout?.id) });
                          }}
                          className="space-y-4"
                        />
                        
                        {/* 🎯 LEGACY MINI-MENU: Feel Selector - Exact copy from legacy */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium">How did that feel?</label>
                          <div className="grid grid-cols-5 gap-1">
                            {FEEL_OPTIONS.map((option) => (
                              <Button
                                key={option.value}
                                variant={currentSetFeel === option.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentSetFeel(option.value)}
                                className="flex flex-col items-center p-1 min-w-[60px] h-14"
                              >
                                <span className="text-lg">{option.emoji}</span>
                                <span className="text-xs font-medium">{option.value}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* 🎯 LEGACY MINI-MENU: Pain Toggle - Exact copy from legacy */}
                        <Button
                          variant={currentSetPain ? "destructive" : "outline"}
                          onClick={() => setCurrentSetPain(!currentSetPain)}
                          className={cn(
                            "w-full",
                            currentSetPain 
                              ? "bg-red-500 text-white hover:bg-red-600 border-red-500" 
                              : "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
                          )}
                          size="sm"
                        >
                          {currentSetPain ? '⚠ Pain reported 🔄' : '🔄 No pain 💢'}
                        </Button>
                        </div>
                      </Card>
                    )}

                    {/* Exercise Complete Message - OLD EXACT CODE */}
                    {completedSetsCount >= targetSetsCount && (
                      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                        <CardContent className="pt-6 text-center space-y-4">
                          <div className="text-2xl">🎉</div>
                          {currentExercise?.id === workout?.exercises[workout.exercises.length - 1]?.id ? (
                            <>
                              <div className="text-lg font-semibold text-green-700">
                                Congrats. You finished last exercise!
                              </div>
                              <div className="text-sm text-green-600">
                                {completedSetsCount} sets completed
                              </div>
                              <div className="space-y-2">
                                <Button onClick={() => navigate('/dashboard')} className="w-full" size="lg">
                                  Finish Workout
                                </Button>
                                <Button 
                                  onClick={() => {
                                    // TODO: Add extra set functionality
                                    console.log('Add extra set');
                                  }} 
                                  variant="outline" 
                                  className="w-full" 
                                  size="lg"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Extra Set
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-lg font-semibold text-green-700">
                                Exercise Complete!
                              </div>
                              <div className="text-sm text-green-600">
                                {completedSetsCount} sets completed
                              </div>
                              <div className="space-y-2">
                                <Button onClick={() => {
                                  // Move to next exercise
                                  const currentIdx = workout.exercises.findIndex((ex: any) => ex.id === currentExercise?.id);
                                  if (currentIdx < workout.exercises.length - 1) {
                                    const nextEx = workout.exercises[currentIdx + 1];
                                    setCurrentExerciseId(nextEx.id);
                                    try {
                                      localStorage.setItem(`workout_${workout?.id}_currentExercise`, nextEx.id);
                                    } catch (error) {
                                      console.warn('Failed to persist current exercise:', error);
                                    }
                                  }
                                }} className="w-full" size="lg">
                                  Next Exercise
                                </Button>
                                <Button 
                                  onClick={() => {
                                    // TODO: Add extra set functionality
                                    console.log('Add extra set');
                                  }} 
                                  variant="outline" 
                                  className="w-full" 
                                  size="lg"
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Extra Set
                                </Button>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
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
                      onClick={() => {
                        setCurrentExerciseId(ex.id);
                        // Persist the current exercise selection
                        try {
                          localStorage.setItem(`workout_${workout?.id}_currentExercise`, ex.id);
                        } catch (error) {
                          console.warn('Failed to persist current exercise:', error);
                        }
                      }}
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

      {/* Edit Set Dialog */}
      {editingSetIndex !== null && editSetData && (
        <Dialog open={true} onOpenChange={() => {
          setEditingSetIndex(null);
          setEditSetData(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Set {editingSetIndex + 1}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (kg)</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditSetData((prev: any) => ({ ...prev, weight: prev.weight - 2.5 }))}
                  >
                    -2.5
                  </Button>
                  <input
                    type="number"
                    className="flex-1 px-3 py-2 border rounded-md"
                    value={editSetData.weight || ''}
                    onChange={(e) => setEditSetData((prev: any) => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditSetData((prev: any) => ({ ...prev, weight: prev.weight + 2.5 }))}
                  >
                    +2.5
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reps</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditSetData((prev: any) => ({ ...prev, reps: Math.max(0, prev.reps - 1) }))}
                  >
                    -1
                  </Button>
                  <input
                    type="number"
                    className="flex-1 px-3 py-2 border rounded-md"
                    value={editSetData.reps || ''}
                    onChange={(e) => setEditSetData((prev: any) => ({ ...prev, reps: parseInt(e.target.value) || 0 }))}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditSetData((prev: any) => ({ ...prev, reps: prev.reps + 1 }))}
                  >
                    +1
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditingSetIndex(null);
                    setEditSetData(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={async () => {
                    try {
                      // Update the set using Supabase
                      const { error } = await supabase
                        .from('workout_sets')
                        .update({
                          weight_kg: editSetData.weight,
                          weight: editSetData.weight,
                          reps: editSetData.reps
                        })
                        .eq('id', editSetData.setId);

                      if (error) throw error;

                      toast.success('Set updated successfully');
                      
                      // Refetch workout data
                      await queryClient.invalidateQueries({ queryKey: workoutKeys.byId(workout?.id) });
                      await queryClient.refetchQueries({ queryKey: workoutKeys.byId(workout?.id) });
                      
                      // Close dialog
                      setEditingSetIndex(null);
                      setEditSetData(null);
                    } catch (error) {
                      console.error('Failed to update set:', error);
                      toast.error('Failed to update set');
                    }
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

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

      {/* Debug Panel - Only show if debug mode is enabled */}
      {/* TODO: Connect to actual debug toggle */}
      {false && (
        <div className="pb-4">
          {/* WorkoutDebugPanel will be added here when debug items are collected */}
        </div>
      )}
    </div>
  );
}
