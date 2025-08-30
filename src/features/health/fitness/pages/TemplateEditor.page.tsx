import React, { useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ArrowLeft, Trash2, Edit2, Settings, Plus, GripHorizontal } from "lucide-react";
import { useTemplateExercises, useAddExerciseToTemplate, useDeleteTemplateExercise, useTemplateDetail, useUpdateTemplate, useTemplateExercisePreferences, useUpsertTemplateExercisePreferences } from "@/features/health/fitness/services/fitness.api";
import GripSelector from "@/components/GripSelector";
import { HandleGripSelector } from "@/components/exercise/HandleGripSelector";
import ExerciseConfigDialog from "@/components/exercise/ExerciseConfigDialog";
import { useTranslations } from "@/hooks/useTranslations";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageNav from "@/components/PageNav";
import { getExerciseNameFromTranslations } from "@/utils/exerciseTranslations";
import ExerciseGripDialog from "@/components/exercise/ExerciseGripDialog";
import { toast } from "sonner";

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
  translations: any;
  primary_muscle_id?: string;
  body_part_id?: string;
  muscle_name?: string;
  muscle_group_name?: string;
  popularity_rank?: number;
}

interface ExerciseGripEditor {
  exerciseId: string;
  selectedGrips: string[];
}

const TemplateEditor: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  
  // Template data and mutations
  const { data: template } = useTemplateDetail(templateId);
  const { data: templateExercises = [] } = useTemplateExercises(templateId);
  const addToTemplate = useAddExerciseToTemplate();
  const deleteFromTemplate = useDeleteTemplateExercise();
  const updateTemplate = useUpdateTemplate();

  // Get exercise details for template exercises
  const { data: templateExerciseDetails = [] } = useQuery({
    queryKey: ["template_exercise_details", templateExercises],
    queryFn: async () => {
      if (templateExercises.length === 0) return [];
      
      const exerciseIds = templateExercises.map(te => te.exercise_id);
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          id,
          exercises_translations(language_code, name, description)
        `)
        .in('id', exerciseIds);
      
      if (error) {
        console.error('Error fetching exercise details:', error);
        throw error;
      }
      return data || [];
    },
    enabled: templateExercises.length > 0
  });

  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [gripEditors, setGripEditors] = useState<Record<string, ExerciseGripEditor>>({});
  
  // Grip dialog states
  const [isGripDialogOpen, setIsGripDialogOpen] = useState(false);
  const [pendingExercise, setPendingExercise] = useState<{ id: string; name: string } | null>(null);
  
  // Exercise configuration dialog states
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [configExercise, setConfigExercise] = useState<any>(null);
  
  // Grips mutation
  const upsertPreferences = useUpsertTemplateExercisePreferences();
  
  // Query client for mutations
  const queryClient = useQueryClient();
  
  // Reorder mutation
  const reorderExercises = useMutation({
    mutationFn: async (updates: { id: string; order_index: number }[]) => {
      const promises = updates.map(update => 
        supabase
          .from('template_exercises')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      );
      
      const results = await Promise.all(promises);
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error('Failed to reorder exercises');
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template_exercises"] });
      toast.success("Exercises reordered successfully");
    },
    onError: () => {
      toast.error("Failed to reorder exercises");
    }
  });
  
  // Update exercise mutation
  const updateExercise = useMutation({
    mutationFn: async (updates: any) => {
      const { data, error } = await supabase
        .from('template_exercises')
        .update(updates)
        .eq('id', updates.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["template_exercises"] });
      toast.success("Exercise updated successfully");
    },
    onError: () => {
      toast.error("Failed to update exercise");
    }
  });

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
        .from('body_parts')
        .select(`
          id, 
          slug,
          body_parts_translations!inner(name, description)
        `)
        .eq('body_parts_translations.language_code', 'en');
      
      if (error) {
        console.error('Error fetching body parts:', error);
        throw error;
      }
      
      // Transform data to match our interface
      return (data || []).map(item => ({
        id: item.id,
        translations: {
          en: {
            name: (item.body_parts_translations as any)[0]?.name || item.slug,
            description: (item.body_parts_translations as any)[0]?.description
          }
        }
      })).sort((a, b) => a.translations.en.name.localeCompare(b.translations.en.name));
    }
  });

  const { data: muscleGroups = [] } = useQuery<MuscleGroup[]>({
    queryKey: ["muscle_groups", selectedBodyPart],
    queryFn: async () => {
      let query = supabase
        .from('muscle_groups')
        .select(`
          id, 
          body_part_id, 
          slug,
          muscle_groups_translations!inner(name, description)
        `)
        .eq('muscle_groups_translations.language_code', 'en');
      
      if (selectedBodyPart && selectedBodyPart !== "all") {
        query = query.eq('body_part_id', selectedBodyPart);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching muscle groups:', error);
        throw error;
      }
      
      // Transform data to match our interface
      return (data || []).map(item => ({
        id: item.id,
        body_part_id: item.body_part_id,
        translations: {
          en: {
            name: (item.muscle_groups_translations as any)[0]?.name || item.slug,
            description: (item.muscle_groups_translations as any)[0]?.description
          }
        }
      })).sort((a, b) => a.translations.en.name.localeCompare(b.translations.en.name));
    },
    enabled: true // Always fetch muscle groups
  });

  const { data: muscles = [] } = useQuery<Muscle[]>({
    queryKey: ["muscles", selectedMuscleGroup],
    queryFn: async () => {
      let query = supabase
        .from('muscles')
        .select(`
          id, 
          muscle_group_id, 
          slug,
          muscles_translations!inner(name, description)
        `)
        .eq('muscles_translations.language_code', 'en');
      
      if (selectedMuscleGroup && selectedMuscleGroup !== "all") {
        query = query.eq('muscle_group_id', selectedMuscleGroup);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error('Error fetching muscles:', error);
        throw error;
      }
      
      // Transform data to match our interface
      return (data || []).map(item => ({
        id: item.id,
        muscle_group_id: item.muscle_group_id,
        translations: {
          en: {
            name: (item.muscles_translations as any)[0]?.name || item.slug,
            description: (item.muscles_translations as any)[0]?.description
          }
        }
      })).sort((a, b) => a.translations.en.name.localeCompare(b.translations.en.name));
    },
    enabled: true // Always fetch muscles
  });

  const { data: exercises = [] } = useQuery<Exercise[]>({
    queryKey: ["exercises_for_template", searchQuery, selectedMuscle, selectedMuscleGroup, selectedBodyPart],
    queryFn: async () => {
      if (searchQuery.length < 2 && (!selectedMuscle || selectedMuscle === "all") && (!selectedMuscleGroup || selectedMuscleGroup === "all") && (!selectedBodyPart || selectedBodyPart === "all")) {
        return [];
      }

      // Simple query that gets exercises with basic info
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercises')
        .select('id, primary_muscle_id, body_part_id, popularity_rank, is_public')
        .eq('is_public', true)
        .limit(100);

      if (exerciseError) {
        console.error('Error fetching exercises:', exerciseError);
        throw exerciseError;
      }

      // Get translations separately
      const exerciseIds = exerciseData?.map(e => e.id) || [];
      if (exerciseIds.length === 0) return [];

      const { data: translationData, error: translationError } = await supabase
        .from('exercises_translations')
        .select('exercise_id, name, description, language_code')
        .in('exercise_id', exerciseIds)
        .eq('language_code', 'en');

      if (translationError) {
        console.error('Error fetching translations:', translationError);
        // Continue without translations rather than failing
      }

      // Get muscle data for enhanced search
      const { data: muscleData } = await supabase
        .from('muscles')
        .select(`
          id,
          muscles_translations!inner(name, language_code)
        `)
        .eq('muscles_translations.language_code', 'en');

      const { data: muscleGroupData } = await supabase
        .from('muscle_groups')
        .select(`
          id,
          muscle_groups_translations!inner(name, language_code)
        `)
        .eq('muscle_groups_translations.language_code', 'en');

      // Create lookup maps
      const translationMap = new Map();
      translationData?.forEach(t => {
        translationMap.set(t.exercise_id, { name: t.name, description: t.description });
      });

      const muscleMap = new Map();
      muscleData?.forEach(m => {
        const translation = (m.muscles_translations as any[])?.[0];
        if (translation) {
          muscleMap.set(m.id, translation.name);
        }
      });

      const muscleGroupMap = new Map();
      muscleGroupData?.forEach(mg => {
        const translation = (mg.muscle_groups_translations as any[])?.[0];
        if (translation) {
          muscleGroupMap.set(mg.id, translation.name);
        }
      });

      // Get muscle group IDs for muscles
      const { data: muscleRelations } = await supabase
        .from('muscles')
        .select('id, muscle_group_id');

      const muscleToGroupMap = new Map();
      muscleRelations?.forEach(m => {
        muscleToGroupMap.set(m.id, m.muscle_group_id);
      });

      let results = (exerciseData || []).map(item => {
        const translation = translationMap.get(item.id) || { name: '', description: '' };
        const muscleName = muscleMap.get(item.primary_muscle_id) || '';
        const muscleGroupId = muscleToGroupMap.get(item.primary_muscle_id);
        const muscleGroupName = muscleGroupId ? muscleGroupMap.get(muscleGroupId) || '' : '';

        return {
          id: item.id,
          primary_muscle_id: item.primary_muscle_id,
          body_part_id: item.body_part_id,
          popularity_rank: item.popularity_rank,
          translations: {
            en: {
              name: translation.name,
              description: translation.description
            }
          },
          muscle_name: muscleName,
          muscle_group_name: muscleGroupName
        };
      });

      // Apply dropdown filters first
      if (selectedMuscle && selectedMuscle !== "all") {
        results = results.filter(exercise => exercise.primary_muscle_id === selectedMuscle);
      }
      
      if (selectedMuscleGroup && selectedMuscleGroup !== "all") {
        results = results.filter(exercise => {
          const muscleGroupId = muscleToGroupMap.get(exercise.primary_muscle_id);
          return muscleGroupId === selectedMuscleGroup;
        });
      }
      
      if (selectedBodyPart && selectedBodyPart !== "all") {
        results = results.filter(exercise => {
          // If exercise has no body_part_id, check if it's muscle group matches the body part
          if (!exercise.body_part_id) {
            // For exercises without body parts, check if their muscle group belongs to the selected body part
            const muscleGroupId = muscleToGroupMap.get(exercise.primary_muscle_id);
            if (muscleGroupId) {
              const muscleGroup = muscleGroups.find(mg => mg.id === muscleGroupId);
              return muscleGroup?.body_part_id === selectedBodyPart;
            }
            return false;
          }
          return exercise.body_part_id === selectedBodyPart;
        });
      }
      
      // Client-side filtering for search if we have a search query
      if (searchQuery.length >= 2) {
        const searchLower = searchQuery.toLowerCase();
        results = results.filter(exercise => {
          const exerciseName = exercise.translations.en.name;
          
          // Search in exercise name, muscle name, and muscle group name
          const searchableText = [
            exerciseName,
            exercise.muscle_name,
            exercise.muscle_group_name
          ].filter(Boolean).join(' ').toLowerCase();
          
          return searchableText.includes(searchLower);
        });
      }
      
      // Sort by popularity rank
      results.sort((a, b) => {
        const aRank = a.popularity_rank || 999999;
        const bRank = b.popularity_rank || 999999;
        return aRank - bRank;
      });
      
      return results;
    },
    enabled: searchQuery.length >= 2 || (selectedMuscle && selectedMuscle !== "all") || (selectedMuscleGroup && selectedMuscleGroup !== "all") || (selectedBodyPart && selectedBodyPart !== "all")
  });

  // Helper to get translated name from the nested translations object
  const getTranslatedNameFromData = (translations: any) => {
    if (!translations || typeof translations !== 'object') return null;
    
    // Try current language first, then English fallback
    const currentLang = 'en'; // You can get this from i18n if needed
    if (translations[currentLang]?.name) return translations[currentLang].name;
    if (translations['en']?.name) return translations['en'].name;
    
    // Return first available translation
    const firstLang = Object.keys(translations)[0];
    return firstLang ? translations[firstLang]?.name : null;
  };

  // Helper to get exercise name by ID
  const getExerciseName = (exerciseId: string) => {
    const exercise = templateExerciseDetails.find(e => e.id === exerciseId);
    if (!exercise) return `Exercise ${exerciseId}`;
    
    // Get translated name from translations
    const translatedName = getTranslatedNameFromData(exercise.translations);
    return translatedName || `Exercise ${exerciseId}`;
  };

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

  const handleAddExercise = (exerciseId: string, gripIds?: string[], displayName?: string) => {
    console.log('Adding exercise:', exerciseId, 'to template:', templateId, 'with grips:', gripIds, 'display name:', displayName);
    if (templateId) {
      const nextOrderIndex = Math.max(...templateExercises.map(te => te.order_index), -1) + 1;
      console.log('Next order index:', nextOrderIndex);
      addToTemplate.mutate({
        template_id: templateId,
        exercise_id: exerciseId,
        order_index: nextOrderIndex,
        default_sets: 3,
        weight_unit: 'kg',
        grip_ids: gripIds,
        display_name: displayName
      }, {
        onSuccess: (data) => {
          console.log('Successfully added exercise:', data);
        },
        onError: (error) => {
          console.error('Failed to add exercise:', error);
        }
      });
    } else {
      console.error('No templateId available');
    }
  };

  const handleAddExerciseClick = (exerciseId: string, exerciseName: string) => {
    // Check if exercise already exists (allow duplicates)
    setPendingExercise({ id: exerciseId, name: exerciseName });
    setIsGripDialogOpen(true);
  };

  const handleConfirmAddExercise = (handleId: string | undefined, gripIds: string[], displayName: string) => {
    if (pendingExercise) {
      handleAddExercise(pendingExercise.id, gripIds.length > 0 ? gripIds : undefined, displayName !== pendingExercise.name ? displayName : undefined);
      setPendingExercise(null);
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

  // Drag and drop handler
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const startIndex = result.source.index;
    const endIndex = result.destination.index;

    if (startIndex === endIndex) return;

    const sortedExercises = [...templateExercises].sort((a, b) => a.order_index - b.order_index);
    const [removed] = sortedExercises.splice(startIndex, 1);
    sortedExercises.splice(endIndex, 0, removed);

    // Update order indices
    const updates = sortedExercises.map((exercise, index) => ({
      id: exercise.id,
      order_index: index
    }));

    reorderExercises.mutate(updates);
  };

  // Open configuration dialog
  const handleConfigureExercise = (exercise: any) => {
    setConfigExercise(exercise);
    setIsConfigDialogOpen(true);
  };

  // Query grips for display
  const { data: gripsData = [] } = useQuery({
    queryKey: ["grips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grips')
        .select('id, slug');
      
      if (error) {
        console.error('Error fetching grips:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Query handles for display  
  const { data: handlesData = [] } = useQuery({
    queryKey: ["handles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('handles')
        .select('id, slug');
      
      if (error) {
        console.error('Error fetching handles:', error);
        return [];
      }
      
      return data || [];
    }
  });

  // Helper to get grip names by IDs
  const getGripDisplay = (gripIds: string[]) => {
    if (!gripIds || gripIds.length === 0) return '';
    const gripNames = gripIds.map(id => {
      const grip = gripsData.find(g => g.id === id);
      return grip?.slug || id;
    });
    return gripNames.join(', ');
  };

  // Helper to get handle name by ID
  const getHandleDisplay = (handleId: string) => {
    if (!handleId) return '';
    const handle = handlesData.find(h => h.id === handleId);
    return handle?.slug || handleId;
  };

  if (!templateId) {
    return <div>Template not found</div>;
  }

  console.log('Template ID from URL:', templateId);
  console.log('Template data:', template);

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
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="template-exercises">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {templateExercises
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((templateExercise, index) => (
                          <Draggable 
                            key={templateExercise.id} 
                            draggableId={templateExercise.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`border rounded-lg bg-background ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''
                                }`}
                              >
                                <div className="flex items-center p-4">
                                  <div 
                                    {...provided.dragHandleProps}
                                    className="mr-3 p-1 text-muted-foreground hover:text-foreground cursor-grab"
                                  >
                                    <GripHorizontal className="h-4 w-4" />
                                  </div>
                                  
                                  <div className="flex-1">
                                    <h4 className="font-medium">
                                      {templateExercise.display_name || getExerciseName(templateExercise.exercise_id)}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      {templateExercise.default_sets} sets
                                      {templateExercise.target_reps && ` × ${templateExercise.target_reps} reps`}
                                      {templateExercise.target_weight && ` @ ${templateExercise.target_weight}${templateExercise.weight_unit}`}
                                    </p>
                                    
                                    {/* TODO: Display selected handle here */}
                                    
                                    {/* Display grips */}
                                    {templateExercise.grip_ids && templateExercise.grip_ids.length > 0 && (
                                      <p className="text-xs text-blue-600 mt-1">
                                        Grips: {getGripDisplay(templateExercise.grip_ids)}
                                      </p>
                                    )}
                                    
                                    {templateExercise.notes && (
                                      <p className="text-sm text-muted-foreground mt-1">{templateExercise.notes}</p>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleConfigureExercise(templateExercise)}
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
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Body Parts</SelectItem>
                  {bodyParts.map((bodyPart) => (
                    <SelectItem key={bodyPart.id} value={bodyPart.id}>
                      {getTranslatedNameFromData(bodyPart.translations) || `Body Part ${bodyPart.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Muscle Group" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Muscle Groups</SelectItem>
                  {muscleGroups.map((muscleGroup) => (
                    <SelectItem key={muscleGroup.id} value={muscleGroup.id}>
                      {getTranslatedNameFromData(muscleGroup.translations) || `Muscle Group ${muscleGroup.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
                <SelectTrigger>
                  <SelectValue placeholder="Muscle" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Muscles</SelectItem>
                  {muscles.map((muscle) => (
                    <SelectItem key={muscle.id} value={muscle.id}>
                      {getTranslatedNameFromData(muscle.translations) || `Muscle ${muscle.id}`}
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
                         <h5 className="font-medium">
                           {getTranslatedNameFromData(exercise.translations) || getExerciseNameFromTranslations(exercise.translations) || 'Unknown Exercise'}
                         </h5>
                         <p className="text-xs text-muted-foreground">
                           {exercise.muscle_group_name && exercise.muscle_name 
                             ? `${exercise.muscle_group_name} > ${exercise.muscle_name}`
                             : exercise.muscle_group_name || exercise.muscle_name || 'Unknown muscle'
                           }
                         </p>
                       </div>
                       <div className="flex gap-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleAddExerciseClick(exercise.id, getTranslatedNameFromData(exercise.translations) || 'Unknown Exercise')}
                         >
                           <Plus className="h-4 w-4 mr-1" />
                           Add
                         </Button>
                       </div>
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

            {searchQuery.length < 2 && (!selectedMuscle || selectedMuscle === "all") && (!selectedMuscleGroup || selectedMuscleGroup === "all") && (!selectedBodyPart || selectedBodyPart === "all") && (
              <p className="text-center text-muted-foreground py-4">
                Search for exercises or select filters to see available exercises.
              </p>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Exercise Grip Dialog */}
      <ExerciseGripDialog
        isOpen={isGripDialogOpen}
        onClose={() => setIsGripDialogOpen(false)}
        onConfirm={handleConfirmAddExercise}
        exerciseName={pendingExercise?.name || ''}
      />

      {/* Exercise Configuration Dialog */}
      <ExerciseConfigDialog
        isOpen={isConfigDialogOpen}
        onClose={() => {
          setIsConfigDialogOpen(false);
          setConfigExercise(null);
        }}
        onSave={(config) => {
          if (configExercise) {
            const { id, ...updates } = { ...config, id: configExercise.id };
            updateExercise.mutate(updates);
          }
          setIsConfigDialogOpen(false);
          setConfigExercise(null);
        }}
        exercise={configExercise}
      />
    </>
  );
};

export default TemplateEditor;