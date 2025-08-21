import React from "react";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, NavLink } from "react-router-dom";
import { useRecentWorkouts, useStartWorkout, useUpdateWorkout, useDeleteWorkout } from "@/features/health/fitness/services/fitness.api";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Edit2, Trash2 } from "lucide-react";

const useSEO = () => {
  React.useEffect(() => {
    document.title = "Workout Tracker | I Track I Win";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Start workouts, log sets, and track fitness progress with I Track I Win.');
    document.head.appendChild(desc);

    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', `${window.location.origin}/fitness`);
    document.head.appendChild(link);
  }, []);
};

const Fitness: React.FC = () => {
  useSEO();
  const navigate = useNavigate();
  const { data: workouts } = useRecentWorkouts(5);
  const startMut = useStartWorkout();
  const updateMut = useUpdateWorkout();
  const deleteMut = useDeleteWorkout();

  const [editingWorkout, setEditingWorkout] = React.useState<any>(null);
  const [title, setTitle] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const [importing, setImporting] = React.useState(false);
  const importExercises = async () => {
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-exercises-community');
      if (error) throw error;
      const src = data?.source ?? 'unknown';
      const processed = data?.processed ?? 0;
      const affected = data?.affected ?? 0;
      toast({ title: 'Exercises imported', description: `${affected} added/updated from ${src} (${processed} processed).` });
    } catch (e: any) {
      toast({ title: 'Import failed', description: e?.message || 'Unknown error' });
    } finally {
      setImporting(false);
    }
  };

  const onStartFree = async () => {
    const id = await startMut.mutateAsync(null);
    navigate(`/fitness/session/${id}`);
  };

  const handleEdit = (workout: any) => {
    setEditingWorkout(workout);
    setTitle(workout.title || "");
    setNotes(workout.notes || "");
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

  const handleDelete = async (workoutId: string, workoutTitle: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${workoutTitle || 'Free Session'}"? This action cannot be undone.`);
    if (!confirmed) return;
    
    try {
      await deleteMut.mutateAsync(workoutId);
      toast({ title: "Workout deleted successfully" });
    } catch (error: any) {
      toast({ title: "Failed to delete workout", description: error.message });
    }
  };

  return (
    <>
      <PageNav current="Fitness" />
      <nav className="container pt-4">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavLink to="/fitness" end className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Workouts
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/exercises" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Exercises
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/templates" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Templates
              </NavLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/fitness/configure" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Configure
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
      <main className="container py-8">
        <h1 className="text-2xl font-semibold mb-6">Workout Tracker</h1>
        <section className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Start a Workout</CardTitle>
              <CardDescription>Free session or from a template.</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button onClick={onStartFree} disabled={startMut.isPending}>Start Free Session</Button>
              <Button variant="secondary" onClick={() => navigate('/fitness/templates')}>Start from Template</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Find Exercises</CardTitle>
              <CardDescription>Search the public library.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input placeholder="Search exercises..." aria-label="Search exercises" onFocus={() => navigate('/fitness/templates')} />
                <Button variant="secondary" onClick={importExercises} disabled={importing} aria-label="Load popular exercises">
                  {importing ? 'Importing…' : 'Load popular exercises'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <h2 className="font-medium mb-3">Recent Workouts</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {(workouts ?? []).map(w => (
              <Card key={w.id}>
                <CardHeader 
                  className="pb-2 cursor-pointer" 
                  onClick={() => navigate(`/fitness/session/${w.id}`)}
                >
                  <CardTitle className="text-base">{w.title || 'Free Session'}</CardTitle>
                  <CardDescription>
                    {new Date(w.started_at).toLocaleString()} • {w.ended_at ? 'Completed' : 'In progress'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(w);
                      }}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(w.id, w.title || 'Free Session');
                      }}
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(!workouts || workouts.length === 0) && (
              <p className="text-sm text-muted-foreground">No workouts yet. Start one above.</p>
            )}
          </div>
        </section>

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

export default Fitness;
