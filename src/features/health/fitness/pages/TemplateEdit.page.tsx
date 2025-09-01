import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PageNav from "@/components/PageNav";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  useTemplateDetail, 
  useTemplateExercises, 
  useUpdateTemplate,
  useDeleteTemplate
} from "../services/fitness.api";

export default function TemplateEdit() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: template, isLoading: templateLoading } = useTemplateDetail(templateId);
  const { data: exercises, isLoading: exercisesLoading } = useTemplateExercises(templateId);
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();

  useEffect(() => {
    if (template) {
      setName(template.name || "");
      setNotes(template.notes || "");
    }
  }, [template]);

  const handleSave = async () => {
    if (!templateId) return;
    
    try {
      await updateTemplate.mutateAsync({
        templateId,
        updates: {
          name: name.trim() || "Untitled Template",
          notes: notes.trim()
        }
      });
      setIsEditing(false);
      toast.success("Template updated successfully");
    } catch (error) {
      toast.error("Failed to update template");
      console.error("Template update error:", error);
    }
  };

  const handleDelete = async () => {
    if (!templateId) return;
    
    if (confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      try {
        await deleteTemplate.mutateAsync(templateId);
        toast.success("Template deleted successfully");
        navigate("/fitness/templates");
      } catch (error) {
        toast.error("Failed to delete template");
        console.error("Template delete error:", error);
      }
    }
  };

  const handleAddExercise = () => {
    // TODO: Implement add exercise functionality
    toast.info("Add exercise functionality coming soon");
  };

  if (templateLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">Template Not Found</h1>
          <Button onClick={() => navigate("/fitness/templates")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageNav current="Templates" />
      
      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/fitness/templates")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Templates
            </Button>
            <h1 className="text-2xl font-semibold">Edit Template</h1>
          </div>
          
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={updateTemplate.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Details
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deleteTemplate.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Template Details */}
        <Card>
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Template name"
                />
              ) : (
                <div className="text-lg">{name || "Untitled Template"}</div>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              {isEditing ? (
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Template description or notes"
                  rows={3}
                />
              ) : (
                <div className="text-muted-foreground">
                  {notes || "No description"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Exercises */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Exercises</CardTitle>
              <Button onClick={handleAddExercise}>
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {exercisesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : exercises && exercises.length > 0 ? (
              <div className="space-y-3">
                {exercises.map((exercise, index) => (
                  <div 
                    key={exercise.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">
                          Exercise {exercise.exercise_id.slice(0, 8)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {exercise.default_sets} sets × {exercise.target_reps} reps
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-4">No exercises in this template yet.</div>
                <Button onClick={handleAddExercise}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Exercise
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}