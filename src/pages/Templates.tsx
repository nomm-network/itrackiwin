import React from "react";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate, NavLink } from "react-router-dom";
import { useAddExerciseToTemplate, useCloneTemplateToWorkout, useCreateTemplate, useSearchExercises, useTemplateExercises, useTemplates } from "@/features/fitness/api";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { useTranslations } from "@/hooks/useTranslations";
const Templates: React.FC = () => {
  const { getTranslatedName } = useTranslations();
  const navigate = useNavigate();
  const { data: templates } = useTemplates();
  const create = useCreateTemplate();
  const startFrom = useCloneTemplateToWorkout();

  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const { data: tExercises } = useTemplateExercises(selectedTemplate || undefined);
  const addToTemplate = useAddExerciseToTemplate();

  const [q, setQ] = React.useState("");
  const [muscle, setMuscle] = React.useState<string>("");
  const { data: results } = useSearchExercises(q, { primaryMuscle: muscle || undefined });

  const addExercise = async (exerciseId: string) => {
    if (!selectedTemplate) return;
    await addToTemplate.mutateAsync({ templateId: selectedTemplate, exerciseId });
    setQ("");
  };

  const startTemplate = async (templateId: string) => {
    const id = await startFrom.mutateAsync(templateId);
    navigate(`/fitness/session/${id}`);
  };

  return (
    <>
      <PageNav current="Templates" />
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
      <main className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Workout Templates</h1>
          <Button onClick={async () => { const name = prompt('Template name', 'Push Day') || 'New Template'; const id = await create.mutateAsync(name); setSelectedTemplate(id); }}>New Template</Button>
        </div>

        <section className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>My Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(templates ?? []).map(t => (
                <div key={t.id} className={`border rounded-md p-2 ${selectedTemplate === t.id ? 'bg-muted' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{getTranslatedName(t)}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setSelectedTemplate(t.id)}>Edit</Button>
                      <Button size="sm" onClick={() => startTemplate(t.id)}>Start</Button>
                    </div>
                  </div>
                </div>
              ))}
              {(!templates || templates.length === 0) && <p className="text-sm text-muted-foreground">No templates yet.</p>}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Template Editor</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedTemplate && <p className="text-sm text-muted-foreground">Select a template to edit exercises.</p>}
              {selectedTemplate && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Exercises in Template</h3>
                    <div className="space-y-2">
                      {(tExercises ?? []).map(te => (
                        <div key={te.id} className="border rounded-md p-2 flex items-center justify-between">
                          <span>Exercise: {te.exercise_id} • Sets: {te.default_sets} • Reps: {te.target_reps || '-'} </span>
                        </div>
                      ))}
                      {(tExercises?.length || 0) === 0 && <p className="text-xs text-muted-foreground">No exercises in this template yet.</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Add Exercise</h3>
                    <div className="flex items-center gap-2">
                      <Input placeholder="Search exercises..." value={q} onChange={(e) => setQ(e.target.value)} />
                      <Select value={muscle || "__all__"} onValueChange={(v) => setMuscle(v === "__all__" ? "" : v)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Filter muscle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All</SelectItem>
                          <SelectItem value="Chest">Chest</SelectItem>
                          <SelectItem value="Back">Back</SelectItem>
                          <SelectItem value="Shoulders">Shoulders</SelectItem>
                          <SelectItem value="Biceps">Biceps</SelectItem>
                          <SelectItem value="Triceps">Triceps</SelectItem>
                          <SelectItem value="Quadriceps">Quadriceps</SelectItem>
                          <SelectItem value="Hamstrings">Hamstrings</SelectItem>
                          <SelectItem value="Glutes">Glutes</SelectItem>
                          <SelectItem value="Calves">Calves</SelectItem>
                          <SelectItem value="Abs">Abs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mt-2 space-y-2 max-h-80 overflow-auto">
                      {(results ?? []).map(ex => (
                        <div key={ex.id} className="border rounded-md p-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{getTranslatedName(ex)}</div>
                    </div>
                          <Button size="sm" onClick={() => addExercise(ex.id)}>Add</Button>
                        </div>
                      ))}
                      {q.length <= 1 && <p className="text-xs text-muted-foreground">Type at least 2 characters to search.</p>}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default Templates;
