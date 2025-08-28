import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Equipment {
  id: string;
  slug: string;
  load_type: string;
  load_medium: string;
  translations: Record<string, { name: string; description?: string }>;
}

interface Handle {
  id: string;
  slug: string;
  translations: Record<string, { name: string; description?: string }>;
}

interface Grip {
  id: string;
  slug: string;
  category: string;
  translations: Record<string, { name: string; description?: string }>;
}

interface BodyPart {
  id: string;
  slug: string;
  translations: Record<string, { name: string }>;
}

interface MuscleGroup {
  id: string;
  slug: string;
  body_part_id: string;
  translations: Record<string, { name: string }>;
}

interface Muscle {
  id: string;
  slug: string;
  muscle_group_id: string;
  translations: Record<string, { name: string }>;
}

export const CreateExerciseDialog: React.FC<CreateExerciseDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form state
  const [activeTab, setActiveTab] = useState('basics');
  const [formData, setFormData] = useState({
    // Basics
    name: '',
    description: '',
    slug: '',
    isPublic: true,
    // Movement
    bodyPartId: '',
    muscleGroupId: '',
    primaryMuscleId: '',
    secondaryMuscleGroupIds: [] as string[],
    movementPattern: '',
    exerciseSkillLevel: 'medium',
    complexityScore: 3,
    isUnilateral: false,
    // Equipment & Loading
    equipmentId: '',
    loadType: '',
    requiresHandle: false,
    allowsGrips: true,
    isBarLoaded: false,
    defaultBarWeight: null as number | null,
    defaultBarTypeId: '',
    // Handles & Grips
    selectedHandles: [] as string[],
    defaultHandleId: '',
    selectedGrips: [] as string[],
    defaultGripIds: [] as string[],
    // Media & Coaching
    sourceUrl: '',
    loadingHint: '',
    contraindications: [] as string[],
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name]);

  // Fetch data
  const { data: bodyParts = [] } = useQuery({
    queryKey: ['admin-body-parts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_parts')
        .select(`
          id, slug,
          translations:body_parts_translations(language_code, name)
        `);
      if (error) throw error;
      return data;
    },
  });

  const { data: muscleGroups = [] } = useQuery({
    queryKey: ['admin-muscle-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('muscle_groups')
        .select(`
          id, slug, body_part_id,
          translations:muscle_groups_translations(language_code, name)
        `);
      if (error) throw error;
      return data;
    },
  });

  const { data: muscles = [] } = useQuery({
    queryKey: ['admin-muscles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('muscles')
        .select(`
          id, slug, muscle_group_id,
          translations:muscles_translations(language_code, name)
        `);
      if (error) throw error;
      return data;
    },
  });

  const { data: equipment = [] } = useQuery({
    queryKey: ['admin-equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          id, slug, load_type, load_medium,
          translations:equipment_translations(language_code, name, description)
        `);
      if (error) throw error;
      return data;
    },
  });

  // Handles for selected equipment
  const { data: availableHandles = [] } = useQuery({
    queryKey: ['equipment-handles', formData.equipmentId],
    queryFn: async () => {
      if (!formData.equipmentId) return [];
      const { data, error } = await supabase
        .from('handle_equipment')
        .select(`
          handle:handles(
            id, slug,
            translations:handle_translations(language_code, name, description)
          )
        `)
        .eq('equipment_id', formData.equipmentId);
      if (error) throw error;
      return data.map(item => item.handle).filter(Boolean);
    },
    enabled: !!formData.equipmentId,
  });

  // Grips for selected equipment and handles
  const { data: availableGrips = [] } = useQuery({
    queryKey: ['equipment-handle-grips', formData.equipmentId, formData.selectedHandles],
    queryFn: async () => {
      if (!formData.equipmentId || formData.selectedHandles.length === 0) return [];
      const { data, error } = await supabase
        .from('equipment_handle_grips')
        .select(`
          grip:grips(
            id, slug, category,
            translations:grips_translations(language_code, name, description)
          )
        `)
        .eq('equipment_id', formData.equipmentId)
        .in('handle_id', formData.selectedHandles);
      if (error) throw error;
      return data.map(item => item.grip).filter(Boolean);
    },
    enabled: !!formData.equipmentId && formData.selectedHandles.length > 0,
  });

  // Filtered data
  const filteredMuscleGroups = useMemo(() => {
    if (!formData.bodyPartId) return [];
    return muscleGroups.filter(mg => mg.body_part_id === formData.bodyPartId);
  }, [muscleGroups, formData.bodyPartId]);

  const availableMuscles = useMemo(() => {
    if (!formData.muscleGroupId) return [];
    return muscles.filter(m => m.muscle_group_id === formData.muscleGroupId);
  }, [muscles, formData.muscleGroupId]);

  const allMuscleGroupsForSecondary = useMemo(() => {
    return muscleGroups.filter(mg => mg.id !== formData.muscleGroupId);
  }, [muscleGroups, formData.muscleGroupId]);

  // Grouped grips by category
  const gripsByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    availableGrips.forEach((grip: any) => {
      if (!grouped[grip.category]) {
        grouped[grip.category] = [];
      }
      grouped[grip.category].push(grip);
    });
    return grouped;
  }, [availableGrips]);

  // Selected equipment details
  const selectedEquipment = useMemo(() => {
    return equipment.find(eq => eq.id === formData.equipmentId);
  }, [equipment, formData.equipmentId]);

  // Update load type when equipment changes
  useEffect(() => {
    if (selectedEquipment) {
      setFormData(prev => ({
        ...prev,
        loadType: selectedEquipment.load_type,
        requiresHandle: ['cable', 'band'].includes(selectedEquipment.load_medium) || selectedEquipment.slug.includes('cable'),
        selectedHandles: [],
        defaultHandleId: '',
        selectedGrips: [],
        defaultGripIds: [],
      }));
    }
  }, [selectedEquipment]);

  // Helper functions
  const getTranslation = (translations: any[], lang = 'en') => {
    if (!translations || !Array.isArray(translations)) return null;
    return translations.find(t => t.language_code === lang);
  };

  const getName = (item: any, lang = 'en') => {
    const translation = getTranslation(item.translations, lang);
    return translation?.name || item.slug || 'Unknown';
  };

  // Handle grip selection (one per category)
  const handleGripToggle = (gripId: string, category: string) => {
    setFormData(prev => {
      const newSelected = [...prev.selectedGrips];
      const existingInCategory = newSelected.find(id => {
        const grip = availableGrips.find(g => g.id === id);
        return grip?.category === category;
      });

      if (existingInCategory) {
        // Remove existing grip from this category
        const index = newSelected.indexOf(existingInCategory);
        newSelected.splice(index, 1);
      }
      
      if (existingInCategory !== gripId) {
        // Add new grip
        newSelected.push(gripId);
      }

      return { ...prev, selectedGrips: newSelected };
    });
  };

  // Mutation to create exercise
  const createMutation = useMutation({
    mutationFn: async () => {
      // Basic validation
      if (!formData.name.trim()) throw new Error('Name is required');
      if (!formData.equipmentId) throw new Error('Equipment is required');
      if (!formData.bodyPartId) throw new Error('Body part is required');
      if (!formData.primaryMuscleId) throw new Error('Primary muscle is required');

      // Create exercise
      const exerciseData = {
        slug: formData.slug,
        owner_user_id: null, // Admin created
        is_public: formData.isPublic,
        body_part_id: formData.bodyPartId,
        primary_muscle_id: formData.primaryMuscleId,
        secondary_muscle_group_ids: formData.secondaryMuscleGroupIds.length > 0 ? formData.secondaryMuscleGroupIds : null,
        equipment_id: formData.equipmentId,
        default_grip_ids: formData.defaultGripIds.length > 0 ? formData.defaultGripIds : null,
        default_handle_ids: formData.selectedHandles.length > 0 ? formData.selectedHandles : null,
        movement_pattern: (formData.movementPattern || null) as 'squat' | 'hinge' | 'horizontal_push' | 'vertical_push' | 'horizontal_pull' | 'vertical_pull' | 'lunge' | 'carry' | 'rotation' | 'isolation' | null,
        exercise_skill_level: formData.exerciseSkillLevel === 'advanced' ? 'high' : formData.exerciseSkillLevel === 'beginner' ? 'low' : 'medium' as 'low' | 'medium' | 'high',
        complexity_score: formData.complexityScore,
        is_unilateral: formData.isUnilateral,
        load_type: formData.loadType as 'fixed' | 'barbell' | 'single_load' | 'dual_load' | 'stack' | 'bodyweight' || null,
        requires_handle: formData.requiresHandle,
        allows_grips: formData.allowsGrips,
        is_bar_loaded: formData.isBarLoaded,
        default_bar_weight: formData.defaultBarWeight,
        default_bar_type_id: formData.defaultBarTypeId || null,
        source_url: formData.sourceUrl || null,
        loading_hint: formData.loadingHint || null,
        contraindications: formData.contraindications.length > 0 ? formData.contraindications : null,
      };

      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .insert(exerciseData)
        .select()
        .single();

      if (exerciseError) throw exerciseError;

      // Create exercise translation
      const { error: translationError } = await supabase
        .from('exercises_translations')
        .insert({
          exercise_id: exercise.id,
          language_code: 'en',
          name: formData.name,
          description: formData.description || null,
        });

      if (translationError) throw translationError;

      // Create exercise handles
      if (formData.selectedHandles.length > 0) {
        const handleInserts = formData.selectedHandles.map(handleId => ({
          exercise_id: exercise.id,
          handle_id: handleId,
          is_default: handleId === formData.defaultHandleId,
        }));

        const { error: handlesError } = await supabase
          .from('exercise_handles')
          .insert(handleInserts);

        if (handlesError) throw handlesError;
      }

      // Create exercise handle grips
      if (formData.selectedGrips.length > 0 && formData.selectedHandles.length > 0) {
        const gripInserts = [];
        for (const handleId of formData.selectedHandles) {
          for (const gripId of formData.selectedGrips) {
            gripInserts.push({
              exercise_id: exercise.id,
              handle_id: handleId,
              grip_id: gripId,
            });
          }
        }

        const { error: gripsError } = await supabase
          .from('exercise_handle_grips')
          .insert(gripInserts);

        if (gripsError) throw gripsError;
      }

      return exercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_exercises'] });
      toast({ title: 'Success', description: 'Exercise created successfully' });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create exercise',
        variant: 'destructive' 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      isPublic: true,
      bodyPartId: '',
      muscleGroupId: '',
      primaryMuscleId: '',
      secondaryMuscleGroupIds: [],
      movementPattern: '',
      exerciseSkillLevel: 'medium',
      complexityScore: 3,
      isUnilateral: false,
      equipmentId: '',
      loadType: '',
      requiresHandle: false,
      allowsGrips: true,
      isBarLoaded: false,
      defaultBarWeight: null,
      defaultBarTypeId: '',
      selectedHandles: [],
      defaultHandleId: '',
      selectedGrips: [],
      defaultGripIds: [],
      sourceUrl: '',
      loadingHint: '',
      contraindications: [],
    });
    setActiveTab('basics');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Exercise</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basics">Basics</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="handles">Handles & Grips</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Barbell Bench Press"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="Auto-generated from name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Exercise description and cues"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Body Part *</Label>
                <Select
                  value={formData.bodyPartId}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    bodyPartId: value,
                    muscleGroupId: '',
                    primaryMuscleId: '',
                    secondaryMuscleGroupIds: []
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select body part" />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyParts.map((bp) => (
                      <SelectItem key={bp.id} value={bp.id}>
                        {getName(bp)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Muscle Group *</Label>
                <Select
                  value={formData.muscleGroupId}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    muscleGroupId: value,
                    primaryMuscleId: '',
                  }))}
                  disabled={!formData.bodyPartId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select muscle group" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMuscleGroups.map((mg) => (
                      <SelectItem key={mg.id} value={mg.id}>
                        {getName(mg)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Primary Muscle *</Label>
                <Select
                  value={formData.primaryMuscleId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, primaryMuscleId: value }))}
                  disabled={!formData.muscleGroupId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary muscle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMuscles.map((muscle) => (
                      <SelectItem key={muscle.id} value={muscle.id}>
                        {getName(muscle)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Secondary Muscle Groups</Label>
              <div className="grid grid-cols-3 gap-2">
                {allMuscleGroupsForSecondary.map((mg) => (
                  <div key={mg.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.secondaryMuscleGroupIds.includes(mg.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData(prev => ({
                            ...prev,
                            secondaryMuscleGroupIds: [...prev.secondaryMuscleGroupIds, mg.id]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            secondaryMuscleGroupIds: prev.secondaryMuscleGroupIds.filter(id => id !== mg.id)
                          }));
                        }
                      }}
                    />
                    <Label className="text-sm">{getName(mg)}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Movement Pattern</Label>
                <Select
                  value={formData.movementPattern}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, movementPattern: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horizontal_push">Horizontal Push</SelectItem>
                    <SelectItem value="vertical_push">Vertical Push</SelectItem>
                    <SelectItem value="horizontal_pull">Horizontal Pull</SelectItem>
                    <SelectItem value="vertical_pull">Vertical Pull</SelectItem>
                    <SelectItem value="squat">Squat</SelectItem>
                    <SelectItem value="hinge">Hinge</SelectItem>
                    <SelectItem value="lunge">Lunge</SelectItem>
                    <SelectItem value="carry">Carry</SelectItem>
                    <SelectItem value="rotation">Rotation</SelectItem>
                    <SelectItem value="isolation">Isolation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Skill Level</Label>
                <Select
                  value={formData.exerciseSkillLevel}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, exerciseSkillLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (Low)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="advanced">Advanced (High)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Complexity Score</Label>
                <Select
                  value={formData.complexityScore.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, complexityScore: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(score => (
                      <SelectItem key={score} value={score.toString()}>{score}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isUnilateral}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isUnilateral: checked }))}
              />
              <Label>Unilateral Exercise</Label>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <div className="space-y-2">
              <Label>Equipment *</Label>
              <Select
                value={formData.equipmentId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, equipmentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((eq) => (
                    <SelectItem key={eq.id} value={eq.id}>
                      {getName(eq)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEquipment && (
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Load Type</Label>
                      <Input value={selectedEquipment.load_type} disabled />
                    </div>
                    <div>
                      <Label>Load Medium</Label>
                      <Input value={selectedEquipment.load_medium} disabled />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.requiresHandle}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresHandle: checked }))}
                      />
                      <Label>Requires Handle</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.allowsGrips}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowsGrips: checked }))}
                      />
                      <Label>Allows Grips</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.isBarLoaded}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBarLoaded: checked }))}
                      />
                      <Label>Bar Loaded</Label>
                    </div>
                  </div>

                  {formData.isBarLoaded && (
                    <div className="space-y-2">
                      <Label>Default Bar Weight (kg)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={formData.defaultBarWeight || ''}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          defaultBarWeight: e.target.value ? parseFloat(e.target.value) : null 
                        }))}
                        placeholder="e.g., 20"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="handles" className="space-y-6">
            {!formData.equipmentId ? (
              <div className="text-center text-muted-foreground py-8">
                Select equipment first to see available handles
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <Label>Available Handles</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableHandles.map((handle) => (
                      <div key={handle.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={formData.selectedHandles.includes(handle.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                selectedHandles: [...prev.selectedHandles, handle.id]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                selectedHandles: prev.selectedHandles.filter(id => id !== handle.id),
                                defaultHandleId: prev.defaultHandleId === handle.id ? '' : prev.defaultHandleId
                              }));
                            }
                          }}
                        />
                        <Label className="flex-1">{getName(handle)}</Label>
                        {formData.selectedHandles.includes(handle.id) && (
                          <Button
                            size="sm"
                            variant={formData.defaultHandleId === handle.id ? "default" : "outline"}
                            onClick={() => setFormData(prev => ({ 
                              ...prev, 
                              defaultHandleId: prev.defaultHandleId === handle.id ? '' : handle.id 
                            }))}
                          >
                            {formData.defaultHandleId === handle.id ? 'Default' : 'Set Default'}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {formData.selectedHandles.length > 0 && Object.keys(gripsByCategory).length > 0 && (
                  <div className="space-y-4">
                    <Label>Available Grips (one per category)</Label>
                    {Object.entries(gripsByCategory).map(([category, grips]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="font-medium capitalize">{category}</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {grips.map((grip) => (
                            <Badge
                              key={grip.id}
                              variant={formData.selectedGrips.includes(grip.id) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleGripToggle(grip.id, category)}
                            >
                              {getName(grip)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source URL</Label>
                <Input
                  value={formData.sourceUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Loading Hint</Label>
                <Input
                  value={formData.loadingHint}
                  onChange={(e) => setFormData(prev => ({ ...prev, loadingHint: e.target.value }))}
                  placeholder="Loading instructions"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
              />
              <Label>Public Exercise</Label>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Exercise
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};