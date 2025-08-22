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
  const [showReadinessCheck, setShowReadinessCheck] = useState(false);
  const [currentSetEffort, setCurrentSetEffort] = useState<EffortLevel>();
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restDuration, setRestDuration] = useState(180);
  const [lastCompletedSetId, setLastCompletedSetId] = useState<string>();
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

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
      console.log('🔥 Starting addSet function');
      console.log('workoutExerciseId:', workoutExerciseId);
      console.log('workoutId (id):', id);
      
      const fd = new FormData(form);
      
      const reps = fd.get("reps");
      const weight = fd.get("weight");
      const rpe = fd.get("rpe");
      const notes = fd.get("notes");
      const unit = fd.get("unit");
      const hadPain = fd.get("hadPain") === 'on';
      
      console.log('🔥 Raw form data:', { reps, weight, rpe, notes, unit, hadPain });
      
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
      };
      
      console.log('🔥 Final payload:', payload);
      
      const mutationParams = {
        workoutExerciseId,
        payload
      };
      
      console.log('🔥 Mutation params:', mutationParams);
      
      const result = await addSetMut.mutateAsync(mutationParams);
      
      console.log('🔥 Set added successfully:', result);
      
      form.reset();
      
      // Store the set ID for effort tracking
      setLastCompletedSetId(result?.id || Math.random().toString());
      
      toast({
        title: "Set added!",
        description: `Added ${payload.weight}kg × ${payload.reps} reps`,
      });
    } catch (error) {
      console.error('🔥 Error in addSet function:', error);
      console.error('🔥 Error details:', JSON.stringify(error, null, 2));
      toast({
        title: "Error",
        description: "Failed to add set. Check console for details.",
        variant: "destructive"
      });
    }
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
  
  // DEBUG: Get current user session for debugging
  const [debugInfo, setDebugInfo] = React.useState<any>({});
  
  React.useEffect(() => {
    const getDebugInfo = async () => {
      const { data: session } = await supabase.auth.getSession();
      setDebugInfo({
        workoutId: id,
        userId: session?.session?.user?.id,
        isAuthenticated: !!session?.session?.user,
        workoutData: data?.workout,
        activeExerciseId,
        firstExercise: data?.exercises?.[0],
        firstExerciseId: data?.exercises?.[0]?.id,
        totalExercises: data?.exercises?.length || 0,
      });
    };
    getDebugInfo();
  }, [id, data, activeExerciseId]);

  return (
    <>
      <PageNav current="Workout Session" />
      
      {/* 🔥🔥🔥 DEBUG AREA - WILL DELETE LATER 🔥🔥🔥 */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white p-2 text-xs border-b-4 border-red-700">
        <div className="container">
          <h3 className="font-bold mb-1">🔥 DEBUG INSERT DATA 🔥</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <strong>Auth:</strong> {debugInfo.isAuthenticated ? "✅" : "❌"} | ID: {debugInfo.userId?.slice(0,8) || "NONE"}
            </div>
            <div>
              <strong>Workout:</strong> {debugInfo.workoutId?.slice(0,8) || "NONE"} | Title: {debugInfo.workoutData?.title || "NONE"}
            </div>
            <div>
              <strong>Exercises:</strong> {debugInfo.totalExercises} total | Active: {debugInfo.activeExerciseId?.slice(0,8) || "NONE"}
            </div>
          </div>
        </div>
      </div>
      
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
                          <h3 className="font-medium">{ex.exercises?.name || 'Unknown Exercise'}</h3>
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
                        {/* Show warmup suggestions if available */}
                        {(ex as any).warmup_suggestion && (ex as any).warmup_suggestion.warmup_sets && (
                          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">💡 Warmup Suggestions</h4>
                            <div className="space-y-1">
                              {(ex as any).warmup_suggestion.warmup_sets.map((set: any, idx: number) => (
                                <div key={idx} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                  <span>Set {set.set_index}:</span>
                                  <span>{set.weight}kg × {set.reps} reps</span>
                                  <span className="text-blue-500">({set.rest_seconds}s rest)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Debug warmup data */}
                        {process.env.NODE_ENV === 'development' && (
                          <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                            <div>Warmup data: {JSON.stringify((ex as any).warmup_suggestion)}</div>
                          </div>
                        )}
                        
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
                        <form className="grid grid-cols-6 gap-2" onSubmit={(e) => { e.preventDefault(); addSet(ex.id, e.currentTarget); }}>
                          <Input name="weight" placeholder={`Weight (${unit})`} className="col-span-2" inputMode="decimal" />
                          <Input name="reps" placeholder="Reps" inputMode="numeric" />
                          <Input name="rpe" placeholder="RPE" inputMode="decimal" />
                          <Input name="notes" placeholder="Notes" className="col-span-2" />
                          <input type="hidden" name="unit" value={unit} />
                            <div className="col-span-6 flex items-center gap-2">
                              <input type="checkbox" name="hadPain" id={`pain-${ex.id}`} className="w-4 h-4" />
                              <label htmlFor={`pain-${ex.id}`} className="text-sm">Had pain</label>
                              
                              {/* Add Set Button with Debug Popup */}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    type="button" 
                                    size="sm" 
                                    disabled={addSetMut.isPending} 
                                    className="flex-1 ml-2"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      const form = e.currentTarget.closest('form') as HTMLFormElement;
                                      const fd = new FormData(form);
                                      const reps = fd.get("reps");
                                      const weight = fd.get("weight");
                                      const rpe = fd.get("rpe");
                                      const notes = fd.get("notes");
                                      const unit = fd.get("unit");
                                      const hadPain = fd.get("hadPain") === 'on';
                                      
                                      console.log('🔥 ADD SET CLICKED - SHOWING DEBUG POPUP');
                                      
                                      setDebugInfo(prev => ({
                                        ...prev,
                                        currentFormData: { reps, weight, rpe, notes, unit, hadPain },
                                        workoutExerciseId: ex.id,
                                        currentForm: form,
                                        insertQuery: {
                                          workout_exercise_id: ex.id,
                                          set_index: 'AUTO_GENERATED',
                                          reps: reps ? parseInt(reps as string) : null,
                                          weight: weight ? parseFloat(weight as string) : null,
                                          rpe: rpe || null,
                                          notes: notes || null,
                                          had_pain: hadPain
                                        }
                                      }));
                                    }}
                                  >
                                    {addSetMut.isPending ? 'Adding...' : 'Add Set'}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold text-blue-600">🔍 CONFIRM ADD SET - DEBUG VIEW</AlertDialogTitle>
                                    <AlertDialogDescription asChild>
                                      <div className="space-y-6">
                                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                                          <h4 className="font-bold text-lg mb-3 text-red-800">📝 Raw Form Data:</h4>
                                          <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-auto font-mono">
                                            {JSON.stringify(debugInfo.currentFormData || {}, null, 2)}
                                          </pre>
                                        </div>
                                        
                                        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                                          <h4 className="font-bold text-lg mb-3 text-blue-800">🗄️ INSERT QUERY TO EXECUTE:</h4>
                                          <pre className="bg-gray-900 text-cyan-400 p-4 rounded text-sm overflow-auto font-mono">
                                            {JSON.stringify(debugInfo.insertQuery || {}, null, 2)}
                                          </pre>
                                        </div>
                                        
                                        <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                                          <h4 className="font-bold text-lg mb-3 text-green-800">🎯 Context Information:</h4>
                                          <pre className="bg-gray-900 text-yellow-400 p-4 rounded text-sm overflow-auto font-mono">
                                            {JSON.stringify({
                                              workoutId: debugInfo.workoutId,
                                              userId: debugInfo.userId,
                                              workoutExerciseId: debugInfo.workoutExerciseId,
                                              exerciseName: ex.exercises?.name,
                                              timestamp: new Date().toISOString()
                                            }, null, 2)}
                                          </pre>
                                        </div>
                                        
                                        <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                                          <h4 className="font-bold text-lg mb-3 text-orange-800">⚡ SQL Query Preview:</h4>
                                          <pre className="bg-gray-900 text-orange-400 p-4 rounded text-sm overflow-auto font-mono">
{`INSERT INTO public.workout_sets (
  workout_exercise_id,
  set_index,
  reps,
  weight,
  rpe,
  notes,
  had_pain
) VALUES (
  '${debugInfo.workoutExerciseId}',
  ${debugInfo.insertQuery?.set_index || 'AUTO'},
  ${debugInfo.insertQuery?.reps || 'NULL'},
  ${debugInfo.insertQuery?.weight || 'NULL'},
  ${debugInfo.insertQuery?.rpe ? `'${debugInfo.insertQuery.rpe}'` : 'NULL'},
  ${debugInfo.insertQuery?.notes ? `'${debugInfo.insertQuery.notes}'` : 'NULL'},
  ${debugInfo.insertQuery?.had_pain || false}
);`}
                                          </pre>
                                        </div>
                                      </div>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex gap-3">
                                    <AlertDialogCancel className="bg-gray-500 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      className="bg-green-600 text-white hover:bg-green-700"
                                      onClick={async () => {
                                        if (debugInfo.currentForm) {
                                          await addSet(ex.id, debugInfo.currentForm);
                                        }
                                      }}
                                    >
                                      ✅ EXECUTE INSERT QUERY
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
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
    </>
  );
};

export default WorkoutSession;