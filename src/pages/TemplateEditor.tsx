import React, { useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { ArrowLeft, Trash2, Edit2, Settings } from "lucide-react";
import { useTemplateExercises, useAddExerciseToTemplate, useDeleteTemplateExercise, useTemplateDetail, useUpdateTemplate, useTemplateExercisePreferences, useUpsertTemplateExercisePreferences } from "@/features/fitness/api";
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
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [gripEditors, setGripEditors] = useState<Record<string, ExerciseGripEditor>>({});
  
  // Grips mutation
  const upsertPreferences = useUpsertTemplateExercisePreferences();

  // Filter states
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("");
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
      
      if (selectedBodyPart) {
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
      
      if (selectedMuscleGroup) {
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
      if (searchQuery.length < 2 && !selectedMuscle && !selectedBodyPart) {
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

      if (selectedMuscle) {
        query = query.eq('primary_muscle_id', selectedMuscle);
      } else if (selectedBodyPart) {
        query = query.eq('body_part_id', selectedBodyPart);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: searchQuery.length >= 2 || !!selectedMuscle || !!selectedBodyPart
  });

  // Get exercise names for template exercises
  const { data: exerciseNames = {} } = useQuery({
    queryKey: ["exercise_names", templateExercises.map(e => e.exercise_id)],
    queryFn: async () => {
      if (templateExercises.length === 0) return {};
      
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name')
        .in('id', templateExercises.map(e => e.exercise_id));
      
      if (error) throw error;
      
      return data.reduce((acc, ex) => {
        acc[ex.id] = ex.name;
        return acc;
      }, {} as Record<string, string>);
    },
    enabled: templateExercises.length > 0
  });

  const getTranslatedText = (translations: any, fallback: string = "Unnamed") => {
    if (!translations) return fallback;
    return translations?.en?.name || translations?.['en-US']?.name || fallback;
  };

  const handleBodyPartChange = (value: string) => {
    setSelectedBodyPart(value === "all" ? "" : value);
    setSelectedMuscleGroup("");
    setSelectedMuscle("");
  };

  const handleMuscleGroupChange = (value: string) => {
    setSelectedMuscleGroup(value === "all" ? "" : value);
    setSelectedMuscle("");
  };

  const handleMuscleChange = (value: string) => {
    setSelectedMuscle(value === "all" ? "" : value);
  };

  const addExercise = async (exerciseId: string) => {
    if (!templateId) return;
    await addToTemplate.mutateAsync({ templateId, exerciseId });
    setSearchQuery("");
  };

  const removeExercise = async (exerciseId: string) => {
    await deleteFromTemplate.mutateAsync(exerciseId);
  };

  const handleNameUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newName = formData.get('templateName') as string;
    if (templateId && newName) {
      await updateTemplate.mutateAsync({ templateId, name: newName });
      setIsEditingName(false);
    }
  };

  const toggleGripEditor = async (exerciseId: string) => {
    if (gripEditors[exerciseId]) {
      setGripEditors(prev => {
        const { [exerciseId]: removed, ...rest } = prev;
        return rest;
      });
    } else {
      // Get the exercise to check for default grips
      const templateExercise = templateExercises.find(te => te.id === exerciseId);
      if (!templateExercise) return;
      
      const { data: exercise } = await supabase
        .from('exercises')
        .select('default_grips')
        .eq('id', templateExercise.exercise_id)
        .single();
      
      const defaultGrips = exercise?.default_grips || [];
      
      setGripEditors(prev => ({
        ...prev,
        [exerciseId]: {
          exerciseId,
          selectedGrips: Array.isArray(defaultGrips) ? defaultGrips.map(String) : []
        }
      }));
    }
  };

  const handleGripsChange = (exerciseId: string, grips: string[]) => {
    setGripEditors(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        selectedGrips: grips
      }
    }));
  };

  const saveGripPreferences = async (exerciseId: string) => {
    const editor = gripEditors[exerciseId];
    if (!editor) return;

    await upsertPreferences.mutateAsync({
      templateExerciseId: exerciseId,
      preferredGrips: editor.selectedGrips
    });

    // Remove from editors after saving
    setGripEditors(prev => {
      const { [exerciseId]: removed, ...rest } = prev;
      return rest;
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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Exercises in Template */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {isEditingName ? (
                  <form onSubmit={handleNameUpdate} className="flex gap-2">
                    <Input 
                      name="templateName" 
                      defaultValue={template?.name || 'Template'} 
                      className="text-lg font-semibold"
                      autoFocus
                    />
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setIsEditingName(false)}>Cancel</Button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    Exercises in "{template?.name || 'Template'}"
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setIsEditingName(true)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {templateExercises.map(exercise => (
                  <div key={exercise.id} className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {exerciseNames[exercise.exercise_id] || `Exercise ${exercise.exercise_id}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Sets: {exercise.default_sets} • Reps: {exercise.target_reps || '-'}
                          {exercise.target_weight && ` • Weight: ${exercise.target_weight}${exercise.weight_unit}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleGripEditor(exercise.id)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeExercise(exercise.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {gripEditors[exercise.id] && (
                      <div className="pl-3">
                        <div className="space-y-3">
                          <GripSelector
                            selectedGrips={gripEditors[exercise.id].selectedGrips}
                            onGripsChange={(grips) => handleGripsChange(exercise.id, grips)}
                            requireSelection={true}
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => saveGripPreferences(exercise.id)}
                              disabled={upsertPreferences.isPending}
                            >
                              Save Grips
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => toggleGripEditor(exercise.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {templateExercises.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No exercises in this template yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Add Exercise */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Exercise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cascading Filters */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Select value={selectedBodyPart || "all"} onValueChange={handleBodyPartChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select body part" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="all">All Body Parts</SelectItem>
                    {bodyParts.map(bp => (
                      <SelectItem key={bp.id} value={bp.id}>
                        {getTranslatedText(bp.translations)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select 
                  value={selectedMuscleGroup || "all"} 
                  onValueChange={handleMuscleGroupChange}
                  disabled={!selectedBodyPart}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select muscle group" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover">
                    <SelectItem value="all">All Groups</SelectItem>
                    {muscleGroups.map(mg => (
                      <SelectItem key={mg.id} value={mg.id}>
                        {getTranslatedText(mg.translations)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select 
                value={selectedMuscle || "all"} 
                onValueChange={handleMuscleChange}
                disabled={!selectedMuscleGroup}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specific muscle" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  <SelectItem value="all">All Muscles</SelectItem>
                  {muscles.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {getTranslatedText(m.translations)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search Input */}
              <Input
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Exercise Results */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {exercises.map(exercise => (
                  <div key={exercise.id} className="flex items-center justify-between p-3 border rounded-lg">
                     <div className="flex-1 min-w-0">
                       <div className="text-sm font-medium truncate">
                         {exercise.translations ? getTranslatedText(exercise.translations, exercise.name) : exercise.name}
                       </div>
                     </div>
                    <Button size="sm" onClick={() => addExercise(exercise.id)}>
                      Add
                    </Button>
                  </div>
                ))}
                {searchQuery.length < 2 && !selectedMuscle && !selectedBodyPart && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Type at least 2 characters to search or select filters above.
                  </p>
                )}
                {(searchQuery.length >= 2 || selectedMuscle || selectedBodyPart) && exercises.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No exercises found matching your criteria.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default TemplateEditor;