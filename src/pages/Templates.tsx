import React from "react";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useAddExerciseToTemplate, useCloneTemplateToWorkout, useCreateTemplate, useSearchExercises, useTemplateExercises, useTemplates } from "@/features/fitness/api";

const Templates: React.FC = () => {
  const navigate = useNavigate();
  const { data: templates } = useTemplates();
  const create = useCreateTemplate();
  const startFrom = useCloneTemplateToWorkout();

  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const { data: tExercises } = useTemplateExercises(selectedTemplate || undefined);
  const addToTemplate = useAddExerciseToTemplate();

  const [q, setQ] = React.useState("");
  const { data: results } = useSearchExercises(q);

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
                    <div className="text-sm font-medium">{t.name}</div>
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
                    <Input placeholder="Search exercises..." value={q} onChange={(e) => setQ(e.target.value)} />
                    <div className="mt-2 space-y-2 max-h-80 overflow-auto">
                      {(results ?? []).map(ex => (
                        <div key={ex.id} className="border rounded-md p-2 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{ex.name}</div>
                            <div className="text-xs text-muted-foreground">{ex.primary_muscle} • {ex.equipment}</div>
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
