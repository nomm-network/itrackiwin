import React from "react";
import PageNav from "@/components/PageNav";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWorkoutDetail, useUpdateWorkout, useDeleteWorkout } from "@/features/health/fitness/services/fitness.api";
import { Edit2, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getExerciseNameFromTranslations } from "@/utils/exerciseTranslations";
import type { WarmupPlan } from "@/features/workouts/types/warmup";
import { getStepWeight } from "@/features/workouts/warmup/calcWarmup";
import { rpeToFeel } from "@/features/health/fitness/lib/feelToRpe";

const WorkoutDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useWorkoutDetail(id);
  const updateMut = useUpdateWorkout();
  const deleteMut = useDeleteWorkout();

  // Debug data structure
  React.useEffect(() => {
    console.log("🔍 [WorkoutDetail] Data:", data);
    console.log("🔍 [WorkoutDetail] Loading:", isLoading);
    console.log("🔍 [WorkoutDetail] Error:", error);
    if (data?.exercises) {
      data.exercises.forEach((ex, i) => {
        console.log(`Exercise ${i}:`, ex);
        console.log(`Sets for exercise ${ex.id}:`, data.setsByWe[ex.id]);
      });
    }
  }, [data, isLoading, error]);

  const [editingWorkout, setEditingWorkout] = React.useState<any>(null);
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    document.title = "Workout Details | I Track I Win";
  }, []);

  const handleEdit = () => {
    if (!data?.workout) return;
    setEditingWorkout(data.workout);
    setTitle(data.workout.title || "");
    setNotes(data.workout.notes || "");
  };

  const handleUpdate = async () => {
    if (!editingWorkout) return;
    try {
      await updateMut.mutateAsync({
        workoutId: editingWorkout.id,
        title: title.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setEditingWorkout(null);
      toast({ title: "Workout updated successfully" });
    } catch (error: any) {
      toast({ title: "Failed to update workout", description: error.message, variant: "destructive" });
    }
  };

  const handleDelete = async () => {
    if (!data?.workout) return;
    const confirmed = window.confirm("Are you sure you want to delete this workout? This action cannot be undone.");
    if (!confirmed) return;
    
    try {
      await deleteMut.mutateAsync(data.workout.id);
      navigate("/fitness");
      toast({ title: "Workout deleted successfully" });
    } catch (error: any) {
      toast({ title: "Failed to delete workout", description: error.message });
    }
  };

  if (isLoading) {
    return (
      <>
        <PageNav current="Workout Details" />
        <main className="container py-8">
          <div className="text-center">Loading workout details...</div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageNav current="Workout Details" />
        <main className="container py-8">
          <div className="text-center text-destructive">Error loading workout: {error.message}</div>
        </main>
      </>
    );
  }

  if (!data?.workout) {
    return (
      <>
        <PageNav current="Workout Details" />
        <main className="container py-8">
          <div className="text-center">Workout not found</div>
        </main>
      </>
    );
  }

  return (
    <>
      <PageNav current="Workout Details" />
      <main className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{data.workout.title || 'Workout'}</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit2 className="mr-1 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        
        {/* DEBUG INFO - REMOVE WHEN DONE */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-sm text-yellow-800">🐛 DEBUG INFO</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-yellow-700">
            <div><strong>Total exercises:</strong> {data?.exercises?.length || 0}</div>
            <div><strong>Sets count:</strong> {Object.keys(data?.setsByWe || {}).length}</div>
            <div><strong>setsByWe:</strong> {JSON.stringify(data?.setsByWe, null, 2)}</div>
            <div><strong>Raw exercises data:</strong></div>
            <pre className="mt-2 overflow-auto max-h-40">{JSON.stringify(data?.exercises, null, 2)}</pre>
          </CardContent>
        </Card>

        {(data?.exercises || []).map(ex => {
          const exerciseName = getExerciseNameFromTranslations(ex.exercises?.translations);
          const workoutSets = data?.setsByWe[ex.id] || [];
          
          // Show warmup suggestions since there are no actual sets
          const warmupSuggestion = (ex as any).warmup_suggestion;
          const warmupSets = warmupSuggestion?.warmup_sets || [];
          
          return (
            <Card key={ex.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{ex.order_index + 1}: {exerciseName}</CardTitle>
                <CardDescription>Exercise ID: {ex.id}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  
                  {/* Show suggested warmup sets */}
                  {warmupSets.length > 0 && (
                    <>
                      <div className="text-xs font-medium text-blue-600 mb-2">💡 Suggested Warmup Sets</div>
                      {warmupSets.map((warmupSet, index) => (
                        <div key={`warmup-${index}`} className="flex gap-4 text-blue-600">
                          <span>Warmup {index + 1}</span>
                          <span>{warmupSet.weight} kg</span>
                          <span>x {warmupSet.reps}</span>
                          <span>({warmupSet.rest_seconds}s rest)</span>
                        </div>
                      ))}
                      <div className="h-2"></div>
                    </>
                  )}
                  
                  <div className="text-xs font-medium text-muted-foreground mb-2">Logged Working Sets</div>
                  {/* Show actual logged sets */}
                  {workoutSets.length > 0 ? (
                    workoutSets.map(s => (
                      <div key={s.id} className="flex gap-4">
                        <span>Set {s.set_index}</span>
                        <span>{s.weight ?? '-'} {s.weight ? s.weight_unit : ''}</span>
                        <span>x {s.reps ?? '-'} {s.rpe ? rpeToFeel(s.rpe) : ''}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-sm">❌ No sets logged yet - sets array is empty!</div>
                  )}
                  
                  {/* DEBUG: Show sets for this exercise */}
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                    <div><strong>🔍 Sets for this exercise:</strong></div>
                    <div>Exercise workout_exercise ID: {ex.id}</div>
                    <div>Sets found: {JSON.stringify(workoutSets)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Dialog open={!!editingWorkout} onOpenChange={(open) => !open && setEditingWorkout(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Workout</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label htmlFor="workout-title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <Input
                  id="workout-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Workout title"
                />
              </div>
              <div>
                <label htmlFor="workout-notes" className="block text-sm font-medium mb-1">
                  Notes
                </label>
                <Textarea
                  id="workout-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Workout notes"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingWorkout(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={updateMut.isPending}>
                  {updateMut.isPending ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
};

export default WorkoutDetail;