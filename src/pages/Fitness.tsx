import React from "react";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useRecentWorkouts, useStartWorkout } from "@/features/fitness/api";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const [importing, setImporting] = React.useState(false);
  const importExercises = async () => {
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-exercises-exercisedb');
      if (error) throw error;
      toast({ title: 'Exercises imported', description: `${data?.processed ?? 0} processed, ${data?.affected ?? 0} upserted.` });
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

  return (
    <>
      <PageNav current="Fitness" />
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
              <Card key={w.id} className="cursor-pointer" onClick={() => navigate(`/fitness/session/${w.id}`)}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{w.title || 'Free Session'}</CardTitle>
                  <CardDescription>
                    {new Date(w.started_at).toLocaleString()} • {w.ended_at ? 'Completed' : 'In progress'}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
            {(!workouts || workouts.length === 0) && (
              <p className="text-sm text-muted-foreground">No workouts yet. Start one above.</p>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default Fitness;
