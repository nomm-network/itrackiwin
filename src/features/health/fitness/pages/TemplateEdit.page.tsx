import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import PageNav from "@/components/PageNav";
import { ArrowLeft, Plus, Save, Trash2, GripVertical, Search, Globe, Star } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  useTemplateDetail, 
  useTemplateExercises, 
  useUpdateTemplate,
  useDeleteTemplate,
  useAddExerciseToTemplate
} from "../services/fitness.api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useExerciseTranslation } from "@/hooks/useExerciseTranslations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExerciseNameDisplay } from "../components/ExerciseNameDisplay";
import { useTranslation } from 'react-i18next';
import { useFavoriteTemplate, useToggleFavoriteTemplate } from '@/features/training/hooks';

interface Exercise {
  id: string;
  name: string;
  primary_muscle?: string;
  equipment?: string;
}

interface MuscleGroup {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  name: string;
}

export default function TemplateEdit() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("all");
  const [selectedEquipment, setSelectedEquipment] = useState("all");

  const { data: template, isLoading: templateLoading } = useTemplateDetail(templateId);
  const { data: exercises, isLoading: exercisesLoading, refetch: refetchExercises } = useTemplateExercises(templateId);
  const updateTemplate = useUpdateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const addExerciseToTemplate = useAddExerciseToTemplate();

  // Favorite functionality
  const { data: isFavorite, isLoading: favoriteLoading } = useFavoriteTemplate(templateId);
  const toggleFavorite = useToggleFavoriteTemplate();

  // Fetch muscle groups
  const { data: muscleGroups = [] } = useQuery({
    queryKey: ['muscle-groups'],
    queryFn: async (): Promise<MuscleGroup[]> => {
      const { data, error } = await supabase
        .from('muscle_groups')
        .select(`
          id,
          muscle_groups_translations!inner(name)
        `)
        .eq('muscle_groups_translations.language_code', 'en');
        
      if (error) throw error;
      
      return (data || []).map(mg => ({
        id: mg.id,
        name: (mg.muscle_groups_translations as any)[0]?.name || 'Unknown'
      }));
    }
  });

  // Fetch equipment
  const { data: equipmentList = [] } = useQuery({
    queryKey: ['equipment-list'],
    queryFn: async (): Promise<Equipment[]> => {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          id,
          equipment_translations!inner(name)
        `)
        .eq('equipment_translations.language_code', 'en');
        
      if (error) throw error;
      
      return (data || []).map(eq => ({
        id: eq.id,
        name: (eq.equipment_translations as any)[0]?.name || 'Unknown'
      }));
    }
  });

  // Search exercises for adding to template
  const { data: searchExercises, isLoading: searchLoading } = useQuery({
    queryKey: ['exercise-search', exerciseSearch, selectedMuscleGroup, selectedEquipment],
    queryFn: async (): Promise<Exercise[]> => {
      let query = supabase
        .from('v_exercises_with_translations')
        .select(`
          id,
          display_name,
          translations,
          primary_muscle_id,
          equipment_id
        `);

      // Apply filters
      if (exerciseSearch) {
        query = query.or(`display_name.ilike.%${exerciseSearch}%`);
      }
      if (selectedMuscleGroup && selectedMuscleGroup !== 'all') {
        query = query.eq('primary_muscle_id', selectedMuscleGroup);
      }
      if (selectedEquipment && selectedEquipment !== 'all') {
        query = query.eq('equipment_id', selectedEquipment);
      }

      const { data, error } = await query.limit(100);
        
      if (error) {
        console.error('Exercise search error:', error);
        throw error;
      }
      
      return (data || []).map(ex => {
        const translations = ex.translations as any;
        const currentLang = i18n.language || 'en';
        const translation = translations?.[currentLang] || translations?.['en'] || {};
        
        return {
          id: ex.id,
          name: translation.name || ex.display_name || `Exercise ${ex.id.slice(0, 8)}`,
          primary_muscle: 'Muscle',
          equipment: 'Equipment'
        };
      });
    }
  });

  useEffect(() => {
    if (template) {
      setName(template.name || "");
      setNotes(template.notes || "");
      setIsPublic(template.is_public || false);
    }
  }, [template]);

  const handleSave = async () => {
    if (!templateId) return;
    
    try {
      await updateTemplate.mutateAsync({
        templateId,
        updates: {
          name: name.trim() || "Untitled Template",
          notes: notes.trim(),
          is_public: isPublic
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

  const handleAddExercise = async (exercise: Exercise) => {
    if (!templateId) return;
    
    try {
      await addExerciseToTemplate.mutateAsync({
        template_id: templateId,
        exercise_id: exercise.id,
        order_index: (exercises?.length || 0) + 1,
        default_sets: 3,
        target_reps: 10,
        weight_unit: 'kg'
      });
      
      toast.success(`Added ${exercise.name} to template`);
    setShowExerciseDialog(false);
    setExerciseSearch("");
    setSelectedMuscleGroup("all");
    setSelectedEquipment("all");
    refetchExercises();
    } catch (error) {
      toast.error("Failed to add exercise");
      console.error("Add exercise error:", error);
    }
  };

  const handleDragEnd = useCallback(async (result: any) => {
    if (!result.destination || !exercises || !templateId) return;

    const items = Array.from(exercises);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order indices
    const updates = items.map((item, index) => ({
      id: item.id,
      order_index: index + 1
    }));

    try {
      // Update each exercise's order_index
      for (const update of updates) {
        await supabase
          .from('template_exercises')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }
      
      toast.success("Exercise order updated");
      refetchExercises();
    } catch (error) {
      toast.error("Failed to reorder exercises");
      console.error("Reorder error:", error);
    }
  }, [exercises, templateId, refetchExercises]);

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!confirm("Remove this exercise from the template?")) return;
    
    try {
      await supabase
        .from('template_exercises')
        .delete()
        .eq('id', exerciseId);
        
      toast.success("Exercise removed from template");
      refetchExercises();
    } catch (error) {
      toast.error("Failed to remove exercise");
      console.error("Remove exercise error:", error);
    }
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
            {/* Favorite Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => templateId && toggleFavorite.mutate({ 
                templateId, 
                isFavorite: isFavorite || false 
              })}
              disabled={favoriteLoading || toggleFavorite.isPending}
              className={isFavorite ? "text-yellow-500 border-yellow-500" : ""}
            >
              <Star className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
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

            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="h-4 w-4" />
                  <label className="text-sm font-medium">Make Public</label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Allow other users to view and use this template
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={isPublic}
                  onCheckedChange={async (checked) => {
                    setIsPublic(checked);
                    if (templateId) {
                      try {
                        await updateTemplate.mutateAsync({
                          templateId,
                          updates: {
                            is_public: checked
                          }
                        });
                        toast.success(checked ? "Template made public" : "Template made private");
                      } catch (error) {
                        toast.error("Failed to update template visibility");
                        setIsPublic(!checked); // Revert on error
                      }
                    }
                  }}
                />
                <Badge variant={isPublic ? "default" : "secondary"}>
                  {isPublic ? "Public" : "Private"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercises */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Exercises</CardTitle>
              
              <Dialog open={showExerciseDialog} onOpenChange={setShowExerciseDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>
                </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>Add Exercise to Template</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      {/* Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search exercises..."
                            value={exerciseSearch}
                            onChange={(e) => setExerciseSearch(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                        
                        <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by muscle group" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            <div className="sticky top-0 bg-background p-2 border-b">
                              <Input
                                placeholder="Search muscle groups..."
                                className="h-8"
                                onChange={(e) => {
                                  const searchTerm = e.target.value.toLowerCase();
                                  // This will filter the visible items
                                }}
                              />
                            </div>
                            <SelectItem value="all">All muscle groups</SelectItem>
                            {muscleGroups.map((mg) => (
                              <SelectItem key={mg.id} value={mg.id}>
                                {mg.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by equipment" />
                          </SelectTrigger>
                          <SelectContent className="max-h-64">
                            <div className="sticky top-0 bg-background p-2 border-b">
                              <Input
                                placeholder="Search equipment..."
                                className="h-8"
                                onChange={(e) => {
                                  const searchTerm = e.target.value.toLowerCase();
                                  // This will filter the visible items
                                }}
                              />
                            </div>
                            <SelectItem value="all">All equipment</SelectItem>
                            {equipmentList.map((eq) => (
                              <SelectItem key={eq.id} value={eq.id}>
                                {eq.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Results */}
                      <div className="border rounded-lg max-h-96 overflow-y-auto">
                        {searchLoading ? (
                          <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-2 text-sm text-muted-foreground">Loading exercises...</p>
                          </div>
                        ) : searchExercises && Array.isArray(searchExercises) && searchExercises.length > 0 ? (
                          <div className="divide-y">
                            {searchExercises.map((exercise) => (
                              <div
                                key={exercise.id}
                                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => handleAddExercise(exercise)}
                              >
                                <div className="flex-1">
                                  <div className="font-medium text-foreground">{exercise.name}</div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {exercise.primary_muscle}
                                    </Badge>
                                    <span>•</span>
                                    <span>{exercise.equipment}</span>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">Add to Template</Button>
                              </div>
                            ))}
                          </div>
                        ) : (exerciseSearch || selectedMuscleGroup !== "all" || selectedEquipment !== "all") ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No exercises found matching your filters</p>
                            <p className="text-sm mt-1">Try adjusting your search criteria</p>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Exercises will appear here</p>
                            <p className="text-sm mt-1">Use filters above or search to find specific exercises</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {exercisesLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : exercises && exercises.length > 0 ? (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="exercises">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                      {exercises.map((exercise, index) => (
                        <Draggable 
                          key={exercise.id} 
                          draggableId={exercise.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                                snapshot.isDragging ? 'bg-muted shadow-lg' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              
                              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              
                              <div className="flex-1">
                                 <ExerciseNameDisplay exerciseId={exercise.exercise_id} />
                                 <div className="text-sm text-muted-foreground">
                                   {exercise.default_sets} sets × {exercise.target_reps} reps
                                   {exercise.target_weight_kg && ` @ ${exercise.target_weight_kg}${exercise.weight_unit || 'kg'}`}
                                 </div>
                                {exercise.notes && (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {exercise.notes}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  Edit
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleRemoveExercise(exercise.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="mb-4">No exercises in this template yet.</div>
                <Button onClick={() => setShowExerciseDialog(true)}>
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