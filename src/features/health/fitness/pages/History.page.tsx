import React from "react";
import PageNav from "@/components/PageNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { usePersonalRecords, useRecentWorkouts, useDeleteWorkout, useUpdateWorkout } from "@/features/health/fitness/services/fitness.api";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const History: React.FC = () => {
  const { data: workouts } = useRecentWorkouts(50);
  const { data: prs } = usePersonalRecords();
  const { toast } = useToast();
  const deleteWorkout = useDeleteWorkout();
  const updateWorkout = useUpdateWorkout();

  const [editingWorkout, setEditingWorkout] = React.useState<any>(null);
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");

  React.useEffect(() => {
    document.title = "Workout History | I Track I Win";
  }, []);

  const handleEdit = (workout: any) => {
    setEditingWorkout(workout);
    setTitle(workout.title || "");
    setNotes(workout.notes || "");
  };

  const handleUpdate = async () => {
    if (!editingWorkout) return;
    try {
      await updateWorkout.mutateAsync({
        workoutId: editingWorkout.id,
        title: title || undefined,
        notes: notes || undefined,
      });
      toast({ title: "Workout updated successfully" });
      setEditingWorkout(null);
    } catch (error) {
      toast({ title: "Failed to update workout", variant: "destructive" });
    }
  };

  const handleDelete = async (workoutId: string, title: string) => {
    if (!confirm(`Delete workout "${title || 'Free Session'}"?`)) return;
    try {
      await deleteWorkout.mutateAsync(workoutId);
      toast({ title: "Workout deleted successfully" });
    } catch (error) {
      toast({ title: "Failed to delete workout", variant: "destructive" });
    }
  };

  return (
    <>
      <PageNav current="History" />
      <main className="container py-8 pb-nav-safe space-y-6">
        <h1 className="text-2xl font-semibold">Workout History</h1>
        <section className="grid md:grid-cols-2 gap-4">
          {(workouts ?? []).map(w => (
            <Card key={w.id}>
              <Link to={`/fitness/history/${w.id}`} className="block">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{w.title || 'Free Session'}</CardTitle>
                  <CardDescription>
                    {new Date(w.started_at).toLocaleString()} • {w.ended_at ? 'Completed' : 'In progress'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Tap to view details</p>
                </CardContent>
              </Link>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEdit(w);
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(w.id, w.title || 'Free Session');
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Dialog open={!!editingWorkout} onOpenChange={() => setEditingWorkout(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Workout</DialogTitle>
              <DialogDescription>Update the workout title and notes.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Workout title"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Workout notes"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingWorkout(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateWorkout.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <section>
          <h2 className="font-medium mb-3">Recent Personal Records</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {(prs ?? []).slice(0, 10).map(pr => (
              <Card key={pr.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{pr.kind} — {pr.value} {pr.unit || ''}</CardTitle>
                  <CardDescription>{new Date(pr.achieved_at).toLocaleString()}</CardDescription>
                </CardHeader>
              </Card>
            ))}
            {(!prs || prs.length === 0) && <p className="text-sm text-muted-foreground">No PRs yet.</p>}
          </div>
        </section>
      </main>
    </>
  );
};

export default History;