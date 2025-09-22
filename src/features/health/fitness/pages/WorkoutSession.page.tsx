import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useAddExerciseToWorkout, useAddSet, useDeleteWorkout, useSearchExercises, useUserSettings, useUpsertUserSettings, useWorkoutDetail, useCombinedMetrics } from "@/features/health/fitness/services/fitness.api";
import { useEndWorkout } from "@/features/workouts/api/workouts.api"; // Use the correct endWorkout
import { supabase } from "@/integrations/supabase/client";
import DynamicMetricsForm from "@/components/DynamicMetricsForm";
import { useToast } from "@/hooks/use-toast";

import { useTranslations } from "@/hooks/useTranslations";
import EnhancedReadinessCheckIn, { EnhancedReadinessData } from "@/components/fitness/EnhancedReadinessCheckIn";
import { usePreWorkoutCheckin } from "@/features/health/fitness/hooks/usePreWorkoutCheckin";
import { useShouldShowReadiness } from "@/features/health/fitness/hooks/useShouldShowReadiness";
import { useWorkoutHasLoggedSets } from "@/features/workouts/hooks/useWorkoutHasLoggedSets";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import EffortChips, { EffortRating } from "@/features/health/fitness/components/EffortChips";
import TenRMEstimateModal from "@/features/health/fitness/components/TenRMEstimateModal";
import { getExerciseNameFromTranslations } from "@/utils/exerciseTranslations";
import WarmupFeedback from "@/features/health/fitness/components/WarmupFeedback";
import { generateQuickWarmup } from "@/features/health/fitness/utils/warmupGenerator";
import RestTimer from "@/components/fitness/RestTimer";
import WorkoutClock from "@/components/fitness/WorkoutClock";
import { useSetSuggestion, useRestSuggestion } from "@/hooks/useWorkoutSuggestions";
import { useRestTimer } from "@/hooks/useRestTimer";
import { useWorkoutFlow } from "@/hooks/useWorkoutFlow";
import { useMyGym } from "@/features/health/fitness/hooks/useMyGym.hook";
import { Settings, Timer, Trash2 } from "lucide-react";
import SmartSetForm from "@/components/workout/set-forms/SmartSetForm";
import { useWarmupManager } from "@/features/workouts/hooks/useWarmupManager";
import WorkoutDebugBox from "@/components/debug/WorkoutDebugBox";
import { WORKOUT_FLOW_VERSION } from "@/constants/workoutFlow";

const useSEO = (titleAddon: string) => {
  React.useEffect(() => {
    document.title = `${titleAddon} | Workout Session`;
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Log your sets, weight, reps, and RPE in this workout session.');
    document.head.appendChild(desc);
  }, [titleAddon]);
};

const UnitToggle: React.FC = () => {
  const { data: settings } = useUserSettings();
  const upsert = useUpsertUserSettings();
  const unit = settings?.unit_weight ?? 'kg';
  return (
    <div className="flex items-center gap-2 text-sm">
      <span>Unit:</span>
      <Button size="sm" variant={unit === 'kg' ? 'default' : 'outline'} onClick={() => upsert.mutate({ unit_weight: 'kg' })}>kg</Button>
      <Button size="sm" variant={unit === 'lb' ? 'default' : 'outline'} onClick={() => upsert.mutate({ unit_weight: 'lb' })}>lb</Button>
    </div>
  );
};

const WorkoutSession: React.FC = () => {
  const { getTranslatedName } = useTranslations();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data } = useWorkoutDetail(id);
  const { gym: selectedGym } = useMyGym();
  const queryClient = useQueryClient();
  useSEO(data?.workout?.title || 'Session');

  // Use proper auth hook - no race conditions
  const { user, loading: authLoading } = useAuth();

  // Robust readiness check using the auth hook
  const { data: shouldShowReadiness, isLoading: isCheckingReadiness } = useShouldShowReadiness(id, user?.id);
  const { createCheckin } = usePreWorkoutCheckin(id);

  const endMut = useEndWorkout();
  const { mutate: deleteWorkoutMutation, isPending: isDeletingWorkout } = useDeleteWorkout();
  const [showAbortDialog, setShowAbortDialog] = useState(false);
  const addExMut = useAddExerciseToWorkout();
  const addSetMut = useAddSet();

  const [q, setQ] = React.useState("");
  const { data: search } = useSearchExercises(q);
  const [metricValues, setMetricValues] = React.useState<Record<string, Record<string, any>>>({});
  
  // Enhanced workout state
  const [currentSetEffort, setCurrentSetEffort] = useState<EffortRating>();
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(180);
  const [lastCompletedSetId, setLastCompletedSetId] = useState<string>();
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [showRMModal, setShowRMModal] = useState<{exerciseId: string, exerciseName: string} | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [currentSetData, setCurrentSetData] = useState<{effort?: EffortRating, hadPain?: boolean}>({});
  
  // Warmup context manager for dynamic warm-up counts
  const { resetSessionContext, logWorkingSet } = useWarmupManager();
  

  // Hooks for suggestions and timers
  const { state: timerState, actions: timerActions } = useRestTimer(restDuration, () => {
    setShowRestTimer(false);
    toast({ title: "Rest complete!", description: "Ready for your next set." });
  });

  const endWorkout = async () => {
    if (!id) return;
    await endMut.mutateAsync(id);
    toast({ title: "Workout ended", description: "Session marked as complete." });
    navigate('/fitness/history');
  };

  const deleteWorkout = async () => {
    if (!id) return;
    try {
      await deleteWorkoutMutation(id);
      toast({ title: "Workout deleted", description: "Workout has been permanently removed." });
      navigate('/dashboard');
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to delete workout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addExercise = async (exerciseId: string) => {
    if (!id) return;
    await addExMut.mutateAsync({ workoutId: id, exerciseId });
    setQ("");
  };

  // New handler for adaptive sets (bilateral/unilateral)
  const handleSetSubmit = async (workoutExerciseId: string, setData: any) => {
    try {
      const result = await addSetMut.mutateAsync({
        workoutExerciseId,
        payload: setData
      });
      
      setCurrentSetData({});
      
      // Store the set ID for effort tracking
      setLastCompletedSetId(result?.id || Math.random().toString());
      
      // Log working set to warmup context for future warm-up planning (only for working sets)
      const isWorkingSet = setData.weight > 0 && setData.reps > 0; // Basic check for working set
      if (isWorkingSet) {
        try {
          await logWorkingSet(workoutExerciseId);
          console.log('✅ Logged working set to warmup context');
        } catch (contextError) {
          console.error('Failed to log working set to context:', contextError);
          // Don't block the set logging for context issues
        }
      }
      
      const description = setData.weight 
        ? `Added ${setData.weight}kg × ${setData.reps} reps`
        : `Added unilateral set`;
      
      toast({
        title: "Set added!",
        description,
      });
    } catch (error) {
      console.error('Error in handleSetSubmit:', error);
      toast({
        title: "Error",
        description: "Failed to add set. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addSet = async (workoutExerciseId: string, form: HTMLFormElement) => {
    try {
      const fd = new FormData(form);
      
      const reps = fd.get("reps");
      const weight = fd.get("weight");
      const rpe = fd.get("rpe");
      const notes = fd.get("notes");
      const unit = fd.get("unit");
      
      // Validate required fields
      if (!reps || !weight) {
        toast({
          title: "Missing data",
          description: "Please enter both weight and reps.",
          variant: "destructive"
        });
        return;
      }
      
      const payload = {
        reps: parseInt(reps as string),
        weight: parseFloat(weight as string),
        rpe: rpe ? parseFloat(rpe as string) : undefined,
        notes: notes ? String(notes) : undefined,
        weight_unit: String(unit),
        effort_rating: currentSetData.effort,
        had_pain: currentSetData.hadPain || false,
      };
      
      const result = await addSetMut.mutateAsync({
        workoutExerciseId,
        payload
      });
      
      form.reset();
      setCurrentSetData({});
      
      // Store the set ID for effort tracking
      setLastCompletedSetId(result?.id || Math.random().toString());
      
      // Log working set to warmup context for future warm-up planning (only for working sets)
      const isWorkingSet = payload.weight > 0 && payload.reps > 0; // Basic check for working set
      if (isWorkingSet) {
        try {
          await logWorkingSet(workoutExerciseId);
          console.log('✅ Logged working set to warmup context');
        } catch (contextError) {
          console.error('Failed to log working set to context:', contextError);
          // Don't block the set logging for context issues
        }
      }
      
      toast({
        title: "Set added!",
        description: `Added ${payload.weight}kg × ${payload.reps} reps`,
      });
    } catch (error) {
      console.error('Error in addSet function:', error);
      toast({
        title: "Error",
        description: "Failed to add set. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEffortSelect = (effort: EffortRating) => {
    setCurrentSetEffort(effort);
    
    // Calculate rest time based on effort (-2 = very hard, +2 = very easy)
    const restTimes: Record<EffortRating, number> = {
      2: 60,   // very easy
      1: 90,   // easy
      0: 180,  // moderate
      [-1]: 240, // hard
      [-2]: 300, // very hard
    };
    
    const suggestedRest = restTimes[effort];
    setRestDuration(suggestedRest);
    setShowRestTimer(true);
    timerActions.setDuration(suggestedRest);
    timerActions.start();
    
    const effortLabel = effort === 2 ? 'very easy' : effort === 1 ? 'easy' : effort === 0 ? 'moderate' : effort === -1 ? 'hard' : 'very hard';
    toast({
      title: "Set completed!",
      description: `${effortLabel} effort - Rest for ${Math.floor(suggestedRest / 60)}:${(suggestedRest % 60).toString().padStart(2, '0')}`,
    });
  };

  const handlePainReport = () => {
    toast({
      title: "Pain reported",
      description: "Consider stopping this exercise or reducing intensity.",
      variant: "destructive",
    });
    // Could log pain event here
  };

  const handleReadinessSubmit = async (enhancedData: EnhancedReadinessData) => {
    try {
      const { readiness } = enhancedData;
      // Calculate a simple readiness score (0-10 based on answers)
      const score = calculateReadinessScore(readiness);
      
      await createCheckin.mutateAsync({
        answers: readiness,
        readiness_score: score
      });
      
      toast({
        title: "Readiness recorded",
        description: "Your pre-workout check-in has been saved."
      });
      
      // Invalidate the shouldShowReadiness query to hide the popup
      queryClient.invalidateQueries({ queryKey: ['shouldShowReadiness', id, user?.id] });
    } catch (error) {
      console.error('Error saving readiness check:', error);
      toast({
        title: "Error",
        description: "Failed to save readiness check.",
        variant: "destructive"
      });
    }
  };

  // Simple readiness score calculation
  const calculateReadinessScore = (readinessData: any): number => {
    let score = 10;
    if (readinessData.illness) score -= 3;
    if (readinessData.sleep_quality < 5) score -= 2;
    if (readinessData.energy < 5) score -= 2;
    return Math.max(0, Math.min(10, score));
  };

  const handleAbortWorkout = () => {
    if (!data?.workout?.id) return;
    
    deleteWorkoutMutation(data.workout.id, {
      onSuccess: () => {
        toast({
          title: "Workout deleted",
          description: "Your workout has been completely removed.",
        });
        navigate('/fitness');
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to delete workout. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const handleSkipReadiness = () => {
    // Create a special "skipped" checkin to prevent showing again
    createCheckin.mutate({ 
      answers: { skipped: true }, 
      readiness_score: 5 // neutral score for skipped
    });
  };

  const unit = (useUserSettings().data?.unit_weight ?? 'kg');
  
  // Reset warmup context when workout starts
  React.useEffect(() => {
    if (data?.workout?.started_at && !data?.workout?.ended_at) {
      resetSessionContext();
    }
  }, [data?.workout?.started_at, data?.workout?.ended_at, resetSessionContext]);

  // Calculate total sets for workout clock
  const totalSets = (data?.exercises || []).reduce((total, ex) => {
    return total + (data?.setsByWe[ex.id] || []).length;
  }, 0);
  
  const completedSets = (data?.exercises || []).reduce((total, ex) => {
    return total + (data?.setsByWe[ex.id] || []).filter(set => set.is_completed).length;
  }, 0);
  // Robust decision logic - no race conditions
  const needsReadiness = shouldShowReadiness === true;
  
  // DEBUG: Log the readiness check logic
  console.log('🔍 READINESS DEBUG (FIXED):', {
    workoutId: id,
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
  console.log('🚨 READINESS CHECK DECISION:', needsReadiness);
  if (needsReadiness) {
    console.log('🎯 RENDERING READINESS CHECK');
    return (
      <>
        <PageNav current="Pre-Workout Check" />
        <main className="container py-6 flex items-center justify-center min-h-[60vh] pb-32">
          <EnhancedReadinessCheckIn
            workoutId={id}
            onSubmit={handleReadinessSubmit}
          />
        </main>
      </>
    );
  }

  // DEBUG: Log when we reach main workout view
  console.log('🎯 SHOWING MAIN WORKOUT VIEW');

  // === DEBUG STEP 2 (safe) ===
  const workoutIdFromUrl =
    (typeof window !== "undefined" && window.location.pathname.split("/").pop()) || null;

  const workoutTitle =
    (data?.workout?.title ?? data?.workout?.name ?? null);

  const exerciseCount =
    Array.isArray(data?.workout?.exercises) ? data.workout.exercises.length :
    null;

  const sourceHint: "rpc" | "rest" | "unknown" =
    Array.isArray(data?.workout?.exercises) ? "rpc" : "unknown";

  const debugData = {
    workoutId: data?.workout?.id ?? workoutIdFromUrl,
    templateId: data?.workout?.template_id ?? null,
    title: data?.workout?.title ?? data?.workout?.name ?? null,
    readiness: data?.workout?.readiness_score ?? null,
    exerciseCount,
    routerPath: typeof window !== "undefined" ? window.location.pathname + window.location.search : "",
    sourceHint,
    lastError: null,
    userId: data?.workout?.user_id ?? null,      // NEW
    programId: data?.workout?.program_id ?? null, // NEW
    exercisesPreview: Array.isArray(data?.workout?.exercises)
      ? data.workout.exercises.map((x: any) => ({
          id: x.id,
          exercise_id: x.exercise_id,
          display_name: x.display_name,
          order_index: x.order_index
        }))
      : null,
  };
  // === /DEBUG STEP 2 ===

  console.log('🐛 DEBUG BOX RENDER:', debugData);

  return (
    <div>
      {/* DEBUG BOX - ALWAYS VISIBLE AT TOP */}
      <div style={{
        width: '100%',
        background: '#dc2626',
        color: 'white',
        padding: '16px',
        margin: '0 0 16px 0',
        fontSize: '14px',
        fontFamily: 'monospace',
        borderRadius: '8px'
      }}>
        <div style={{marginBottom: '8px'}}>
          <strong>DEBUG • v109.2-debug-step2 • workoutId: {debugData.workoutId || '—'}</strong>
        </div>
        <pre style={{fontSize: '12px', whiteSpace: 'pre-wrap', margin: 0}}>
          {JSON.stringify(debugData, null, 2)}
        </pre>
      </div>

      <PageNav current="Workout Session" />
      
      <main className="container p-fluid-s space-y-fluid-s pb-safe-area-bottom">
        {/* Header with workout clock */}
        <div className="space-y-fluid-xs">
          {/* Current Gym Header */}
          {selectedGym && (
            <div className="flex items-center justify-between p-fluid-xs bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-semibold text-fluid-sm text-muted-foreground">Current Gym</h3>
                  <p className="font-medium text-fluid-base">{selectedGym.name}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate('/dashboard?cat=health&sub=configure')}
                  className="touch-target"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={endWorkout} disabled={endMut.isPending} size="sm" className="touch-target">
                End Workout
              </Button>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">
              {data?.workout?.title || (data?.exercises?.length > 0 ? 'Template Workout' : 'Free Session')}
            </h1>
            <div className="flex items-center gap-3">
              <UnitToggle />
              <Button variant="secondary" onClick={() => navigate('/fitness')}>Back</Button>
            </div>
          </div>
          
          {data?.workout?.started_at && (
            <WorkoutClock
              startedAt={data.workout.started_at}
              totalSets={totalSets}
              completedSets={completedSets}
            />
          )}
        </div>

        <section className="grid lg:grid-cols-4 gap-fluid-s">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Exercises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-fluid-s">
              {(data?.exercises || []).map((ex, index) => {
                const isActive = activeExerciseId === ex.id || (!activeExerciseId && index === 0);
                const completedSets = (data?.setsByWe[ex.id] || []).filter(set => set.is_completed);
                const isCompleted = completedSets.length > 0;
                
                return (
                  <div key={ex.id} className="border rounded-md overflow-hidden">
                    {/* Exercise Header - Always Visible */}
                    <div 
                      className="p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setActiveExerciseId(isActive ? null : ex.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{(() => {
                            const exerciseTranslations = Array.isArray(ex.exercises?.translations) ? ex.exercises.translations : [];
                            return getExerciseNameFromTranslations(exerciseTranslations, ex.exercises?.id) || 'Unknown Exercise';
                          })()}</h3>
                          {isCompleted && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                              {completedSets.length} sets
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">#{ex.order_index}</span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {isActive ? '−' : '+'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Collapsed Summary */}
                      {!isActive && isCompleted && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Last: {completedSets[completedSets.length - 1]?.weight || '-'}kg × {completedSets[completedSets.length - 1]?.reps || '-'} reps
                        </div>
                      )}
                    </div>
                    
                    {/* Exercise Details - Expandable */}
                    {isActive && (
                      <div className="p-4 border-t bg-background">
                        {/* Show warmup suggestions */}
                        {(() => {
                          // Get the target weight for the first working set (estimate based on previous sessions or default)
                          const targetWeight = 60; // This would come from exercise history or estimates
                          const warmup = generateQuickWarmup(ex.exercises?.id || '', targetWeight);
                          
                          if (warmup.warmupSets.length > 0) {
                            return (
                              <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">🔥 Warmup Plan</h4>
                                <div className="space-y-1">
                                  {warmup.warmupSets.map((set, idx) => (
                                    <div key={idx} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                      <span>Set {set.setIndex}:</span>
                                      <span>{set.weight}kg × {set.reps} reps</span>
                                      <span className="text-blue-500">({set.restSeconds}s rest)</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Show completed sets */}
                        <div className="space-y-2 mb-4">
                          {completedSets.map(set => (
                            <div key={set.id} className="flex items-center gap-3 text-sm p-2 bg-muted/20 rounded">
                              <span className="w-12 font-medium">Set {set.set_index}</span>
                              <span className="w-24">{set.weight ?? '-'} {set.weight ? unit : ''}</span>
                              <span className="w-16">× {set.reps ?? '-'}</span>
                              <span className="w-16">RPE {set.rpe ?? '-'}</span>
                              <span className="text-muted-foreground text-xs">{set.notes || ''}</span>
                            </div>
                          ))}
                          {completedSets.length === 0 && (
                            <p className="text-sm text-muted-foreground">No completed sets yet. Add your first set below.</p>
                          )}
                        </div>
                        
                         {/* Use SmartSetForm for exercise-specific forms */}
                         <SmartSetForm 
                           workoutExerciseId={ex.id}
                           exercise={ex}
                           setIndex={completedSets.length + 1}
                           onLogged={() => queryClient.invalidateQueries({ queryKey: ['workout', id] })}
                         />
                        
                      </div>
                    )}
                  </div>
                );
              })}
              {(data?.exercises?.length || 0) === 0 && (
                <p className="text-sm text-muted-foreground">No exercises yet. Add one from the right.</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">{/* Right column for controls and timer */}

            {/* Rest Timer */}
            {showRestTimer && (
              <RestTimer
                suggestedSeconds={restDuration}
                onComplete={() => {
                  setShowRestTimer(false);
                  setCurrentSetEffort(undefined);
                  setLastCompletedSetId(undefined);
                }}
                onSkip={() => {
                  setShowRestTimer(false);
                  setCurrentSetEffort(undefined);
                  setLastCompletedSetId(undefined);
                  timerActions.skip();
                }}
                isActive={timerState.isActive}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>Add Exercise</CardTitle>
              </CardHeader>
              <CardContent>
                <Input placeholder="Search..." value={q} onChange={(e) => setQ(e.target.value)} />
                <div className="mt-3 space-y-2 max-h-80 overflow-auto">
                  {(search ?? []).map(ex => (
                    <div key={ex.id} className="flex items-center justify-between border rounded-md p-2">
                      <div>
                        <div className="text-sm font-medium">{getTranslatedName(ex)}</div>
                      </div>
                      <Button size="sm" onClick={() => addExercise(ex.id)}>Add</Button>
                    </div>
                  ))}
                  {q.length <= 1 && <p className="text-xs text-muted-foreground">Type at least 2 characters to search.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Abort Workout Button - with extra padding for bottom nav */}
        <section className="mt-8 pb-24">
          <div className="container mx-auto max-w-3xl px-4"
            style={{
              paddingBottom: 'env(safe-area-inset-bottom, 80px)'
            }}
          >
            <AlertDialog open={showAbortDialog} onOpenChange={setShowAbortDialog}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="w-full h-12 bg-muted text-muted-foreground hover:bg-muted/80 border border-muted"
                  disabled={isDeletingWorkout}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  {isDeletingWorkout ? "Deleting..." : "Abort Workout"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Abort Workout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your current workout data and all logged sets. 
                    All your progress from this session will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleAbortWorkout}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeletingWorkout}
                  >
                    {isDeletingWorkout ? "Deleting..." : "Delete Workout"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      </main>
      
      {/* 10RM Estimate Modal */}
      {showRMModal && (
        <TenRMEstimateModal
          isOpen={!!showRMModal}
          onClose={() => setShowRMModal(null)}
          exerciseId={showRMModal.exerciseId}
          exerciseName={showRMModal.exerciseName}
        />
      )}
    </div>
  );
};

export default WorkoutSession;