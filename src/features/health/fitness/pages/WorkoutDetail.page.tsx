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
import { toast } from "@/components/ui/use-toast";
import { getExerciseNameFromTranslations } from "@/utils/exerciseTranslations";
import type { WarmupPlan } from "@/features/workouts/types/warmup";
import { getStepWeight } from "@/features/workouts/warmup/calcWarmup";
import { rpeToFeel } from "@/features/health/fitness/lib/feelToRpe";

const WorkoutDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useWorkoutDetail(id);
  const updateMut = useUpdateWorkout();
  const deleteMut = useDeleteWorkout();

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
      toast({ title: "Failed to update workout", description: error.message });
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

  return (
    <>
      <PageNav current="Workout Details" />
      <main className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{data?.workout?.title || 'Workout'}</h1>
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
        {(data?.exercises || []).map(ex => {
          const exerciseName = getExerciseNameFromTranslations(ex.exercises?.translations);
          const workoutSets = data?.setsByWe[ex.id] || [];
          
          // Check if we have warmup plan data and show warmup sets
          const warmupPlan = ex.warmup_plan as WarmupPlan | null;
          const warmupSets = warmupPlan?.steps || [];
          
          return (
            <Card key={ex.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{ex.order_index + 1}: {exerciseName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {/* Show warmup sets first if they exist */}
                  {warmupSets.length > 0 && (
                    <>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Warmup Sets</div>
                      {warmupSets.map((warmupSet, index) => (
                        <div key={`warmup-${index}`} className="flex gap-4 text-muted-foreground">
                          <span>Set {index + 1}</span>
                          <span>{getStepWeight(warmupSet, 50, 2.5)} kg</span>
                          <span>x {warmupSet.reps ?? '-'}</span>
                          <span>RPE warmup</span>
                        </div>
                      ))}
                      <div className="h-2"></div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Working Sets</div>
                    </>
                  )}
                  
                  {/* Show actual logged sets */}
                  {workoutSets.map(s => (
                    <div key={s.id} className="flex gap-4">
                      <span>Set {s.set_index}</span>
                      <span>{s.weight ?? '-'} {s.weight ? s.weight_unit : ''}</span>
                      <span>x {s.reps ?? '-'} {s.rpe ? rpeToFeel(s.rpe) : ''}</span>
                    </div>
                  ))}
                  
                  {/* Show warmup feedback if available */}
                  {ex.warmup_plan && typeof ex.warmup_plan === 'object' && 'feedback' in ex.warmup_plan && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        Warmup feedback: <span className="font-medium">{(ex.warmup_plan.feedback as string).replace('_', ' ')}</span>
                      </div>
                    </div>
                  )}
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