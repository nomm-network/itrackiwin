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
import { Loader2, X, Plus, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import SecondaryMuscleGroupSelector from '@/components/SecondaryMuscleGroupSelector';
import { HandleGripSelector } from '@/features/workouts/components/HandleGripSelector';
import { useAuth } from '@/hooks/useAuth';

interface CreateExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CreateExerciseFormData {
  // Basic Info
  name: string;
  description: string;
  bodyPartId: string;
  primaryMuscleId: string;
  secondaryMuscleGroupIds: string[];
  
  // Exercise specifics
  movementPattern: string;
  skillLevel: string;
  variant: string; // For angle variants (flat/incline/decline)
  
  // Equipment & Loading
  equipmentId: string;
  loadType: string;
  loadMedium: string;
  requiresHandle: boolean;
  allowsGrips: boolean;
  isBarLoaded: boolean;
  isUnilateral: boolean;
  
  // Handles & Grips
  defaultHandleIds: string[];
  defaultGripIds: string[];
  
  // Tags & Aliases
  tags: string[];
  aliases: string[];
  
  // Attributes - filtered to only show neutral ones
  attributeValues: Record<string, any>;
  
  // Display
  slug: string;
  isPublic: boolean;
}

export default function CreateExerciseDialogV2({ open, onOpenChange }: CreateExerciseDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('basics');
  const [formData, setFormData] = useState<CreateExerciseFormData>({
    // Basic Info
    name: '',
    description: '',
    bodyPartId: '',
    primaryMuscleId: '',
    secondaryMuscleGroupIds: [],
    
    // Exercise specifics
    movementPattern: '',
    skillLevel: 'medium',
    variant: '',
    
    // Equipment & Loading
    equipmentId: '',
    loadType: '',
    loadMedium: '',
    requiresHandle: false,
    allowsGrips: true,
    isBarLoaded: false,
    isUnilateral: false,
    
    // Handles & Grips
    defaultHandleIds: [],
    defaultGripIds: [],
    
    // Tags & Aliases
    tags: [],
    aliases: [],
    
    // Attributes
    attributeValues: {},
    
    // Display
    slug: '',
    isPublic: true,
  });

  // Check if user has Pro features
  const { data: userFeatures } = useQuery({
    queryKey: ['user-features', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_features')
        .select('features')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const isPro = userFeatures?.features && typeof userFeatures.features === 'object' && 'pro' in userFeatures.features;

  // Fetch body parts
  const { data: bodyPartsResult = [] } = useQuery({
    queryKey: ['body-parts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_parts')
        .select(`
          id, slug,
          body_part_translations(language_code, name)
        `);
      if (error) throw error;
      return data;
    },
  });

  const bodyParts = bodyPartsResult.map((bp: any) => ({
    id: bp.id,
    slug: bp.slug,
    name: bp.body_part_translations?.[0]?.name || bp.slug.replace(/-/g, ' '),
  }));

  // Fetch muscle groups
  const { data: muscleGroupsResult = [] } = useQuery({
    queryKey: ['muscle-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('muscle_groups')
        .select(`
          id, slug, body_part_id,
          muscle_group_translations(language_code, name)
        `);
      if (error) throw error;
      return data;
    },
  });

  const muscleGroups = muscleGroupsResult.map((mg: any) => ({
    id: mg.id,
    slug: mg.slug,
    name: mg.muscle_group_translations?.[0]?.name || mg.slug.replace(/-/g, ' '),
    body_part_id: mg.body_part_id,
  }));

  // Fetch muscles
  const { data: muscles = [] } = useQuery({
    queryKey: ['muscles'],
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

  // Fetch equipment
  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
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

  // Helper functions
  const getTranslation = (translations: any[], lang = 'en') => {
    if (!translations || !Array.isArray(translations)) return null;
    return translations.find(t => t.language_code === lang);
  };

  const getName = (item: any, lang = 'en') => {
    if (item.name) return item.name; // For processed items
    const translation = getTranslation(item.translations, lang);
    return translation?.name || item.slug || 'Unknown';
  };

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

  // Auto-generate name from variant + equipment + movement
  useEffect(() => {
    if (formData.name) return; // Don't override manual input

    const parts = [];
    
    if (formData.variant) {
      parts.push(formData.variant.charAt(0).toUpperCase() + formData.variant.slice(1));
    }

    if (formData.equipmentId) {
      const eq = equipment.find(e => e.id === formData.equipmentId);
      if (eq) {
        const eqName = getName(eq);
        parts.push(eqName);
      }
    }

    // Add movement type based on pattern
    if (formData.movementPattern) {
      switch (formData.movementPattern) {
        case 'push':
        case 'horizontal_push':
        case 'vertical_push':
          parts.push('Press');
          break;
        case 'pull':
        case 'horizontal_pull':
        case 'vertical_pull':
          parts.push('Pull');
          break;
        case 'squat':
          parts.push('Squat');
          break;
        case 'hinge':
          parts.push('Hinge');
          break;
        default:
          parts.push(formData.movementPattern.charAt(0).toUpperCase() + formData.movementPattern.slice(1));
      }
    }

    if (parts.length > 0) {
      setFormData(prev => ({ ...prev, name: parts.join(' ') }));
    }
  }, [formData.variant, formData.equipmentId, formData.movementPattern, equipment]);

  // Filtered muscle groups by body part
  const filteredMuscleGroups = useMemo(() => {
    if (!formData.bodyPartId) return [];
    return muscleGroups.filter(mg => mg.body_part_id === formData.bodyPartId);
  }, [muscleGroups, formData.bodyPartId]);

  // Primary muscle (single selection from muscle group)
  const availableMuscles = useMemo(() => {
    if (!formData.primaryMuscleId) return [];
    const primaryMuscle = muscles.find(m => m.id === formData.primaryMuscleId);
    if (primaryMuscle) {
      return muscles.filter(m => m.muscle_group_id === primaryMuscle.muscle_group_id);
    }
    return [];
  }, [muscles, formData.primaryMuscleId]);

  // Get selected equipment details
  const selectedEquipment = useMemo(() => {
    return equipment.find(eq => eq.id === formData.equipmentId);
  }, [equipment, formData.equipmentId]);

  // Update load type when equipment changes
  useEffect(() => {
    if (selectedEquipment) {
      setFormData(prev => ({
        ...prev,
        loadType: selectedEquipment.load_type,
        loadMedium: selectedEquipment.load_medium,
        requiresHandle: ['cable', 'band'].includes(selectedEquipment.load_medium),
      }));
    }
  }, [selectedEquipment]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      bodyPartId: '',
      primaryMuscleId: '',
      secondaryMuscleGroupIds: [],
      movementPattern: '',
      skillLevel: 'medium',
      variant: '',
      isUnilateral: false,
      equipmentId: '',
      loadType: '',
      loadMedium: '',
      requiresHandle: false,
      allowsGrips: true,
      isBarLoaded: false,
      defaultHandleIds: [],
      defaultGripIds: [],
      tags: [],
      aliases: [],
      attributeValues: {},
      slug: '',
      isPublic: true,
    });
    setActiveTab('basics');
  };

  // Create exercise mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      // Basic validation
      if (!formData.bodyPartId) throw new Error('Body part is required');
      if (!formData.primaryMuscleId) throw new Error('Primary muscle is required');
      if (!formData.equipmentId) throw new Error('Equipment is required');

      // Auto-generate name if not provided
      const selectedEquipmentName = selectedEquipment ? getName(selectedEquipment) : '';
      const exerciseName = formData.name || `${formData.variant ? formData.variant + ' ' : ''}${selectedEquipmentName} ${formData.movementPattern}`.trim();
      
      const exerciseData = {
        slug: formData.slug || exerciseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        custom_display_name: formData.name || null, // Only set if manually provided
        owner_user_id: user?.id,
        body_part_id: formData.bodyPartId,
        primary_muscle_id: formData.primaryMuscleId,
        secondary_muscle_group_ids: formData.secondaryMuscleGroupIds.length > 0 ? formData.secondaryMuscleGroupIds : null,
        equipment_id: formData.equipmentId,
        movement_pattern: formData.movementPattern as any,
        exercise_skill_level: formData.skillLevel as any,
        load_type: formData.loadType as any,
        is_unilateral: formData.isUnilateral,
        requires_handle: formData.requiresHandle,
        allows_grips: formData.allowsGrips,
        is_bar_loaded: formData.isBarLoaded,
        default_handle_ids: formData.defaultHandleIds.length > 0 ? formData.defaultHandleIds : null,
        default_grip_ids: formData.defaultGripIds.length > 0 ? formData.defaultGripIds : null,
        capability_schema: formData.attributeValues,
        tags: formData.tags.length > 0 ? formData.tags : null,
        is_public: formData.isPublic,
        popularity_rank: 1,
      };

      const { data: exercise, error } = await supabase
        .from('exercises')
        .insert(exerciseData)
        .select()
        .single();

      if (error) throw error;

      const exerciseId = exercise.id;

      // Create translation
      const { error: translationError } = await supabase
        .from('exercises_translations')
        .insert({
          exercise_id: exerciseId,
          language_code: 'en',
          name: exerciseName,
          description: formData.description || null,
        });

      if (translationError) {
        console.error('Failed to create translation:', translationError);
      }

      // Create aliases if provided
      if (formData.aliases.length > 0) {
        const aliasInserts = formData.aliases.map(alias => ({
          exercise_id: exerciseId,
          alias: alias,
        }));

        const { error: aliasError } = await supabase
          .from('exercise_aliases')
          .insert(aliasInserts);

        if (aliasError) {
          console.error('Failed to create aliases:', aliasError);
        }
      }

      return exercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_exercises'] });
      toast({
        title: "Success",
        description: "Exercise created successfully with hybrid model!",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create exercise",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const navigateTab = (direction: 'next' | 'prev') => {
    const tabs = ['basics', 'variant', 'muscles', 'tags', 'attributes'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (direction === 'next' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Create New Exercise 
            <Badge variant="secondary">Hybrid Model</Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="variant">Variant</TabsTrigger>
              <TabsTrigger value="muscles">Muscles</TabsTrigger>
              <TabsTrigger value="tags">Tags & Aliases</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Exercise Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Leave empty to auto-generate from variant + equipment + movement"
                  />
                  <p className="text-sm text-muted-foreground">
                    Auto-generated example: "Incline Barbell Press"
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter exercise description and cues"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Body Part *</Label>
                    <Select
                      value={formData.bodyPartId}
                      onValueChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        bodyPartId: value,
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
                             {bp.name}
                           </SelectItem>
                         ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                </div>

                <div className="space-y-2">
                  <Label>Movement Pattern *</Label>
                  <Select
                    value={formData.movementPattern}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, movementPattern: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select movement pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="push">Push</SelectItem>
                      <SelectItem value="pull">Pull</SelectItem>
                      <SelectItem value="squat">Squat</SelectItem>
                      <SelectItem value="hinge">Hinge</SelectItem>
                      <SelectItem value="lunge">Lunge</SelectItem>
                      <SelectItem value="carry">Carry</SelectItem>
                      <SelectItem value="gait">Gait</SelectItem>
                      <SelectItem value="corrective">Corrective</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={() => navigateTab('next')}>
                  Next: Variant
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="variant" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Exercise Variant</Label>
                  <p className="text-sm text-muted-foreground">
                    For exercises where angle changes the primary muscle (e.g., chest press, cable fly)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Angle Variant</Label>
                  <Select
                    value={formData.variant}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, variant: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variant (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      <SelectItem value="flat">Flat</SelectItem>
                      <SelectItem value="incline">Incline</SelectItem>
                      <SelectItem value="decline">Decline</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="mid">Mid</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4" />
                      Hybrid Model Approach
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><strong>First-class exercises:</strong> Flat/Incline/Decline as separate exercise records</p>
                    <p><strong>Runtime choices:</strong> Handles and grips remain selectable during workouts</p>
                    <p><strong>Member gating:</strong> {isPro ? "Pro features enabled" : "Basic features only"}</p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Skill Level</Label>
                    <Select
                      value={formData.skillLevel}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, skillLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Beginner</SelectItem>
                        <SelectItem value="medium">Intermediate</SelectItem>
                        <SelectItem value="high">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 mt-6">
                    <Switch
                      checked={formData.isUnilateral}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isUnilateral: checked }))}
                    />
                    <Label>Unilateral Exercise</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => navigateTab('prev')}>
                  Previous
                </Button>
                <Button type="button" onClick={() => navigateTab('next')}>
                  Next: Muscles
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="muscles" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Muscle *</Label>
                  <Select
                    value={formData.primaryMuscleId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, primaryMuscleId: value }))}
                    disabled={!formData.bodyPartId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary muscle" />
                    </SelectTrigger>
                    <SelectContent>
                      {muscles
                        .filter(muscle => {
                          if (!formData.bodyPartId) return false;
                          const muscleGroup = muscleGroups.find(mg => mg.id === muscle.muscle_group_id);
                          return muscleGroup?.body_part_id === formData.bodyPartId;
                        })
                        .map((muscle) => (
                          <SelectItem key={muscle.id} value={muscle.id}>
                            {getName(muscle)}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <SecondaryMuscleGroupSelector
                  bodyParts={bodyParts}
                  muscleGroups={muscleGroups}
                  selectedMuscleGroupIds={formData.secondaryMuscleGroupIds}
                  excludedMuscleGroupId={
                    formData.primaryMuscleId ? 
                    muscles.find(m => m.id === formData.primaryMuscleId)?.muscle_group_id : 
                    undefined
                  }
                  onChange={(muscleGroupIds) => setFormData(prev => ({ ...prev, secondaryMuscleGroupIds: muscleGroupIds }))}
                />
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => navigateTab('prev')}>
                  Previous
                </Button>
                <Button type="button" onClick={() => navigateTab('next')}>
                  Next: Tags & Aliases
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="tags" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input
                    placeholder="Enter tags separated by commas (e.g., press, barbell, chest)"
                    value={formData.tags.join(', ')}
                    onChange={(e) => {
                      const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, tags }));
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Used for search facets and categorization
                  </p>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Aliases</Label>
                  <Input
                    placeholder="Enter aliases separated by commas (e.g., negative bench, declined press)"
                    value={formData.aliases.join(', ')}
                    onChange={(e) => {
                      const aliases = e.target.value.split(',').map(alias => alias.trim()).filter(Boolean);
                      setFormData(prev => ({ ...prev, aliases }));
                    }}
                  />
                  <p className="text-sm text-muted-foreground">
                    Alternative names that users might search for
                  </p>
                  {formData.aliases.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.aliases.map((alias, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {alias}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {selectedEquipment && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Equipment Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Load Type</Label>
                          <Select
                            value={formData.loadType}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, loadType: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select load type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="fixed">Fixed</SelectItem>
                              <SelectItem value="barbell">Barbell</SelectItem>
                              <SelectItem value="single_load">Single Load</SelectItem>
                              <SelectItem value="dual_load">Dual Load</SelectItem>
                              <SelectItem value="stack">Stack</SelectItem>
                              <SelectItem value="bodyweight">Bodyweight</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Load Medium</Label>
                          <Select
                            value={formData.loadMedium}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, loadMedium: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select load medium" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="weight">Weight</SelectItem>
                              <SelectItem value="cable">Cable</SelectItem>
                              <SelectItem value="band">Band</SelectItem>
                              <SelectItem value="hydraulic">Hydraulic</SelectItem>
                              <SelectItem value="pneumatic">Pneumatic</SelectItem>
                              <SelectItem value="gravity">Gravity</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.requiresHandle}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresHandle: checked }))}
                          />
                          <Label className="text-sm">Requires Handle</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.allowsGrips}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowsGrips: checked }))}
                          />
                          <Label className="text-sm">Allows Grips</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={formData.isBarLoaded}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBarLoaded: checked }))}
                          />
                          <Label className="text-sm">Bar Loaded</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => navigateTab('prev')}>
                  Previous
                </Button>
                <Button type="button" onClick={() => navigateTab('next')}>
                  Next: Attributes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="attributes" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Exercise Attributes</Label>
                  <p className="text-sm text-muted-foreground">
                    Only neutral attributes that don't change primary muscles are shown.
                    Angle-based attributes are now separate exercises.
                  </p>
                </div>

                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="h-4 w-4 text-orange-600" />
                      Membership Gating
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><strong>General attributes:</strong> Tempo, pauses, ROM notes (available to all)</p>
                    <p><strong>Pro attributes:</strong> {isPro ? "Micro-adjustments and advanced options available" : "Upgrade to Pro for advanced options"}</p>
                    <p><strong>Deprecated attributes:</strong> Angle attributes are hidden (data preserved for backward compatibility)</p>
                  </CardContent>
                </Card>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Neutral attribute configuration will be implemented based on the hybrid model.
                    Only attributes that don't affect primary muscle targeting are shown here.
                  </p>
                </div>

                {formData.allowsGrips && (
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Default Handles & Grips</Label>
                    <p className="text-sm text-muted-foreground">
                      Select default handles and grips for this exercise. Users can still change them during workouts.
                    </p>
                    <HandleGripSelector
                      exerciseId={undefined}
                      selectedHandleId={formData.defaultHandleIds[0]}
                      selectedGripIds={formData.defaultGripIds}
                      onHandleChange={(handleId) => setFormData(prev => ({ ...prev, defaultHandleIds: [handleId] }))}
                      onGripChange={(gripIds) => setFormData(prev => ({ ...prev, defaultGripIds: gripIds }))}
                      multiSelectGrips={true}
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label>Make exercise public</Label>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => navigateTab('prev')}>
                  Previous
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending}
                  className="min-w-[120px]"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Exercise'
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  );
}