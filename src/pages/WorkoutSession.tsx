import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAddExerciseToWorkout, useAddSet, useEndWorkout, useSearchExercises, useUserSettings, useUpsertUserSettings, useWorkoutDetail } from "@/features/fitness/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/useTranslations";

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
  useSEO(data?.workout?.title || 'Session');

  const endMut = useEndWorkout();
  const addExMut = useAddExerciseToWorkout();
  const addSetMut = useAddSet();

  const [q, setQ] = React.useState("");
  const { data: search } = useSearchExercises(q);

  const endWorkout = async () => {
    if (!id) return;
    await endMut.mutateAsync(id);
    toast({ title: "Workout ended", description: "Session marked as complete." });
    navigate('/fitness/history');
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
    await addSetMut.mutateAsync({ workoutId: id!, workoutExerciseId, payload });
    form.reset();
  };

  const unit = (useUserSettings().data?.unit_weight ?? 'kg');

  return (
    <>
      <PageNav current="Workout Session" />
      <main className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{data?.workout?.title || 'Free Session'}</h1>
          <div className="flex items-center gap-3">
            <UnitToggle />
            <Button variant="secondary" onClick={() => navigate('/fitness')}>Back</Button>
            <Button onClick={endWorkout} disabled={endMut.isPending}>End Workout</Button>
          </div>
        </div>

        <section className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Exercises</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {(data?.exercises || []).map(ex => (
                <div key={ex.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{ex.exercise_id}</h3>
                    <span className="text-xs text-muted-foreground">Order: {ex.order_index}</span>
                  </div>
                  <div className="space-y-2">
                    {(data?.setsByWe[ex.id] || []).map(set => (
                      <div key={set.id} className="flex items-center gap-3 text-sm">
                        <span className="w-12">Set {set.set_index}</span>
                        <span className="w-24">{set.weight ?? '-'} {set.weight ? unit : ''}</span>
                        <span className="w-16">x {set.reps ?? '-'}</span>
                        <span className="w-16">RPE {set.rpe ?? '-'}</span>
                        <span className="text-muted-foreground">{set.notes || ''}</span>
                      </div>
                    ))}
                  </div>
                  <form className="mt-3 grid grid-cols-6 gap-2" onSubmit={(e) => { e.preventDefault(); addSet(ex.id, e.currentTarget); }}>
                    <Input name="weight" placeholder={`Weight (${unit})`} className="col-span-2" inputMode="decimal" />
                    <Input name="reps" placeholder="Reps" inputMode="numeric" />
                    <Input name="rpe" placeholder="RPE" inputMode="decimal" />
                    <Input name="notes" placeholder="Notes" className="col-span-2" />
                    <input type="hidden" name="unit" value={unit} />
                    <div className="col-span-6">
                      <Button type="submit" size="sm" disabled={addSetMut.isPending}>Add Set</Button>
                    </div>
                  </form>
                </div>
              ))}
              {(data?.exercises?.length || 0) === 0 && (
                <p className="text-sm text-muted-foreground">No exercises yet. Add one from the right.</p>
              )}
            </CardContent>
          </Card>

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
        </section>
      </main>
    </>
  );
};

export default WorkoutSession;
