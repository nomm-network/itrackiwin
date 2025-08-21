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
        {(data?.exercises || []).map(ex => (
          <Card key={ex.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Exercise: {ex.exercise_id}</CardTitle>
              <CardDescription>Order {ex.order_index}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                {(data?.setsByWe[ex.id] || []).map(s => (
                  <div key={s.id} className="flex gap-4">
                    <span>Set {s.set_index}</span>
                    <span>{s.weight ?? '-'} {s.weight ? s.weight_unit : ''}</span>
                    <span>x {s.reps ?? '-'}</span>
                    <span>RPE {s.rpe ?? '-'}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

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
