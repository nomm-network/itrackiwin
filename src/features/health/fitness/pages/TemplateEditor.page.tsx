import React, { useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { ArrowLeft, Trash2, Edit2, Settings } from "lucide-react";
import { useTemplateExercises, useAddExerciseToTemplate, useDeleteTemplateExercise, useTemplateDetail, useUpdateTemplate, useTemplateExercisePreferences, useUpsertTemplateExercisePreferences } from "@/features/health/fitness/services/fitness.api";
import GripSelector from "@/components/GripSelector";
import { useTranslations } from "@/hooks/useTranslations";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import PageNav from "@/components/PageNav";

interface BodyPart {
  id: string;
  translations: any;
}

interface MuscleGroup {
  id: string;
  body_part_id: string;
  translations: any;
}

interface Muscle {
  id: string;
  muscle_group_id: string;
  translations: any;
}

interface Exercise {
  id: string;
  name: string;
  translations?: any;
  primary_muscle_id?: string;
  body_part_id?: string;
}

interface ExerciseGripEditor {
  exerciseId: string;
  selectedGrips: string[];
}

const TemplateEditor: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { getTranslatedName } = useTranslations();
  
  // Template data and mutations
  const { data: template } = useTemplateDetail(templateId);
  const { data: templateExercises = [] } = useTemplateExercises(templateId);
  const addToTemplate = useAddExerciseToTemplate();
  const deleteFromTemplate = useDeleteTemplateExercise();
  const updateTemplate = useUpdateTemplate();

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [gripEditors, setGripEditors] = useState<Record<string, ExerciseGripEditor>>({});
  
  // Grips mutation
  const upsertPreferences = useUpsertTemplateExercisePreferences();

  // Filter states
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("all");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("all");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Data queries
  const { data: bodyParts = [] } = useQuery<BodyPart[]>({
    queryKey: ["body_parts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_body_parts_with_translations')
        .select('id, translations')
        .order('id');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: muscleGroups = [] } = useQuery<MuscleGroup[]>({
    queryKey: ["muscle_groups", selectedBodyPart],
    queryFn: async () => {
      let query = supabase
        .from('v_muscle_groups_with_translations')
        .select('id, body_part_id, translations')
        .order('id');
      
      if (selectedBodyPart && selectedBodyPart !== "all") {
        query = query.eq('body_part_id', selectedBodyPart);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: muscles = [] } = useQuery<Muscle[]>({
    queryKey: ["muscles", selectedMuscleGroup],
    queryFn: async () => {
      let query = supabase
        .from('v_muscles_with_translations')
        .select('id, muscle_group_id, translations')
        .order('id');
      
      if (selectedMuscleGroup && selectedMuscleGroup !== "all") {
        query = query.eq('muscle_group_id', selectedMuscleGroup);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["exercises_for_template", searchQuery, selectedMuscle, selectedBodyPart],
    queryFn: async () => {
      if (searchQuery.length < 2 && (!selectedMuscle || selectedMuscle === "all") && (!selectedBodyPart || selectedBodyPart === "all")) {
        return [];
      }

      let query = supabase
        .from('v_exercises_with_translations')
        .select('id, name, translations, primary_muscle_id, body_part_id')
        .eq('is_public', true)
        .order('popularity_rank', { ascending: false, nullsFirst: false })
        .limit(20);

      if (searchQuery.length >= 2) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      if (selectedMuscle && selectedMuscle !== "all") {
        query = query.eq('primary_muscle_id', selectedMuscle);
      } else if (selectedBodyPart && selectedBodyPart !== "all") {
        query = query.eq('body_part_id', selectedBodyPart);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.length >= 2 || (selectedMuscle && selectedMuscle !== "all") || (selectedBodyPart && selectedBodyPart !== "all")
  });

  // Helper functions
  const handleUpdateTemplateName = (newName: string) => {
    if (template) {
      updateTemplate.mutate({
        templateId: template.id,
        updates: { name: newName }
      });
      setIsEditingName(false);
    }
  };

  const handleUpdateTemplateDescription = (newDescription: string) => {
    if (template) {
      updateTemplate.mutate({
        templateId: template.id,
        updates: { notes: newDescription }
      });
      setIsEditingDescription(false);
    }
  };

  const handleAddExercise = (exerciseId: string) => {
    if (templateId) {
      const nextOrderIndex = Math.max(...templateExercises.map(te => te.order_index), -1) + 1;
      addToTemplate.mutate({
        template_id: templateId,
        exercise_id: exerciseId,
        order_index: nextOrderIndex,
        default_sets: 3,
        weight_unit: 'kg'
      });
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    deleteFromTemplate.mutate(exerciseId);
  };

  const handleUpdateGrips = (templateExerciseId: string, selectedGrips: string[]) => {
    upsertPreferences.mutate({
      template_exercise_id: templateExerciseId,
      preferred_grips: selectedGrips
    });
  };

  if (!templateId) {
    return <div>Template not found</div>;
  }

  return (
    <>
      <PageNav current="Template Editor" />
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

      <main className="container py-4 md:py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/fitness/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-semibold">
              Template Editor
            </h1>
          </div>
        </div>

        {/* Template Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {isEditingName ? (
                  <Input
                    defaultValue={template?.name || ''}
                    onBlur={(e) => handleUpdateTemplateName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateTemplateName(e.currentTarget.value);
                      }
                    }}
                    className="text-xl font-semibold"
                    autoFocus
                  />
                ) : (
                  <CardTitle 
                    className="cursor-pointer flex items-center gap-2"
                    onClick={() => setIsEditingName(true)}
                  >
                    {template?.name || 'Untitled Template'}
                    <Edit2 className="h-4 w-4 opacity-50" />
                  </CardTitle>
                )}
              </div>
            </div>
            {isEditingDescription ? (
              <textarea
                defaultValue={template?.notes || ''}
                onBlur={(e) => handleUpdateTemplateDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleUpdateTemplateDescription(e.currentTarget.value);
                  }
                }}
                className="w-full p-2 border rounded resize-none"
                rows={3}
                placeholder="Add template description..."
                autoFocus
              />
            ) : (
              <p 
                className="text-muted-foreground cursor-pointer"
                onClick={() => setIsEditingDescription(true)}
              >
                {template?.notes || 'Click to add description...'}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Current Exercises */}
        <Card>
          <CardHeader>
            <CardTitle>Exercises in Template</CardTitle>
          </CardHeader>
          <CardContent>
            {templateExercises.length > 0 ? (
              <div className="space-y-4">
                {templateExercises.map((templateExercise) => (
                  <div key={templateExercise.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Exercise {templateExercise.exercise_id}</h4>
                      <p className="text-sm text-muted-foreground">
                        {templateExercise.default_sets} sets
                        {templateExercise.target_reps && ` × ${templateExercise.target_reps} reps`}
                        {templateExercise.target_weight && ` @ ${templateExercise.target_weight}${templateExercise.weight_unit}`}
                      </p>
                      {templateExercise.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{templateExercise.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingExerciseId(
                          editingExerciseId === templateExercise.id ? null : templateExercise.id
                        )}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteExercise(templateExercise.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No exercises in this template yet. Add some exercises below.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Add Exercises */}
        <Card>
          <CardHeader>
            <CardTitle>Add Exercises</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Select value={selectedBodyPart} onValueChange={setSelectedBodyPart}>
                <SelectTrigger>
                  <SelectValue placeholder="Body Part" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Body Parts</SelectItem>
                  {bodyParts.map((bodyPart) => (
                    <SelectItem key={bodyPart.id} value={bodyPart.id}>
                      {getTranslatedName(bodyPart.translations)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Muscle Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Muscle Groups</SelectItem>
                  {muscleGroups.map((muscleGroup) => (
                    <SelectItem key={muscleGroup.id} value={muscleGroup.id}>
                      {getTranslatedName(muscleGroup.translations)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
                <SelectTrigger>
                  <SelectValue placeholder="Muscle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Muscles</SelectItem>
                  {muscles.map((muscle) => (
                    <SelectItem key={muscle.id} value={muscle.id}>
                      {getTranslatedName(muscle.translations)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exercise Results */}
            {exercises.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Available Exercises</h4>
                <div className="grid gap-2 max-h-96 overflow-y-auto">
                  {exercises.map((exercise) => (
                    <div key={exercise.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{getTranslatedName(exercise.translations) || exercise.name}</h5>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddExercise(exercise.id)}
                        disabled={templateExercises.some(te => te.exercise_id === exercise.id)}
                      >
                        {templateExercises.some(te => te.exercise_id === exercise.id) ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchQuery.length >= 2 && exercises.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No exercises found matching your search.
              </p>
            )}

            {searchQuery.length < 2 && (!selectedMuscle || selectedMuscle === "all") && (!selectedBodyPart || selectedBodyPart === "all") && (
              <p className="text-center text-muted-foreground py-4">
                Search for exercises or select filters to see available exercises.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default TemplateEditor;