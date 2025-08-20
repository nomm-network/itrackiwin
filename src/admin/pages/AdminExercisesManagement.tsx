import React, { useState } from "react";
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

interface Exercise {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  body_part: string | null;
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
  default_grips: string[] | null;
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
  name: string;
  slug: string;
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
  const [isPublic, setIsPublic] = useState<string>("");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Exercise>>({
    name: "",
    description: "",
    body_part_id: "",
    primary_muscle_id: "",
    secondary_muscle_group_ids: [],
    equipment_id: "",
    is_public: true,
    default_grips: [],
  });
  const [selectedGrips, setSelectedGrips] = useState<string[]>([]);

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
        .from("equipment")
        .select("id, name, slug")
        .order("name");
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
  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["admin_exercises", searchTerm, selectedBodyPart, selectedMuscleGroup, selectedMuscle, selectedEquipment, isPublic],
    queryFn: async () => {
      let query = supabase
        .from("exercises")
        .select(`
          id, name, slug, description, body_part, body_part_id, 
          primary_muscle_id, secondary_muscle_group_ids, equipment_id,
          image_url, thumbnail_url, is_public, owner_user_id, 
          source_url, popularity_rank, default_grips, created_at
        `)
        .order("name");

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }
      if (selectedBodyPart) {
        query = query.eq("body_part_id", selectedBodyPart);
      }
      if (selectedMuscle) {
        query = query.eq("primary_muscle_id", selectedMuscle);
      }
      if (selectedEquipment) {
        query = query.eq("equipment_id", selectedEquipment);
      }
      if (isPublic) {
        query = query.eq("is_public", isPublic === "true");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Exercise[];
    },
  });

  // Create/Update mutation
  const upsertMutation = useMutation({
    mutationFn: async (exercise: Partial<Exercise>) => {
      if (exercise.id) {
        // For updates, exclude slug and other system fields
        const updateData = {
          name: exercise.name,
          description: exercise.description || null,
          body_part_id: exercise.body_part_id || null,
          primary_muscle_id: exercise.primary_muscle_id || null,
          secondary_muscle_group_ids: exercise.secondary_muscle_group_ids || null,
          equipment_id: exercise.equipment_id || null,
          is_public: exercise.is_public ?? true,
          default_grips: selectedGrips.length > 0 ? selectedGrips : null,
        };
        const { data, error } = await supabase
          .from("exercises")
          .update(updateData)
          .eq("id", exercise.id)
          .select();
        if (error) throw error;
        return data;
      } else {
        // Ensure name is provided for new exercises
        if (!exercise.name) {
          throw new Error("Exercise name is required");
        }
        
        // Get current user for admin operations
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error("Authentication required");
        }
        
        const exerciseToInsert = {
          name: exercise.name!,
          description: exercise.description || null,
          body_part_id: exercise.body_part_id || null,
          primary_muscle_id: exercise.primary_muscle_id || null,
          secondary_muscle_group_ids: exercise.secondary_muscle_group_ids || null,
          equipment_id: exercise.equipment_id || null,
          is_public: exercise.is_public ?? true,
          default_grips: selectedGrips.length > 0 ? selectedGrips : null,
          owner_user_id: user.id, // Set to current admin user
        };
        
        console.log('[AdminExercise] Creating exercise with payload:', exerciseToInsert);
        
        const { data, error } = await supabase
          .from("exercises")
          .insert([exerciseToInsert])
          .select();
        if (error) {
          console.error('[AdminExercise] Insert error:', error);
          throw error;
        }
        return data;
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
        default_grips: [],
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
    // Validate required fields
    if (!formData.name?.trim()) {
      toast({ title: "Error", description: "Exercise name is required", variant: "destructive" });
      return;
    }
    
    if (editingExercise) {
      upsertMutation.mutate({ ...editingExercise, ...formData });
    } else {
      upsertMutation.mutate(formData);
    }
  };

  const handleDelete = (exercise: Exercise) => {
    console.log('[AdminExercise] Deleting exercise:', exercise.name);
    deleteMutation.mutate(exercise.id);
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name || "",
      description: exercise.description || "",
      body_part_id: exercise.body_part_id || "",
      primary_muscle_id: exercise.primary_muscle_id || "",
      secondary_muscle_group_ids: exercise.secondary_muscle_group_ids || [],
      equipment_id: exercise.equipment_id || "",
      is_public: exercise.is_public ?? true,
      default_grips: exercise.default_grips || [],
    });
    setSelectedGrips(exercise.default_grips || []);
    setIsCreateDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBodyPart("");
    setSelectedMuscleGroup("");
    setSelectedMuscle("");
    setSelectedEquipment("");
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
    return eq?.name || "Unknown";
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
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              setEditingExercise(null);
                  setFormData({
                    name: "",
                    description: "",
                    body_part_id: "",
                    primary_muscle_id: "",
                    secondary_muscle_group_ids: [],
                    equipment_id: "",
                    is_public: true,
                    default_grips: [],
                  });
                  setSelectedGrips([]);
                }
              }}>
                <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingExercise(null);
                setFormData({
                  name: "",
                  description: "",
                  body_part_id: "",
                  primary_muscle_id: "",
                  secondary_muscle_group_ids: [],
                  equipment_id: "",
                  is_public: true,
                  default_grips: [],
                });
                setSelectedGrips([]);
                setIsCreateDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Exercise
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingExercise ? "Edit Exercise" : "Create New Exercise"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Exercise name"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Exercise description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Body Part</Label>
                    <Select 
                      value={formData.body_part_id || ""} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        body_part_id: value,
                        primary_muscle_id: "" // Reset muscle when body part changes
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select body part" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyParts.map((bp) => (
                          <SelectItem key={bp.id} value={bp.id}>
                            {bp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Primary Muscle</Label>
                    <Select 
                      value={formData.primary_muscle_id || ""} 
                      onValueChange={(value) => setFormData({ ...formData, primary_muscle_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary muscle" />
                      </SelectTrigger>
                      <SelectContent>
                        {formFilteredMuscles.map((muscle) => (
                          <SelectItem key={muscle.id} value={muscle.id}>
                            {muscle.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Equipment</Label>
                  <Select 
                    value={formData.equipment_id || ""} 
                    onValueChange={(value) => setFormData({ ...formData, equipment_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <SecondaryMuscleGroupSelector
                  bodyParts={bodyParts}
                  muscleGroups={muscleGroups}
                  selectedMuscleGroupIds={formData.secondary_muscle_group_ids || []}
                  excludedMuscleGroupId={
                    formData.primary_muscle_id 
                      ? muscles.find(m => m.id === formData.primary_muscle_id)?.muscle_group_id 
                      : undefined
                  }
                  onChange={(ids) => setFormData({ ...formData, secondary_muscle_group_ids: ids })}
                />

                {/* Grips Selection */}
                <div className="grid gap-2">
                  <Label>Default Grips</Label>
                  <div className="space-y-3">
                    {['width', 'orientation', 'attachment'].map(category => {
                      const categoryGrips = grips.filter(g => g.category === category);
                      if (categoryGrips.length === 0) return null;
                      
                      return (
                        <div key={category} className="space-y-2">
                          <h4 className="text-sm font-medium capitalize">{category}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {categoryGrips.map(grip => {
                              const isSelected = selectedGrips.includes(grip.id);
                              return (
                                <Button
                                  key={grip.id}
                                  type="button"
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleGripToggle(grip.id)}
                                  className="justify-start"
                                >
                                  {getTranslatedName(grip)}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select one grip from each category. Only one grip per category is allowed.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Visibility</Label>
                  <Select 
                    value={formData.is_public ? "true" : "false"} 
                    onValueChange={(value) => setFormData({ ...formData, is_public: value === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Public</SelectItem>
                      <SelectItem value="false">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="button" onClick={handleSave} disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending ? "Saving..." : editingExercise ? "Save Changes" : "Save Exercise"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                <SelectTrigger>
                  <SelectValue placeholder="Body Part" />
                </SelectTrigger>
                <SelectContent>
                  {bodyParts.map((bp) => (
                    <SelectItem key={bp.id} value={bp.id}>
                      {bp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMuscleGroup} onValueChange={setSelectedMuscleGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Muscle Group" />
                </SelectTrigger>
                <SelectContent>
                  {filteredMuscleGroups.map((mg) => (
                    <SelectItem key={mg.id} value={mg.id}>
                      {mg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedMuscle} onValueChange={setSelectedMuscle}>
                <SelectTrigger>
                  <SelectValue placeholder="Muscle" />
                </SelectTrigger>
                <SelectContent>
                  {filteredMuscles.map((muscle) => (
                    <SelectItem key={muscle.id} value={muscle.id}>
                      {muscle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                <SelectTrigger>
                  <SelectValue placeholder="Equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {eq.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Select value={isPublic} onValueChange={setIsPublic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Public</SelectItem>
                    <SelectItem value="false">Private</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              </div>
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
                <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exercises.map((exercise) => (
                    <TableRow key={exercise.id}>
                  <TableCell className="font-medium">{exercise.name}</TableCell>
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
                      {getGripNames(exercise.default_grips)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={exercise.is_public ? "default" : "secondary"}>
                      {exercise.is_public ? "Public" : "Private"}
                    </Badge>
                  </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(exercise)}
                            disabled={upsertMutation.isPending}
                          >
                            <Edit className="w-4 h-4" />
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
                                  Are you sure you want to delete "{exercise.name}"? This action cannot be undone.
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
      </div>

    </main>
  );
};

export default AdminExercisesManagement;