import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { useTranslations } from '@/hooks/useTranslations';
import { useToast } from "@/hooks/use-toast";
import PageNav from "@/components/PageNav";
import AdminMenu from "@/admin/components/AdminMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import SecondaryMuscleGroupSelector from "@/components/SecondaryMuscleGroupSelector";
import { getExerciseNameFromTranslations } from "@/utils/exerciseTranslations";
import CreateExerciseDialog from "@/components/admin/CreateExerciseDialog";
import { Link } from "react-router-dom";

interface Exercise {
  id: string;
  translations: any;
  body_part_slug: string | null;
  body_part_id: string | null;
  primary_muscle_id: string | null;
  secondary_muscle_group_ids: string[] | null;
  equipment_id: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  is_public: boolean;
  owner_user_id: string | null;
  source_url: string | null;
  popularity_rank: number | null;
  default_grip_ids?: string[] | null;
  configured: boolean;
  created_at: string;
}

interface BodyPart {
  id: string;
  name: string;
  slug: string;
}

interface MuscleGroup {
  id: string;
  name: string;
  slug: string;
  body_part_id: string;
}

interface Muscle {
  id: string;
  name: string;
  slug: string;
  muscle_group_id: string;
}

interface Equipment {
  id: string;
  slug: string;
  created_at: string;
  translations: Record<string, { name: string; description?: string }> | null;
}

interface Grip {
  id: string;
  slug: string;
  category: string;
  translations: Record<string, { name: string; description?: string }> | null;
}

const AdminExercisesManagement: React.FC = () => {
  const { getTranslatedName } = useTranslations();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("");
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>("");
  const [selectedMuscle, setSelectedMuscle] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string>("");
  const [configuredFilter, setConfiguredFilter] = useState<string>("all");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isPublic, setIsPublic] = useState<string>("");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name?: string;
    description?: string;
    body_part_id?: string;
    primary_muscle_id?: string;
    secondary_muscle_group_ids?: string[];
    equipment_id?: string;
    is_public?: boolean;
    default_grip_ids?: string[];
    is_bar_loaded?: boolean;
    is_unilateral?: boolean;
    requires_handle?: boolean;
    movement_pattern?: string;
    skill_level?: string;
    configured?: boolean;
  }>({
    name: "",
    description: "",
    body_part_id: "",
    primary_muscle_id: "",
    secondary_muscle_group_ids: [],
    equipment_id: "",
    is_public: true,
    default_grip_ids: [],
    is_bar_loaded: false,
    is_unilateral: false,
    requires_handle: false,
    movement_pattern: "",
    skill_level: "medium",
    configured: false,
  });
  const [selectedGrips, setSelectedGrips] = useState<string[]>([]);

  // Load debug info from localStorage on mount
  useEffect(() => {
    const savedDebugInfo = localStorage.getItem('exerciseEditDebug');
    if (savedDebugInfo) {
      try {
        setDebugInfo(JSON.parse(savedDebugInfo));
        // Clear it after loading
        localStorage.removeItem('exerciseEditDebug');
      } catch (e) {
        console.error('Failed to parse debug info:', e);
      }
    }
  }, []);

  // Fetch body parts with translations
  const { data: bodyParts = [] } = useQuery({
    queryKey: ["admin_body_parts"],
    queryFn: async () => {
      const [mainResult, translationsResult] = await Promise.all([
        supabase.from('body_parts').select('*').order('created_at'),
        supabase.from('body_parts_translations').select('*').eq('language_code', 'en')
      ]);
      
      if (mainResult.error) throw mainResult.error;
      if (translationsResult.error) throw translationsResult.error;
      
      return mainResult.data.map(item => ({
        id: item.id,
        slug: item.slug,
        name: translationsResult.data.find(t => t.body_part_id === item.id)?.name || item.slug || 'Unknown'
      })) as BodyPart[];
    },
  });

  // Fetch muscle groups with translations
  const { data: muscleGroups = [] } = useQuery({
    queryKey: ["admin_muscle_groups"],
    queryFn: async () => {
      const [mainResult, translationsResult] = await Promise.all([
        supabase.from('muscle_groups').select('*').order('created_at'),
        supabase.from('muscle_groups_translations').select('*').eq('language_code', 'en')
      ]);
      
      if (mainResult.error) throw mainResult.error;
      if (translationsResult.error) throw translationsResult.error;
      
      return mainResult.data.map(item => ({
        id: item.id,
        slug: item.slug,
        body_part_id: item.body_part_id,
        name: translationsResult.data.find(t => t.muscle_group_id === item.id)?.name || item.slug || 'Unknown'
      })) as MuscleGroup[];
    },
  });

  // Fetch muscles with translations
  const { data: muscles = [] } = useQuery({
    queryKey: ["admin_muscles"],
    queryFn: async () => {
      const [mainResult, translationsResult] = await Promise.all([
        supabase.from('muscles').select('*').order('created_at'),
        supabase.from('muscles_translations').select('*').eq('language_code', 'en')
      ]);
      
      if (mainResult.error) throw mainResult.error;
      if (translationsResult.error) throw translationsResult.error;
      
      return mainResult.data.map(item => ({
        id: item.id,
        slug: item.slug,
        muscle_group_id: item.muscle_group_id,
        name: translationsResult.data.find(t => t.muscle_id === item.id)?.name || item.slug || 'Unknown'
      })) as Muscle[];
    },
  });

  // Fetch equipment
  const { data: equipment = [] } = useQuery({
    queryKey: ["admin_equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_equipment_with_translations")
        .select("*")
        .order("created_at");
      if (error) throw error;
      return data as Equipment[];
    },
  });

  // Fetch grips with translations
  const { data: grips = [] } = useQuery({
    queryKey: ["admin_grips"],
    queryFn: async () => {
      const { data: gripsData, error: gripsError } = await supabase
        .from("grips")
        .select("*")
        .order("category")
        .order("slug");
      if (gripsError) throw gripsError;

      const { data: translationsData, error: translationsError } = await supabase
        .from("grips_translations")
        .select("*");
      if (translationsError) throw translationsError;

      // Combine grips with their translations
      return gripsData.map(grip => {
        const translations = translationsData
          .filter(t => t.grip_id === grip.id)
          .reduce((acc, t) => {
            acc[t.language_code] = {
              name: t.name,
              description: t.description
            };
            return acc;
          }, {} as Record<string, { name: string; description?: string }>);

        return {
          ...grip,
          translations
        };
      });
    },
  });

  // Fetch exercises with filters
  const { data: exercises = [], isLoading, error: exercisesError } = useQuery({
    queryKey: ["admin_exercises", searchTerm, selectedBodyPart, selectedMuscleGroup, selectedMuscle, selectedEquipment, isPublic, configuredFilter],
    queryFn: async () => {
      const debugLog = [];
      debugLog.push(`[Admin] Fetching exercises with filters: ${JSON.stringify({
        searchTerm, selectedBodyPart, selectedMuscleGroup, selectedMuscle, selectedEquipment, isPublic, configuredFilter
      })}`);
      
      let query = supabase
        .from("v_exercises_with_translations")
        .select("*")
        .order("popularity_rank", { ascending: false, nullsFirst: false });

      if (selectedBodyPart && selectedBodyPart !== "all") {
        query = query.eq("body_part_id", selectedBodyPart);
      }
      if (selectedMuscle && selectedMuscle !== "all") {
        query = query.eq("primary_muscle_id", selectedMuscle);
      }
      if (selectedEquipment && selectedEquipment !== "all") {
        query = query.eq("equipment_id", selectedEquipment);
      }
      if (isPublic && isPublic !== "all") {
        query = query.eq("is_public", isPublic === "true");
      }
      // Note: configured filter handled client-side since view might not have this column yet

      const { data, error } = await query;
      debugLog.push(`[Admin] Exercises query result: data=${data?.length || 0}, error=${error ? JSON.stringify(error) : 'None'}`);
      
      if (error) {
        debugLog.push(`[Admin] Exercises query error: ${JSON.stringify(error)}`);
        (window as any).adminDebugLogs = debugLog;
        throw error;
      }
      
      let results = data || [];
      debugLog.push(`[Admin] Raw results from view: ${results.length}`);
      
      // The view already includes translations, so no need to fetch separately
      
      // Client-side filtering for search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        results = results.filter(exercise => {
          const translations = (exercise as any).translations || [];
          const name = getExerciseNameFromTranslations(translations, exercise.id);
          
          // Get muscle and muscle group names for this exercise
          const muscle = muscles.find(m => m.id === exercise.primary_muscle_id);
          const muscleGroup = muscle ? muscleGroups.find(mg => mg.id === muscle.muscle_group_id) : null;
          const bodyPart = bodyParts.find(bp => bp.id === exercise.body_part_id);
          
          // Create searchable text that includes exercise name, muscle, muscle group, and body part
          const searchableText = [
            name,
            muscle?.name,
            muscleGroup?.name,
            bodyPart?.name
          ].filter(Boolean).join(' ').toLowerCase();
          
          return searchableText.includes(searchLower);
        });
      }
      
      debugLog.push(`[Admin] After filtering: ${results.length}`);
      
      const finalResults = results.map((exercise: any) => {
        // The view already has translations in the correct format
        const translations = exercise.translations || [];
        
        // Convert translations array to the expected object format
        const translationsObj = translations.reduce((acc: any, t: any) => {
          acc[t.language_code] = {
            name: t.name,
            description: t.description
          };
          return acc;
        }, {});

        return {
          ...exercise,
          default_grip_ids: exercise.default_grip_ids || [],
          configured: exercise.configured || false,
          translations: translationsObj
        };
      });
      
      debugLog.push(`[Admin] Final results: ${finalResults.length}`);
      // Store debug logs in window for debug box access
      (window as any).adminDebugLogs = debugLog;
      
      return finalResults;
    },
  });

  // Create/Update mutation
  const upsertMutation = useMutation({
    mutationFn: async (exerciseData: any) => {
      if (editingExercise) {
        // Update existing exercise
        const { error: exerciseError } = await supabase
          .from("exercises")
          .update({
            body_part_id: exerciseData.body_part_id,
            primary_muscle_id: exerciseData.primary_muscle_id,
            secondary_muscle_group_ids: exerciseData.secondary_muscle_group_ids,
            equipment_id: exerciseData.equipment_id,
            is_public: exerciseData.is_public,
            default_grip_ids: exerciseData.default_grip_ids,
            load_type: exerciseData.is_bar_loaded ? 'dual_load' as const : 'bodyweight' as const,
            movement_pattern: exerciseData.movement_pattern || null,
            exercise_skill_level: exerciseData.skill_level || 'medium',
            is_bar_loaded: exerciseData.is_bar_loaded || false,
            is_unilateral: exerciseData.is_unilateral || false,
            requires_handle: exerciseData.requires_handle || false,
            configured: exerciseData.configured || false,
          })
          .eq("id", editingExercise.id);
        
        if (exerciseError) throw exerciseError;
        
        // Upsert translation for current language
        if (exerciseData.name && exerciseData.name.trim()) {
          const { error: translationError } = await supabase
            .from("exercises_translations")
            .upsert({
              exercise_id: editingExercise.id,
              language_code: "en", // Default to English for admin
              name: exerciseData.name.trim(),
              description: exerciseData.description?.trim() || null,
            }, {
              onConflict: 'exercise_id,language_code'
            });
          
          if (translationError) throw translationError;
        }
      } else {
        // Create new exercise
        const { data: newExercise, error: exerciseError } = await supabase
          .from("exercises")
          .insert({
            body_part_id: exerciseData.body_part_id,
            primary_muscle_id: exerciseData.primary_muscle_id,
            secondary_muscle_group_ids: exerciseData.secondary_muscle_group_ids,
            equipment_id: exerciseData.equipment_id,
            is_public: exerciseData.is_public,
            default_grip_ids: exerciseData.default_grip_ids,
            load_type: exerciseData.is_bar_loaded ? 'dual_load' as const : 'bodyweight' as const,
            movement_pattern: exerciseData.movement_pattern || null,
            exercise_skill_level: exerciseData.skill_level || 'medium',
            is_bar_loaded: exerciseData.is_bar_loaded || false,
            is_unilateral: exerciseData.is_unilateral || false,
            requires_handle: exerciseData.requires_handle || false,
            configured: exerciseData.configured || false,
            owner_user_id: null, // Admin-created exercises don't have an owner
            slug: exerciseData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 8),
          })
          .select()
          .single();
        
        if (exerciseError) throw exerciseError;
        
        // Upsert translation for new exercise (use upsert in case translation already exists)
        if (exerciseData.name && exerciseData.name.trim()) {
          const { error: translationError } = await supabase
            .from("exercises_translations")
            .upsert({
              exercise_id: newExercise.id,
              language_code: "en", // Default to English for admin
              name: exerciseData.name.trim(),
              description: exerciseData.description?.trim() || null,
            }, {
              onConflict: 'exercise_id,language_code'
            });
          
          if (translationError) throw translationError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_exercises"] });
      toast({ title: "Success", description: "Exercise saved successfully" });
      setEditingExercise(null);
      setIsCreateDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        body_part_id: "",
        primary_muscle_id: "",
        secondary_muscle_group_ids: [],
        equipment_id: "",
        is_public: true,
        default_grip_ids: [],
        is_bar_loaded: false,
        is_unilateral: false,
        requires_handle: false,
        movement_pattern: "",
        skill_level: "medium",
        configured: false,
      });
      setSelectedGrips([]);
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to save exercise: ${error.message}`, variant: "destructive" });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("exercises")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_exercises"] });
      toast({ title: "Success", description: "Exercise deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to delete exercise: ${error.message}`, variant: "destructive" });
    },
  });

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast({ title: "Error", description: "Exercise name is required", variant: "destructive" });
      return;
    }
    
    const dataToSave = {
      ...formData,
      default_grip_ids: selectedGrips,
    };
    
    upsertMutation.mutate(dataToSave);
  };

  const handleDelete = (exercise: Exercise) => {
    const exerciseName = getExerciseNameFromTranslations(exercise.translations, exercise.id);
    console.log('[AdminExercise] Deleting exercise:', exerciseName);
    deleteMutation.mutate(exercise.id);
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    const exerciseName = getExerciseNameFromTranslations(exercise.translations, exercise.id);
    setFormData({
      name: exerciseName,
      description: "", // Exercise descriptions are managed through translations separately
      body_part_id: exercise.body_part_id || "",
      primary_muscle_id: exercise.primary_muscle_id || "",
      secondary_muscle_group_ids: exercise.secondary_muscle_group_ids || [],
      equipment_id: exercise.equipment_id || "",
      is_public: exercise.is_public ?? true,
      default_grip_ids: exercise.default_grip_ids || [],
      configured: exercise.configured || false,
    });
    setSelectedGrips(exercise.default_grip_ids || []);
    setIsCreateDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBodyPart("");
    setSelectedMuscleGroup("");
    setSelectedMuscle("");
    setSelectedEquipment("");
    setConfiguredFilter("all");
    setIsPublic("");
  };

  // Grip selection logic
  const handleGripToggle = (gripId: string) => {
    const grip = grips.find(g => g.id === gripId);
    if (!grip) return;

    const newSelectedGrips = [...selectedGrips];
    const isSelected = newSelectedGrips.includes(gripId);

    if (isSelected) {
      // Remove grip
      const index = newSelectedGrips.indexOf(gripId);
      newSelectedGrips.splice(index, 1);
    } else {
      // Check if we already have a grip from the same category
      const existingGripFromCategory = newSelectedGrips.find(id => {
        const existingGrip = grips.find(g => g.id === id);
        return existingGrip?.category === grip.category;
      });

      if (existingGripFromCategory) {
        // Replace the existing grip from this category
        const index = newSelectedGrips.indexOf(existingGripFromCategory);
        newSelectedGrips[index] = gripId;
      } else {
        // Add new grip
        newSelectedGrips.push(gripId);
      }
    }

    setSelectedGrips(newSelectedGrips);
  };

  const getGripNames = (gripIds: string[] | null) => {
    if (!gripIds || gripIds.length === 0) return "None";
    return gripIds
      .map(id => {
        const grip = grips.find(g => g.id === id);
        return grip ? getTranslatedName(grip) : "Unknown";
      })
      .join(", ");
  };

  const getBodyPartName = (id: string | null) => {
    if (!id) return "N/A";
    const bodyPart = bodyParts.find(bp => bp.id === id);
    return bodyPart?.name || "Unknown";
  };

  const getMuscleName = (id: string | null) => {
    if (!id) return "N/A";
    const muscle = muscles.find(m => m.id === id);
    return muscle?.name || "Unknown";
  };

  const getEquipmentName = (id: string | null) => {
    if (!id) return "N/A";
    const eq = equipment.find(e => e.id === id);
    return eq ? getTranslatedName(eq) : "Unknown";
  };

  const getSecondaryMuscleGroupNames = (ids: string[] | null) => {
    if (!ids || ids.length === 0) return "None";
    return ids
      .map(id => {
        const muscleGroup = muscleGroups.find(mg => mg.id === id);
        return muscleGroup?.name || "Unknown";
      })
      .join(", ");
  };

  const filteredMuscleGroups = selectedBodyPart 
    ? muscleGroups.filter(mg => mg.body_part_id === selectedBodyPart)
    : muscleGroups;

  const filteredMuscles = selectedMuscleGroup
    ? muscles.filter(m => m.muscle_group_id === selectedMuscleGroup)
    : muscles;

  // For edit dialog: filter muscles based on selected body part
  const formFilteredMuscleGroups = formData.body_part_id 
    ? muscleGroups.filter(mg => mg.body_part_id === formData.body_part_id)
    : muscleGroups;

  const formFilteredMuscles = formData.body_part_id
    ? muscles.filter(m => {
        const muscleGroup = muscleGroups.find(mg => mg.id === m.muscle_group_id);
        return muscleGroup?.body_part_id === formData.body_part_id;
      })
    : muscles;

  return (
    <main className="container py-6">
      <PageNav current="Admin / Exercise Management" />
      <AdminMenu />
      
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Exercise Management</h1>
          <div className="flex flex-col gap-2">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
            {/* Exercise creation is now handled through the dialog only */}
          </div>
        </div>

        <CreateExerciseDialog 
          open={isCreateDialogOpen} 
          onOpenChange={setIsCreateDialogOpen} 
        />

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={selectedBodyPart} onValueChange={setSelectedBodyPart}>
                <SelectTrigger className="bg-background border z-50">
                  <SelectValue placeholder="Body Part" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Body Parts</SelectItem>
                  {bodyParts.map((bp) => (
                    <SelectItem key={bp.id} value={bp.id}>
                      {bp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                <SelectTrigger className="bg-background border z-50">
                  <SelectValue placeholder="Muscle Group" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Muscle Groups</SelectItem>
                  {filteredMuscleGroups.map((mg) => (
                    <SelectItem key={mg.id} value={mg.id}>
                      {mg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
                <SelectTrigger className="bg-background border z-50">
                  <SelectValue placeholder="Muscle" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Muscles</SelectItem>
                  {filteredMuscles.map((muscle) => (
                    <SelectItem key={muscle.id} value={muscle.id}>
                      {muscle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger className="bg-background border z-50">
                  <SelectValue placeholder="Equipment" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Equipment</SelectItem>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {getTranslatedName(eq)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={isPublic} onValueChange={setIsPublic}>
                <SelectTrigger className="bg-background border z-50">
                  <SelectValue placeholder="Visibility" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Public</SelectItem>
                  <SelectItem value="false">Private</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={configuredFilter} onValueChange={setConfiguredFilter}>
                <SelectTrigger className="bg-background border z-50">
                  <SelectValue placeholder="Configured" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Exercises</SelectItem>
                  <SelectItem value="configured">Configured</SelectItem>
                  <SelectItem value="not-configured">Not Configured</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exercises Table */}
        <Card>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading exercises...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Body Part</TableHead>
                <TableHead>Primary Muscle</TableHead>
                <TableHead>Secondary Muscle Groups</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Default Grips</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Configured</TableHead>
                <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exercises.map((exercise) => (
                    <TableRow key={exercise.id}>
                  <TableCell className="font-medium">{getExerciseNameFromTranslations(exercise.translations, exercise.id)}</TableCell>
                  <TableCell>{getBodyPartName(exercise.body_part_id)}</TableCell>
                  <TableCell>{getMuscleName(exercise.primary_muscle_id)}</TableCell>
                  <TableCell>
                    <div className="max-w-48 truncate text-sm text-muted-foreground">
                      {getSecondaryMuscleGroupNames(exercise.secondary_muscle_group_ids)}
                    </div>
                  </TableCell>
                  <TableCell>{getEquipmentName(exercise.equipment_id)}</TableCell>
                  <TableCell>
                    <div className="max-w-48 truncate text-sm text-muted-foreground">
                      {getGripNames(exercise.default_grip_ids)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={exercise.is_public ? "default" : "secondary"}>
                      {exercise.is_public ? "Public" : "Private"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={exercise.configured ? "default" : "secondary"}>
                      {exercise.configured ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/admin/exercises/${exercise.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{getExerciseNameFromTranslations(exercise.translations, exercise.id)}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(exercise)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            
            {exercises.length === 0 && !isLoading && (
              <div className="text-center py-8 text-muted-foreground">
                No exercises found matching your criteria.
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* 🔥 DEBUG AREA - FROM EXERCISE EDIT */}
        {debugInfo && (
          <Card className="border-red-500 bg-red-900/10">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center justify-between">
                🔥 Exercise Edit Debug Information
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDebugInfo(null)}
                  className="text-xs"
                >
                  Clear
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-xs">
                <div className="text-yellow-300">
                  <strong>Timestamp:</strong> {debugInfo.timestamp}
                </div>
                <div className="text-yellow-300">
                  <strong>Exercise ID:</strong> {debugInfo.exerciseId}
                </div>
                
                <div>
                  <strong className="text-orange-400">Critical Fields:</strong>
                  <pre className="bg-black/50 p-2 rounded mt-1 overflow-auto text-green-300 max-h-40">
{JSON.stringify(debugInfo.criticalFields, null, 2)}
                  </pre>
                </div>
                
                {debugInfo.sqlQuery && (
                  <div>
                    <strong className="text-orange-400">SQL Query:</strong>
                    <pre className="bg-black/50 p-2 rounded mt-1 overflow-auto text-blue-300">
{debugInfo.sqlQuery}
                    </pre>
                  </div>
                )}
                
                <div>
                  <strong className="text-orange-400">Full Payload:</strong>
                  <pre className="bg-black/50 p-2 rounded mt-1 overflow-auto max-h-40 text-cyan-300">
{JSON.stringify(debugInfo.payload, null, 2)}
                  </pre>
                </div>
                
                {debugInfo.supabaseResponse && (
                  <div>
                    <strong className="text-orange-400">Supabase Response:</strong>
                    <pre className="bg-black/50 p-2 rounded mt-1 overflow-auto max-h-40 text-purple-300">
{JSON.stringify(debugInfo.supabaseResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

    </main>
  );
};

export default AdminExercisesManagement;