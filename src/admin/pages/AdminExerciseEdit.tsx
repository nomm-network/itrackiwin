import React from "react";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import SecondaryMuscleSelector from "@/components/SecondaryMuscleSelector";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ExerciseImageUploader from "@/components/ExerciseImageUploader";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getExerciseNameFromTranslations, getExerciseDescriptionFromTranslations } from "@/utils/exerciseTranslations";
import { X } from "lucide-react";

// Basic SEO
const useSEO = (name?: string) => {
  React.useEffect(() => {
    document.title = name ? `Edit Exercise | ${name} | Admin` : "Edit Exercise | Admin";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Edit exercise properties, muscles, equipment and configuration.');
    document.head.appendChild(desc);

    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', `${window.location.origin}/admin/exercises/edit`);
    document.head.appendChild(link);
  }, [name]);
};

// Types for taxonomy
interface BodyPart { id: string; name: string }
interface MuscleGroup { id: string; name: string; body_part_id: string }
interface Muscle { id: string; name: string; muscle_group_id: string }
interface Equipment { id: string; name: string }
interface Movement { id: string; name: string; movement_pattern_id: string }
interface MovementPattern { id: string; name: string }

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  body_part_id: z.string().uuid().optional().or(z.literal('')),
  primary_muscle_group_id: z.string().uuid().optional().or(z.literal('')),
  primary_muscle_id: z.string().uuid().optional().or(z.literal('')),
  secondary_muscle_group_ids: z.array(z.string().uuid()).optional(),
  equipment_id: z.string().uuid().optional().or(z.literal('')),
  movement_id: z.string().uuid().optional().or(z.literal('')),
  movement_pattern_id: z.string().uuid().optional().or(z.literal('')),
  exercise_skill_level: z.enum(['low', 'medium', 'high']).optional(),
  complexity_score: z.number().min(1).max(10).optional(),
  load_type: z.enum(['single_load', 'dual_load', 'stack', 'fixed', 'barbell', 'bodyweight']).optional(),
  is_unilateral: z.boolean().default(false),
  requires_handle: z.boolean().default(false),
  allows_grips: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  source_url: z.string().url().optional().or(z.literal('')),
  image_url: z.string().url().optional().or(z.literal('')),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
  loading_hint: z.string().optional(),
  is_public: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

const AdminExerciseEdit: React.FC = () => {
  console.log("🚀 AdminExerciseEdit component is loading - FILE VERIFICATION");
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [exerciseName, setExerciseName] = React.useState<string>("");
  useSEO(exerciseName);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [lastError, setLastError] = React.useState<string | null>(null);
  const [debugInfo, setDebugInfo] = React.useState<any>(null);
  const [showDebugModal, setShowDebugModal] = React.useState(false);

  const [bodyParts, setBodyParts] = React.useState<BodyPart[]>([]);
  const [muscleGroups, setMuscleGroups] = React.useState<MuscleGroup[]>([]);
  const [muscles, setMuscles] = React.useState<Muscle[]>([]);
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [movements, setMovements] = React.useState<Movement[]>([]);
  const [movementPatterns, setMovementPatterns] = React.useState<MovementPattern[]>([]);
  const [newTag, setNewTag] = React.useState('');

  const [files, setFiles] = React.useState<File[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      body_part_id: "",
      primary_muscle_group_id: "",
      primary_muscle_id: "",
      secondary_muscle_group_ids: [],
      equipment_id: "",
      movement_id: "",
      movement_pattern_id: "",
      exercise_skill_level: "medium",
      complexity_score: 3,
      load_type: undefined,
      is_unilateral: false,
      requires_handle: false,
      allows_grips: true,
      tags: [],
      source_url: "",
      image_url: "",
      thumbnail_url: "",
      loading_hint: "",
      is_public: true,
    },
  });

  const selectedBodyPartId = form.watch("body_part_id") || "";
  const selectedGroupId = form.watch('primary_muscle_group_id') || '';
  const selectedPatternId = form.watch('movement_pattern_id') || '';

  const filteredMuscleGroups = React.useMemo(() => {
    if (!selectedBodyPartId) return muscleGroups;
    return muscleGroups.filter((g) => g.body_part_id === selectedBodyPartId);
  }, [muscleGroups, selectedBodyPartId]);

  const primaryMusclesOptions = React.useMemo(() => {
    if (!selectedGroupId) return [] as Muscle[];
    return muscles.filter((mu) => mu.muscle_group_id === selectedGroupId);
  }, [muscles, selectedGroupId]);

  const filteredMovements = React.useMemo(() => {
    if (!selectedPatternId) return [];
    return movements.filter((mv) => mv.movement_pattern_id === selectedPatternId);
  }, [movements, selectedPatternId]);

  React.useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [bp, mg, m, eq, mv, mp] = await Promise.all([
          supabase.from("body_parts").select("id, slug, body_parts_translations!inner(name)").eq('body_parts_translations.language_code', 'en'),
          supabase.from("muscle_groups").select("id, slug, body_part_id, muscle_groups_translations!inner(name)").eq('muscle_groups_translations.language_code', 'en'),
          supabase.from("muscles").select("id, slug, muscle_group_id, muscles_translations!inner(name)").eq('muscles_translations.language_code', 'en'),
          supabase.from("equipment").select("id, slug, equipment_translations!inner(name)").eq('equipment_translations.language_code', 'en'),
          supabase.from("movements").select("id, slug, movement_pattern_id, movements_translations!fk_movements_translations_movement_id(name)").eq('movements_translations.language_code', 'en'),
          supabase.from("movement_patterns").select("id, slug, movement_patterns_translations!fk_movement_patterns_translations_movement_pattern_id(name)").eq('movement_patterns_translations.language_code', 'en'),
        ]);
        if (bp.error) throw bp.error; if (mg.error) throw mg.error; if (m.error) throw m.error; 
        if (eq.error) throw eq.error; if (mv.error) throw mv.error; if (mp.error) throw mp.error;
        
        setBodyParts(bp.data?.map(item => ({ id: item.id, slug: item.slug, name: (item.body_parts_translations as any)[0]?.name || '' })) || []);
        setMuscleGroups(mg.data?.map(item => ({ id: item.id, slug: item.slug, body_part_id: item.body_part_id, name: (item.muscle_groups_translations as any)[0]?.name || '' })) || []);
        setMuscles(m.data?.map(item => ({ id: item.id, slug: item.slug, muscle_group_id: item.muscle_group_id, name: (item.muscles_translations as any)[0]?.name || '' })) || []);
        setEquipment(eq.data?.map(item => ({ id: item.id, name: (item.equipment_translations as any)[0]?.name || '' })) || []);
        setMovements(mv.data?.map(item => ({ id: item.id, name: (item.movements_translations as any)[0]?.name || '', movement_pattern_id: item.movement_pattern_id })) || []);
        setMovementPatterns(mp.data?.map(item => ({ id: item.id, name: (item.movement_patterns_translations as any)[0]?.name || '' })) || []);
      } catch (e: any) {
        console.error("[ExerciseEdit] load options error", e);
        setLastError(e?.message || String(e));
        toast({ title: "Failed to load options", description: e?.message || "Unknown error" });
      }
    };
    loadAll();
  }, [toast]);

  React.useEffect(() => {
    const loadExercise = async () => {
      const id = params.id!;
      if (!id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('v_exercises_with_translations')
          .select(`
            id, body_part_id, primary_muscle_id, secondary_muscle_group_ids, 
            equipment_id, movement_id, movement_pattern_id, exercise_skill_level,
            complexity_score, load_type, is_unilateral, requires_handle, allows_grips,
            tags, source_url, image_url, thumbnail_url, loading_hint, is_public, translations
          `)
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        if (!data) throw new Error('Exercise not found');
        
        // Extract name and description from translations
        const translations = data.translations || {};
        const name = getExerciseNameFromTranslations(translations, data.id);
        const description = getExerciseDescriptionFromTranslations(translations);
        
        setExerciseName(name);
        form.setValue('name', name);
        form.setValue('description', description || '');
        form.setValue('body_part_id', data.body_part_id || '');
        // derive group from primary muscle
        if (data.primary_muscle_id) {
          const mu = muscles.find((x) => x.id === data.primary_muscle_id);
          if (mu) {
            const group = muscleGroups.find((g) => g.id === mu.muscle_group_id);
            if (group) form.setValue('primary_muscle_group_id', group.id);
          }
          form.setValue('primary_muscle_id', data.primary_muscle_id);
        }
        form.setValue('secondary_muscle_group_ids', data.secondary_muscle_group_ids || []);
        form.setValue('equipment_id', data.equipment_id || '');
        // Ensure UUIDs are set properly, not empty strings
        form.setValue('movement_id', data.movement_id || '');
        form.setValue('movement_pattern_id', data.movement_pattern_id || '');
        
        console.log("🔥 LOADED EXERCISE DATA", {
          movement_id: data.movement_id,
          movement_pattern_id: data.movement_pattern_id,
          load_type: data.load_type
        });
        form.setValue('exercise_skill_level', data.exercise_skill_level || 'medium');
        form.setValue('complexity_score', data.complexity_score || 3);
        form.setValue('load_type', data.load_type);
        form.setValue('is_unilateral', data.is_unilateral || false);
        form.setValue('requires_handle', data.requires_handle || false);
        form.setValue('allows_grips', data.allows_grips ?? true);
        form.setValue('tags', data.tags || []);
        form.setValue('source_url', data.source_url || '');
        form.setValue('image_url', data.image_url || '');
        form.setValue('thumbnail_url', data.thumbnail_url || '');
        form.setValue('loading_hint', data.loading_hint || '');
        form.setValue('is_public', data.is_public ?? true);
      } catch (e: any) {
        console.error('[ExerciseEdit] load error', e);
        setLastError(e?.message || String(e));
        toast({ title: 'Failed to load exercise', description: e?.message || 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };
    // wait a tick so options are loaded first
    setTimeout(loadExercise, 0);
  }, [params.id, muscles, muscleGroups, toast, form]);

  const onSubmit = async (values: FormValues) => {
    console.log("🔥 FORM SUBMIT STARTED", { values });
    
    // Ensure movement fields are UUIDs or null, not empty strings
    const cleanMovementId = values.movement_id === '' ? null : values.movement_id;
    const cleanMovementPatternId = values.movement_pattern_id === '' ? null : values.movement_pattern_id;
    
    console.log("🔥 CLEANED VALUES", { 
      original_movement_id: values.movement_id,
      clean_movement_id: cleanMovementId,
      original_movement_pattern_id: values.movement_pattern_id, 
      clean_movement_pattern_id: cleanMovementPatternId 
    });
    
    setSaving(true);
    setLastError(null);
    
    try {
      const id = params.id!;
      
      // Build minimal payload with critical fields
      const exercisePayload = {
        movement_id: cleanMovementId,
        movement_pattern_id: cleanMovementPatternId,
        load_type: values.load_type || null,
        body_part_id: values.body_part_id || null,
        primary_muscle_id: values.primary_muscle_id || null,
        equipment_id: values.equipment_id || null,
        exercise_skill_level: values.exercise_skill_level || null,
        complexity_score: values.complexity_score || null,
        is_unilateral: values.is_unilateral,
        requires_handle: values.requires_handle,
        allows_grips: values.allows_grips,
        is_public: values.is_public,
      };

      console.log("🔥 PAYLOAD TO SEND", exercisePayload);
      
      // Create debug info BEFORE sending request - capture the REAL request details
      const debugData = {
        timestamp: new Date().toISOString(),
        exerciseId: id,
        formValues: values,
        cleanedPayload: exercisePayload,
        criticalFields: {
          movement_id: cleanMovementId,
          movement_pattern_id: cleanMovementPatternId,
          load_type: values.load_type,
        },
        realSupabaseRequest: {
          method: 'PATCH',
          url: `https://fsayiuhncisevhipbrak.supabase.co/rest/v1/exercises?id=eq.${id}`,
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'accept-profile': 'public',
            'content-profile': 'public',
          },
          body: JSON.stringify(exercisePayload)
        },
        payloadFieldCount: Object.keys(exercisePayload).length
      };
      
      setDebugInfo(debugData);
      setShowDebugModal(true);

      // CRITICAL: Await the update and capture response
      const { error, data } = await supabase
        .from('exercises')
        .update(exercisePayload)
        .eq('id', id)
        .select('id, movement_id, movement_pattern_id, load_type');

      console.log("🔥 SUPABASE RESPONSE", { error, data });
      
      // Update debug info with response
      const finalDebugData = {
        ...debugData,
        supabaseResponse: { error, data },
        success: !error
      };
      setDebugInfo(finalDebugData);
      
      // Store debug info for management page
      localStorage.setItem('exerciseEditDebug', JSON.stringify(finalDebugData));
      
      // CRITICAL: Check for errors BEFORE proceeding
      if (error) {
        console.error("🔥 SUPABASE ERROR", error);
        setLastError(`Database error: ${error.message}`);
        toast({ 
          title: 'Database Update Failed', 
          description: error.message,
          variant: 'destructive'
        });
        return; // Don't navigate or continue
      }

      // Update translation only after successful main update
      const { error: translationError } = await supabase
        .from('exercises_translations')
        .upsert({
          exercise_id: id,
          language_code: 'en',
          name: values.name.trim(),
          description: values.description || null,
        }, {
          onConflict: 'exercise_id,language_code'
        });
        
      if (translationError) {
        console.error("🔥 TRANSLATION ERROR", translationError);
        // Don't fail completely on translation error
        toast({ 
          title: 'Translation update failed', 
          description: translationError.message,
          variant: 'destructive'
        });
      }

      toast({ title: 'Exercise updated successfully!' });
      
      // Only navigate after successful save
      setTimeout(() => {
        navigate('/admin/exercises');
      }, 1000); // Delay to allow debug modal viewing
      
    } catch (e: any) {
      const errorMsg = e?.message || String(e);
      console.error('🔥 CATCH ERROR', e);
      setLastError(errorMsg);
      setDebugInfo(prev => ({ 
        ...prev, 
        catchError: errorMsg,
        success: false 
      }));
      toast({ 
        title: 'Failed to update exercise', 
        description: errorMsg,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !form.watch('tags')?.includes(newTag.trim())) {
      const currentTags = form.watch('tags') || [];
      form.setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.watch('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Exercise</h1>
        <Button variant="secondary" asChild>
          <Link to="/admin/exercises">Back to Exercise Management</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-8" onSubmit={form.handleSubmit(onSubmit)}>
          <section className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...form.register('name')} placeholder="e.g., Barbell Bench Press" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} {...form.register('description')} placeholder="Brief instructions, cues, etc." />
            </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Body Part</Label>
                  <Select onValueChange={(v) => { form.setValue('body_part_id', v); form.setValue('primary_muscle_group_id', ''); form.setValue('primary_muscle_id', ''); }} value={form.watch('body_part_id') || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select body part" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyParts.map((bp) => (
                        <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Equipment</Label>
                  <Select onValueChange={(v) => form.setValue('equipment_id', v)} value={form.watch('equipment_id') || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipment.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Movement Pattern</Label>
                  <Select onValueChange={(v) => { form.setValue('movement_pattern_id', v); form.setValue('movement_id', ''); }} value={form.watch('movement_pattern_id') || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select movement pattern" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {movementPatterns.map((mp) => (
                        <SelectItem key={mp.id} value={mp.id}>{mp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Movement</Label>
                  <Select onValueChange={(v) => form.setValue('movement_id', v)} value={form.watch('movement_id') || ''} disabled={!selectedPatternId}>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedPatternId ? "Select movement" : "Select pattern first"} />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {filteredMovements.map((mv) => (
                        <SelectItem key={mv.id} value={mv.id}>{mv.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Muscle Group</Label>
                    <Select onValueChange={(v) => { form.setValue('primary_muscle_group_id', v); form.setValue('primary_muscle_id', ''); }} value={form.watch('primary_muscle_group_id') || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder={form.watch('body_part_id') ? 'Select muscle group' : 'Select body part first'} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredMuscleGroups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Primary Muscle</Label>
                    <Select onValueChange={(v) => form.setValue('primary_muscle_id', v)} value={form.watch('primary_muscle_id') || ''} disabled={!form.watch('primary_muscle_group_id')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select primary muscle" />
                      </SelectTrigger>
                      <SelectContent>
                        {primaryMusclesOptions.map((mu) => (
                          <SelectItem key={mu.id} value={mu.id}>{mu.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Skill Level</Label>
                    <Select onValueChange={(v) => form.setValue('exercise_skill_level', v as any)} value={form.watch('exercise_skill_level') || 'medium'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Beginner</SelectItem>
                        <SelectItem value="medium">Intermediate</SelectItem>
                        <SelectItem value="high">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Load Type</Label>
                    <Select onValueChange={(v) => form.setValue('load_type', v === 'none' ? undefined : v as any)} value={form.watch('load_type') || 'none'}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select load type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="single_load">Single Load</SelectItem>
                        <SelectItem value="dual_load">Dual Load</SelectItem>
                        <SelectItem value="stack">Stack</SelectItem>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="barbell">Barbell</SelectItem>
                        <SelectItem value="bodyweight">Bodyweight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Complexity Score: {form.watch('complexity_score')}</Label>
                <Slider
                  value={[form.watch('complexity_score') || 3]}
                  onValueChange={(value) => form.setValue('complexity_score', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">1 = Very Simple, 10 = Very Complex</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Unilateral Exercise</Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.watch('is_unilateral')} onCheckedChange={(v) => form.setValue('is_unilateral', v)} />
                    <span className="text-sm text-muted-foreground">Single limb</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Requires Handle</Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.watch('requires_handle')} onCheckedChange={(v) => form.setValue('requires_handle', v)} />
                    <span className="text-sm text-muted-foreground">Needs attachment</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allows Grips</Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.watch('allows_grips')} onCheckedChange={(v) => form.setValue('allows_grips', v)} />
                    <span className="text-sm text-muted-foreground">Multiple grips</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} variant="outline">Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('tags')?.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">Image URL (optional)</Label>
                  <Input id="image_url" {...form.register('image_url')} placeholder="https://example.com/image.jpg" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">Thumbnail URL (optional)</Label>
                  <Input id="thumbnail_url" {...form.register('thumbnail_url')} placeholder="https://example.com/thumb.jpg" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loading_hint">Loading Hint (optional)</Label>
                <Input id="loading_hint" {...form.register('loading_hint')} placeholder="e.g., Load plates on both sides" />
              </div>

              <div className="space-y-2">
                <Label>Make Public</Label>
                <div className="flex items-center gap-3">
                  <Switch checked={form.watch('is_public')} onCheckedChange={(v) => form.setValue('is_public', v)} />
                  <span className="text-sm text-muted-foreground">Visible to everyone</span>
                </div>
              </div>

              <p>Secondary Muscle Groups feature will be implemented here.</p>

              <div className="space-y-2">
                <Label htmlFor="source_url">Source URL (optional)</Label>
                <Input id="source_url" {...form.register('source_url')} placeholder="https://example.com" />
              </div>
            </section>

            <aside className="space-y-4">
              <div className="space-y-2">
                <Label>Images</Label>
                <ExerciseImageUploader files={files} onChange={setFiles} />
                <p className="text-xs text-muted-foreground">First image becomes the thumbnail if none is set.</p>
              </div>

                <div className="flex gap-2 pt-2 pb-[50px]">
                  <Button type="button" variant="secondary" asChild>
                    <Link to="/admin/exercises">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
                </div>

              {lastError && (
                <p role="alert" className="text-destructive text-sm">{lastError}</p>
              )}
              
              {/* 🔥 DEBUG AREA - ALWAYS VISIBLE */}
              {debugInfo && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                  <h3 className="font-bold mb-2 text-red-400">🔥 DEBUG INFORMATION</h3>
                  <div className="space-y-3 text-xs">
                    <div className="text-yellow-300">
                      <strong>Timestamp:</strong> {debugInfo.timestamp}
                    </div>
                    <div className="text-yellow-300">
                      <strong>Exercise ID:</strong> {debugInfo.exerciseId}
                    </div>
                    
                    <div>
                      <strong className="text-orange-400">Critical Fields:</strong>
                      <pre className="bg-black/50 p-2 rounded mt-1 overflow-auto text-green-300">
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
                </div>
              )}
            </aside>
          </form>
        )}
        
        {/* 🔥 DEBUG MODAL */}
        {showDebugModal && debugInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">🔥 Debug Information</h2>
                  <button 
                    onClick={() => setShowDebugModal(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <strong>Timestamp:</strong> {debugInfo.timestamp}
                  </div>
                  <div>
                    <strong>Exercise ID:</strong> {debugInfo.exerciseId}
                  </div>
                  
                  <div>
                    <strong>Critical Fields:</strong>
                    <pre className="bg-muted p-3 rounded mt-2 overflow-auto text-xs">
{JSON.stringify(debugInfo.criticalFields, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <strong>Real Supabase Request:</strong>
                    <pre className="bg-muted p-3 rounded mt-2 overflow-auto text-xs max-h-60">
{JSON.stringify(debugInfo.realSupabaseRequest, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <strong>Full Payload ({debugInfo.payloadFieldCount} fields):</strong>
                    <pre className="bg-muted p-3 rounded mt-2 overflow-auto text-xs max-h-60">
{JSON.stringify(JSON.parse(debugInfo.realSupabaseRequest?.body || '{}'), null, 2)}
                    </pre>
                  </div>
                  
                  {debugInfo.supabaseResponse && (
                    <div>
                      <strong>Supabase Response:</strong>
                      <pre className="bg-muted p-3 rounded mt-2 overflow-auto text-xs max-h-60">
{JSON.stringify(debugInfo.supabaseResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-4">
                    <button 
                      onClick={() => setShowDebugModal(false)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                    >
                      Close
                    </button>
                    <button 
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
                    >
                      Copy Debug Info
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};

export default AdminExerciseEdit;