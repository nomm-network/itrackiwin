import React from "react";
import PageNav from "@/components/PageNav";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useWorkoutDetail, useUpdateWorkout, useDeleteWorkout } from "@/features/health/fitness/services/fitness.api";
import { Edit2, Trash2, Clock, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getExerciseNameFromTranslations } from "@/utils/exerciseTranslations";
import type { WarmupPlan } from "@/features/workouts/types/warmup";
import { getStepWeight } from "@/features/workouts/warmup/calcWarmup";
import { rpeToFeel } from "@/features/health/fitness/lib/feelToRpe";
import { parseFeelFromNotes } from "@/features/workouts/utils/feel";
import { useExerciseTranslation } from "@/hooks/useExerciseTranslations";
import { useWorkoutPersonalRecords } from "@/features/health/fitness/hooks/useWorkoutPersonalRecords";

// Component to properly display exercise name with translation
const ExerciseNameDisplay: React.FC<{ exerciseId: string; orderIndex: number }> = ({ exerciseId, orderIndex }) => {
  const { data: translation } = useExerciseTranslation(exerciseId);
  return (
    <span>{orderIndex}: {translation?.name || `Exercise ${exerciseId.slice(0, 8)}`}</span>
  );
};

const WorkoutDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useWorkoutDetail(id);
  const { data: prData } = useWorkoutPersonalRecords(id || '');
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

  // Calculate workout duration
  const formatWorkoutDuration = (startedAt: string, endedAt?: string) => {
    if (!endedAt) return null;
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}'` : `${minutes}'`;
  };

  const workoutDuration = formatWorkoutDuration(data.workout.started_at, data.workout.ended_at);
  const recordsMade = prData?.uniqueSetsWithRecords || 0;

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

        {/* Workout Stats */}
        <div className="flex gap-4 flex-wrap">
          {workoutDuration && (
            <Badge variant="secondary" className="text-sm py-2 px-3">
              <Clock className="h-4 w-4 mr-2" />
              Workout time: {workoutDuration}
            </Badge>
          )}
          <Badge variant="secondary" className="text-sm py-2 px-3">
            <Trophy className="h-4 w-4 mr-2" />
            Records made: {recordsMade}
          </Badge>
        </div>

        {/* Exercises Grid - 2 per row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(data?.exercises || []).map(ex => {
            const exerciseId = ex.exercise_id;
            const workoutSets = data?.setsByWe[ex.id] || [];
            
            // Show warmup suggestions since there are no actual sets
            const warmupSuggestion = (ex as any).warmup_suggestion;
            const warmupSets = warmupSuggestion?.warmup_sets || [];
            
            // Helper function to get actual feel value
            const getActualFeel = (set: any) => {
              // First try to get from effort field (enum value)
              if (set.effort) {
                return set.effort;
              }
              
              // Fallback to parsing from notes
              const feelFromNotes = parseFeelFromNotes(set.notes);
              if (feelFromNotes) {
                return feelFromNotes;
              }
              
              // Last resort: convert RPE to feel if available
              if (set.rpe) {
                return rpeToFeel(set.rpe);
              }
              
              return '';
            };

            // Check if set is a record using real PR data
            const isRecord = (set: any) => {
              return prData?.recordsBySetId.has(set.id) || false;
            };
            
            return (
              <Card key={ex.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    <ExerciseNameDisplay exerciseId={exerciseId} orderIndex={ex.order_index} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    
                    {/* Show simplified warmup sets */}
                    {warmupSets.length > 0 && (
                      <>
                        <div className="text-xs font-medium text-blue-600 mb-2">💡 Warmup {warmupSets.length} sets</div>
                        <div className="h-2"></div>
                      </>
                    )}
                    
                    <div className="text-xs font-medium text-muted-foreground mb-2">Logged Working Sets</div>
                    {/* Show actual logged sets */}
                    {workoutSets.length > 0 ? (
                      workoutSets.map(s => (
                        <div key={s.id} className="flex gap-4 items-center">
                          <span>Set {s.set_index}</span>
                          <span>{s.weight ?? '-'} {s.weight ? s.weight_unit : ''}</span>
                          <span>x {s.reps ?? '-'} {getActualFeel(s)}</span>
                          {isRecord(s) && (
                            <Trophy className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-muted-foreground text-sm">No sets logged yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

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