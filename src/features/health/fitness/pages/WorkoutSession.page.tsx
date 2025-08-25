import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAddExerciseToWorkout, useAddSet, useEndWorkout, useDeleteWorkout, useSearchExercises, useUserSettings, useUpsertUserSettings, useWorkoutDetail, useCombinedMetrics } from "@/features/health/fitness/services/fitness.api";
import { supabase } from "@/integrations/supabase/client";
import DynamicMetricsForm from "@/components/DynamicMetricsForm";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";
import ReadinessCheckIn, { ReadinessData } from "@/components/fitness/ReadinessCheckIn";
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
import { Settings, Timer } from "lucide-react";

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
  useSEO(data?.workout?.title || 'Session');

  const endMut = useEndWorkout();
  const deleteMut = useDeleteWorkout();
  const addExMut = useAddExerciseToWorkout();
  const addSetMut = useAddSet();

  const [q, setQ] = React.useState("");
  const { data: search } = useSearchExercises(q);
  const [metricValues, setMetricValues] = React.useState<Record<string, Record<string, any>>>({});
  
  // Enhanced workout state
  const [showReadinessCheck, setShowReadinessCheck] = useState(false);
  const [currentSetEffort, setCurrentSetEffort] = useState<EffortRating>();
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(180);
  const [lastCompletedSetId, setLastCompletedSetId] = useState<string>();
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  const [showRMModal, setShowRMModal] = useState<{exerciseId: string, exerciseName: string} | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [currentSetData, setCurrentSetData] = useState<{effort?: EffortRating, hadPain?: boolean}>({});
  

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
      await deleteMut.mutateAsync(id);
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

  const handleReadinessSubmit = async (readinessData: ReadinessData) => {
    setShowReadinessCheck(false);
    toast({
      title: "Readiness recorded",
      description: "Your data helps us optimize your workout suggestions.",
    });
  };

  const handleSkipReadiness = () => {
    setShowReadinessCheck(false);
  };

  const unit = (useUserSettings().data?.unit_weight ?? 'kg');

  // Calculate total sets for workout clock
  const totalSets = (data?.exercises || []).reduce((total, ex) => {
    return total + (data?.setsByWe[ex.id] || []).length;
  }, 0);
  
  const completedSets = (data?.exercises || []).reduce((total, ex) => {
    return total + (data?.setsByWe[ex.id] || []).filter(set => set.is_completed).length;
  }, 0);
  // Only show readiness check for brand new workouts (no exercises added yet)
  React.useEffect(() => {
    if (data?.workout && data.exercises.length === 0 && completedSets === 0) {
      setShowReadinessCheck(true);
    }
  }, [data?.workout, data?.exercises, completedSets]);

  // Show readiness check if workout just started
  if (showReadinessCheck) {
    return (
      <>
        <PageNav current="Pre-Workout Check" />
        <main className="container py-6 flex items-center justify-center min-h-[60vh] pb-32">
          <ReadinessCheckIn
            onSubmit={handleReadinessSubmit}
            onSkip={handleSkipReadiness}
          />
        </main>
      </>
    );
  }
  

  return (
    <>
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
                  onClick={() => navigate('/fitness/configure')}
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
                          <h3 className="font-medium">{getExerciseNameFromTranslations(ex.exercises?.translations, ex.exercises?.id) || 'Unknown Exercise'}</h3>
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
                        
                         {/* Add Set Form */}
                        <form 
                          className="space-y-3"
                          onSubmit={(e) => {
                            e.preventDefault();
                            addSet(ex.id, e.currentTarget);
                          }}
                        >
                          <div className="grid grid-cols-4 gap-2">
                            <Input name="weight" placeholder={`Weight (${unit})`} inputMode="decimal" />
                            <Input name="reps" placeholder="Reps" inputMode="numeric" />
                            <Input name="rpe" placeholder="RPE" inputMode="decimal" />
                            <Input name="notes" placeholder="Notes" />
                            <input type="hidden" name="unit" value={unit} />
                          </div>
                          
                          {/* Effort and Pain Selection */}
                          <div className="space-y-2">
                            <div>
                              <label className="text-sm font-medium">How did that feel?</label>
                              <EffortChips
                                value={currentSetData.effort}
                                onChange={(effort) => setCurrentSetData(prev => ({ ...prev, effort }))}
                                className="mt-1"
                              />
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                id={`pain-${ex.id}`} 
                                className="w-4 h-4" 
                                checked={currentSetData.hadPain || false}
                                onChange={(e) => setCurrentSetData(prev => ({ ...prev, hadPain: e.target.checked }))}
                              />
                              <label htmlFor={`pain-${ex.id}`} className="text-sm">Had pain during set</label>
                            </div>
                          </div>
                          
                          <Button 
                            type="submit" 
                            size="sm" 
                            disabled={addSetMut.isPending} 
                            className="w-full"
                          >
                            {addSetMut.isPending ? 'Adding Set...' : 'Add Set'}
                          </Button>
                        </form>
                        
                        {/* Show warmup feedback after last set */}
                        {completedExercises.has(ex.id) && (
                          <div className="mt-3">
                             <WarmupFeedback
                               exerciseId={ex.exercise_id}
                               onComplete={() => setCompletedExercises(prev => new Set([...prev, ex.id]))}
                             />
                          </div>
                        )}
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
    </>
  );
};

export default WorkoutSession;