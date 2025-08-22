import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAddExerciseToWorkout, useAddSet, useEndWorkout, useDeleteWorkout, useSearchExercises, useUserSettings, useUpsertUserSettings, useWorkoutDetail, useCombinedMetrics } from "@/features/health/fitness/services/fitness.api";
import DynamicMetricsForm from "@/components/DynamicMetricsForm";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";
import ReadinessCheckIn, { ReadinessData } from "@/components/fitness/ReadinessCheckIn";
import EffortSelector, { EffortLevel } from "@/components/fitness/EffortSelector";
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
  const [showReadinessCheck, setShowReadinessCheck] = useState(!data?.workout);
  const [currentSetEffort, setCurrentSetEffort] = useState<EffortLevel>();
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(180);
  const [lastCompletedSetId, setLastCompletedSetId] = useState<string>();

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
    const fd = new FormData(form);
    const payload = {
      reps: Number(fd.get("reps")) || null,
      weight: Number(fd.get("weight")) || null,
      weight_unit: (fd.get("unit") as string) || 'kg',
      rpe: fd.get("rpe") ? Number(fd.get("rpe")) : null,
      notes: (fd.get("notes") as string) || null,
      is_completed: true,
    };
    
    // Get metrics for this workout exercise if any
    const exerciseMetrics = metricValues[workoutExerciseId];
    const metrics = exerciseMetrics ? Object.entries(exerciseMetrics)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([metricDefId, value]) => ({
        metric_def_id: metricDefId,
        value,
        value_type: 'numeric' as const // For now, we'll default to numeric
      })) : undefined;
    
    const result = await addSetMut.mutateAsync({ 
      workoutId: id!, 
      workoutExerciseId, 
      payload,
      metrics
    });
    
    form.reset();
    // Clear metrics for this exercise
    setMetricValues(prev => ({ ...prev, [workoutExerciseId]: {} }));
    
    // Store the set ID for effort tracking
    setLastCompletedSetId(typeof result === 'string' ? result : Math.random().toString());
  };

  const handleEffortSelect = (effort: EffortLevel) => {
    setCurrentSetEffort(effort);
    
    // Calculate rest time based on effort
    const restTimes: Record<EffortLevel, number> = {
      'very_easy': 60,
      'easy': 90,
      'moderate': 180,
      'hard': 240,
      'very_hard': 300,
    };
    
    const suggestedRest = restTimes[effort];
    setRestDuration(suggestedRest);
    setShowRestTimer(true);
    timerActions.setDuration(suggestedRest);
    timerActions.start();
    
    toast({
      title: "Set completed!",
      description: `${effort.replace('_', ' ')} effort - Rest for ${Math.floor(suggestedRest / 60)}:${(suggestedRest % 60).toString().padStart(2, '0')}`,
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

  // Show readiness check if workout just started
  if (showReadinessCheck) {
    return (
      <>
        <PageNav current="Pre-Workout Check" />
        <main className="container py-6 flex items-center justify-center min-h-[60vh]">
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
      <main className="container py-6 space-y-6">
        {/* Header with workout clock */}
        <div className="space-y-4">
          {/* Current Gym Header */}
          {selectedGym && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Current Gym</h3>
                  <p className="font-medium">{selectedGym.name}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate('/fitness/configure')}
                  className="h-8 w-8"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={endWorkout} disabled={endMut.isPending} size="sm">
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

        <section className="grid lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Exercises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(data?.exercises || []).map(ex => (
                <div key={ex.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{ex.exercises?.name || 'Unknown Exercise'}</h3>
                    <span className="text-xs text-muted-foreground">Order: {ex.order_index}</span>
                  </div>
                  
                  {/* Show warmup suggestions if available */}
                  {(ex as any).warmup_suggestion && (
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">💡 Warmup Suggestions</h4>
                      <div className="space-y-1">
                        {(ex as any).warmup_suggestion.warmup_sets?.map((set: any, idx: number) => (
                          <div key={idx} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                            <span>Set {set.set_index}:</span>
                            <span>{set.weight}kg × {set.reps} reps</span>
                            <span className="text-blue-500">({set.rest_seconds}s rest)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show exercise name and basic info */}
                  <div className="space-y-2">
                    {(data?.setsByWe[ex.id] || []).filter(set => set.is_completed).map(set => (
                      <div key={set.id} className="flex items-center gap-3 text-sm">
                        <span className="w-12">Set {set.set_index}</span>
                        <span className="w-24">{set.weight ?? '-'} {set.weight ? unit : ''}</span>
                        <span className="w-16">x {set.reps ?? '-'}</span>
                        <span className="w-16">RPE {set.rpe ?? '-'}</span>
                        <span className="text-muted-foreground">{set.notes || ''}</span>
                      </div>
                    ))}
                    {/* Show message if no completed sets yet */}
                    {(data?.setsByWe[ex.id] || []).filter(set => set.is_completed).length === 0 && (
                      <p className="text-sm text-muted-foreground">No completed sets yet. Add your first set below.</p>
                    )}
                  </div>
                  <form className="mt-3 grid grid-cols-6 gap-2" onSubmit={(e) => { e.preventDefault(); addSet(ex.id, e.currentTarget); }}>
                    <Input name="weight" placeholder={`Weight (${unit})`} className="col-span-2" inputMode="decimal" />
                    <Input name="reps" placeholder="Reps" inputMode="numeric" />
                    <Input name="rpe" placeholder="RPE" inputMode="decimal" />
                    <Input name="notes" placeholder="Notes" className="col-span-2" />
                    <input type="hidden" name="unit" value={unit} />
                    <div className="col-span-6 flex gap-2">
                      <Button type="submit" size="sm" disabled={addSetMut.isPending} className="flex-1">
                        Add Set
                      </Button>
                    </div>
                  </form>
                  
                  {/* Effort selector appears after completing a set */}
                  {lastCompletedSetId && !showRestTimer && (
                    <div className="mt-3">
                      <EffortSelector
                        onEffortSelect={handleEffortSelect}
                        onPainReport={handlePainReport}
                        selectedEffort={currentSetEffort}
                      />
                    </div>
                  )}
                </div>
              ))}
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
    </>
  );
};

export default WorkoutSession;