import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, AlertTriangle, CheckCircle, Bug, Database, Code, Network } from "lucide-react";

// SEO
const useSEO = (name?: string, isEdit?: boolean) => {
  React.useEffect(() => {
    const mode = isEdit ? "Edit" : "Add";
    document.title = name ? `${mode} Exercise | ${name} | Admin` : `${mode} Exercise | Admin`;
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', isEdit ? 'Edit exercise properties, muscles, equipment and configuration.' : 'Add new exercise with muscles, equipment and configuration.');
    document.head.appendChild(desc);
  }, [name, isEdit]);
};

// Schema based on the spec
const schema = z.object({
  // Section A - Basics (required)
  display_name: z.string().min(2, 'Display name is required'),
  slug: z.string().min(2, 'Slug is required'),
  custom_display_name: z.string().optional(),
  is_public: z.boolean().default(true),
  owner_user_id: z.string().uuid().optional().or(z.literal('')),
  popularity_rank: z.number().optional(),
  loading_hint: z.string().optional(), // maps to description in spec

  // Section B - Classification
  body_part_id: z.string().uuid().optional().or(z.literal('')),
  movement_pattern_id: z.string().uuid().optional().or(z.literal('')),
  movement_id: z.string().uuid().optional().or(z.literal('')),
  primary_muscle_id: z.string().uuid().optional().or(z.literal('')),
  secondary_muscle_group_ids: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),

  // Section C - Equipment & Load (required)
  equipment_id: z.string().uuid('Equipment is required'),
  equipment_ref_id: z.string().uuid().optional().or(z.literal('')),
  effort_mode: z.enum(['reps', 'time', 'distance', 'calories']),
  load_mode: z.enum(['bodyweight_plus_optional', 'external_added', 'external_assist', 'machine_level', 'none', 'band_level']),
  load_type: z.enum(['single_load', 'dual_load', 'stack', 'fixed', 'barbell', 'bodyweight']).optional(),
  
  // Barbell specifics (conditional)
  is_bar_loaded: z.boolean().default(false),
  default_bar_type_id: z.string().uuid().optional().or(z.literal('')),
  default_bar_weight: z.number().nullable().optional(),

  // Section D - Capability & Difficulty
  exercise_skill_level: z.enum(['low', 'medium', 'high']).optional(),
  complexity_score: z.number().min(1).max(10).default(3),
  is_unilateral: z.boolean().default(false),
  allows_grips: z.boolean().default(false),
  default_grip_ids: z.array(z.string().uuid()).optional(),

  // Section E - Safety & Metadata
  contraindications: z.string().optional(), // JSON array as string
  capability_schema: z.string().optional(), // JSON object as string
  attribute_values_json: z.string().default('{}'), // JSON object as string, NOT NULL

  // Section F - Localization
  name_locale: z.string().default('en'),
  name_version: z.number().default(1),

  // Section G - Media
  image_url: z.string().url().optional().or(z.literal('')),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
  source_url: z.string().url().optional().or(z.literal('')),

  // Section H - Lifecycle
  configured: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

// Types for taxonomy
interface BodyPart { id: string; name: string }
interface MuscleGroup { id: string; name: string; body_part_id: string }
interface Muscle { id: string; name: string; muscle_group_id: string }
interface Equipment { id: string; name: string }
interface Movement { id: string; name: string; movement_pattern_id: string }
interface MovementPattern { id: string; name: string }
interface BarType { id: string; name: string; default_weight: number }
interface Grip { id: string; name: string }

const AdminExerciseEdit: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!params.id;
  const [exerciseName, setExerciseName] = React.useState<string>("");
  useSEO(exerciseName, isEdit);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [newTag, setNewTag] = React.useState('');

  // Taxonomy data
  const [bodyParts, setBodyParts] = React.useState<BodyPart[]>([]);
  const [muscleGroups, setMuscleGroups] = React.useState<MuscleGroup[]>([]);
  const [muscles, setMuscles] = React.useState<Muscle[]>([]);
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);
  const [movements, setMovements] = React.useState<Movement[]>([]);
  const [movementPatterns, setMovementPatterns] = React.useState<MovementPattern[]>([]);
  const [barTypes, setBarTypes] = React.useState<BarType[]>([]);
  const [grips, setGrips] = React.useState<Grip[]>([]);

  // Debug state
  const [debugInfo, setDebugInfo] = React.useState<{
    lastError: any;
    lastNetworkCall: any;
    formErrors: any;
    validationErrors: string[];
    dbQueries: any[];
    consoleErrors: any[];
  }>({
    lastError: null,
    lastNetworkCall: null,
    formErrors: {},
    validationErrors: [],
    dbQueries: [],
    consoleErrors: []
  });
  const [showDebug, setShowDebug] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: "",
      slug: "",
      custom_display_name: "",
      is_public: true,
      owner_user_id: "",
      popularity_rank: undefined,
      loading_hint: "",
      body_part_id: "",
      movement_pattern_id: "",
      movement_id: "",
      primary_muscle_id: "",
      secondary_muscle_group_ids: [],
      tags: [],
      equipment_id: "",
      equipment_ref_id: "",
      effort_mode: "reps",
      load_mode: "external_added",
      load_type: undefined,
      is_bar_loaded: false,
      default_bar_type_id: "",
      default_bar_weight: undefined,
      exercise_skill_level: "medium",
      complexity_score: 3,
      is_unilateral: false,
      allows_grips: false,
      default_grip_ids: [],
      contraindications: "[]",
      capability_schema: "{}",
      attribute_values_json: "{}",
      name_locale: "en",
      name_version: 1,
      image_url: "",
      thumbnail_url: "",
      source_url: "",
      configured: false,
    },
  });

  // Watch for dependencies
  const selectedBodyPartId = form.watch("body_part_id") || "";
  const selectedMovementPatternId = form.watch("movement_pattern_id") || "";
  const selectedPrimaryMuscleId = form.watch("primary_muscle_id") || "";
  const isBarLoaded = form.watch("is_bar_loaded");
  const allowsGrips = form.watch("allows_grips");
  const displayName = form.watch("display_name");

  // Auto-generate slug from display name
  React.useEffect(() => {
    if (displayName && !isEdit) {
      const slug = displayName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      form.setValue('slug', slug);
    }
  }, [displayName, isEdit, form]);

  // Filtered options
  const filteredMuscleGroups = React.useMemo(() => {
    if (!selectedBodyPartId) return muscleGroups;
    return muscleGroups.filter((g) => g.body_part_id === selectedBodyPartId);
  }, [muscleGroups, selectedBodyPartId]);

  const primaryMusclesOptions = React.useMemo(() => {
    const selectedMuscle = muscles.find(m => m.id === selectedPrimaryMuscleId);
    if (!selectedMuscle) return muscles;
    return muscles.filter((mu) => mu.muscle_group_id === selectedMuscle.muscle_group_id);
  }, [muscles, selectedPrimaryMuscleId]);

  const filteredMovements = React.useMemo(() => {
    if (!selectedMovementPatternId) return [];
    return movements.filter((mv) => mv.movement_pattern_id === selectedMovementPatternId);
  }, [movements, selectedMovementPatternId]);

  React.useEffect(() => {
    const loadTaxonomy = async () => {
      try {
        // Load core data without translations first
        const [bp, mg, m, eq, mv, mp, bt, gr] = await Promise.all([
          supabase.from("body_parts").select("id"),
          supabase.from("muscle_groups").select("id, body_part_id"),
          supabase.from("muscles").select("id, muscle_group_id"),
          supabase.from("equipment").select("id"),
          supabase.from("movements").select("id, movement_pattern_id"),
          supabase.from("movement_patterns").select("id"),
          supabase.from("bar_types").select("id, name, default_weight"),
          supabase.from("grips").select("id"),
        ]);

        if (bp.error) throw bp.error;
        if (mg.error) throw mg.error;
        if (m.error) throw m.error;
        if (eq.error) throw eq.error;
        if (mv.error) throw mv.error;
        if (mp.error) throw mp.error;
        if (bt.error) throw bt.error;
        if (gr.error) throw gr.error;

        // Load translations separately
        const [bpTrans, mgTrans, mTrans, eqTrans, mvTrans, mpTrans, grTrans] = await Promise.all([
          supabase.from("body_parts_translations").select("body_part_id, name").eq('language_code', 'en'),
          supabase.from("muscle_groups_translations").select("muscle_group_id, name").eq('language_code', 'en'),
          supabase.from("muscles_translations").select("muscle_id, name").eq('language_code', 'en'),
          supabase.from("equipment_translations").select("equipment_id, name").eq('language_code', 'en'),
          supabase.from("movements_translations").select("movement_id, name").eq('language_code', 'en'),
          supabase.from("movement_patterns_translations").select("movement_pattern_id, name").eq('language_code', 'en'),
          supabase.from("grips_translations").select("grip_id, name").eq('language_code', 'en'),
        ]);

        if (bpTrans.error) throw bpTrans.error;
        if (mgTrans.error) throw mgTrans.error;
        if (mTrans.error) throw mTrans.error;
        if (eqTrans.error) throw eqTrans.error;
        if (mvTrans.error) throw mvTrans.error;
        if (mpTrans.error) throw mpTrans.error;
        if (grTrans.error) throw grTrans.error;

        // Combine data with translations
        const bodyPartsWithNames = bp.data?.map(item => {
          const translation = bpTrans.data?.find(t => t.body_part_id === item.id);
          return { id: item.id, name: translation?.name || 'Unnamed' };
        }) || [];

        const muscleGroupsWithNames = mg.data?.map(item => {
          const translation = mgTrans.data?.find(t => t.muscle_group_id === item.id);
          return { id: item.id, body_part_id: item.body_part_id, name: translation?.name || 'Unnamed' };
        }) || [];

        const musclesWithNames = m.data?.map(item => {
          const translation = mTrans.data?.find(t => t.muscle_id === item.id);
          return { id: item.id, muscle_group_id: item.muscle_group_id, name: translation?.name || 'Unnamed' };
        }) || [];

        const equipmentWithNames = eq.data?.map(item => {
          const translation = eqTrans.data?.find(t => t.equipment_id === item.id);
          return { id: item.id, name: translation?.name || 'Unnamed' };
        }) || [];

        const movementsWithNames = mv.data?.map(item => {
          const translation = mvTrans.data?.find(t => t.movement_id === item.id);
          return { id: item.id, name: translation?.name || 'Unnamed', movement_pattern_id: item.movement_pattern_id };
        }) || [];

        const movementPatternsWithNames = mp.data?.map(item => {
          const translation = mpTrans.data?.find(t => t.movement_pattern_id === item.id);
          return { id: item.id, name: translation?.name || 'Unnamed' };
        }) || [];

        const gripsWithNames = gr.data?.map(item => {
          const translation = grTrans.data?.find(t => t.grip_id === item.id);
          return { id: item.id, name: translation?.name || 'Unnamed' };
        }) || [];
        
        setBodyParts(bodyPartsWithNames);
        setMuscleGroups(muscleGroupsWithNames);
        setMuscles(musclesWithNames);
        setEquipment(equipmentWithNames);
        setMovements(movementsWithNames);
        setMovementPatterns(movementPatternsWithNames);
        setBarTypes(bt.data || []);
        setGrips(gripsWithNames);
      } catch (e: any) {
        console.error("[ExerciseEdit] load taxonomy error", e);
        toast({ title: "Failed to load options", description: e?.message || "Unknown error", variant: "destructive" });
      }
    };
    loadTaxonomy();
  }, [toast]);

  // Load exercise data
  React.useEffect(() => {
    const loadExercise = async () => {
      const id = params.id;
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Load exercise data
        const { data: exerciseData, error } = await supabase
          .from('exercises')
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        if (error) throw error;
        if (!exerciseData) throw new Error('Exercise not found');

        // Load translation separately
        const { data: translationData } = await supabase
          .from('exercises_translations')
          .select('name, description')
          .eq('exercise_id', id)
          .eq('language_code', 'en')
          .maybeSingle();
        
        const translation = translationData;
        setExerciseName(translation?.name || exerciseData.display_name || '');
        
        // Map all fields from database to form
        form.setValue('display_name', translation?.name || exerciseData.display_name || '');
        form.setValue('slug', exerciseData.slug || '');
        form.setValue('custom_display_name', exerciseData.custom_display_name || '');
        form.setValue('is_public', exerciseData.is_public ?? true);
        form.setValue('owner_user_id', exerciseData.owner_user_id || '');
        form.setValue('popularity_rank', exerciseData.popularity_rank);
        form.setValue('loading_hint', translation?.description || exerciseData.loading_hint || '');
        
        form.setValue('body_part_id', exerciseData.body_part_id || '');
        form.setValue('movement_pattern_id', exerciseData.movement_pattern_id || '');
        form.setValue('movement_id', exerciseData.movement_id || '');
        form.setValue('primary_muscle_id', exerciseData.primary_muscle_id || '');
        form.setValue('secondary_muscle_group_ids', exerciseData.secondary_muscle_group_ids || []);
        form.setValue('tags', exerciseData.tags || []);
        
        form.setValue('equipment_id', exerciseData.equipment_id || '');
        form.setValue('equipment_ref_id', exerciseData.equipment_ref_id || '');
        form.setValue('effort_mode', exerciseData.effort_mode || 'reps');
        form.setValue('load_mode', exerciseData.load_mode || 'external_added');
        form.setValue('load_type', exerciseData.load_type);
        
        form.setValue('is_bar_loaded', exerciseData.is_bar_loaded || false);
        form.setValue('default_bar_type_id', exerciseData.default_bar_type_id || '');
        form.setValue('default_bar_weight', exerciseData.default_bar_weight);
        
        form.setValue('exercise_skill_level', exerciseData.exercise_skill_level || 'medium');
        form.setValue('complexity_score', exerciseData.complexity_score || 3);
        form.setValue('is_unilateral', exerciseData.is_unilateral || false);
        form.setValue('allows_grips', exerciseData.allows_grips || false);
        form.setValue('default_grip_ids', exerciseData.default_grip_ids || []);
        
        form.setValue('contraindications', JSON.stringify(exerciseData.contraindications || []));
        form.setValue('capability_schema', JSON.stringify(exerciseData.capability_schema || {}));
        form.setValue('attribute_values_json', JSON.stringify(exerciseData.attribute_values_json || {}));
        
        form.setValue('name_locale', exerciseData.name_locale || 'en');
        form.setValue('name_version', exerciseData.name_version || 1);
        
        form.setValue('image_url', exerciseData.image_url || '');
        form.setValue('thumbnail_url', exerciseData.thumbnail_url || '');
        form.setValue('source_url', exerciseData.source_url || '');
        
        form.setValue('configured', exerciseData.configured || false);
        
      } catch (e: any) {
        console.error('[ExerciseEdit] load error', e);
        toast({ title: 'Failed to load exercise', description: e?.message || 'Unknown error', variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    
    if (bodyParts.length > 0) { // Wait for taxonomy to load
      loadExercise();
    }
  }, [params.id, bodyParts.length, toast, form]);

  // Validation helpers
  const validateRequired = () => {
    const values = form.getValues();
    const errors = [];
    
    if (!values.display_name) errors.push('Display name is required');
    if (!values.slug) errors.push('Slug is required');
    if (!values.equipment_id) errors.push('Equipment is required');
    if (!values.effort_mode) errors.push('Effort mode is required');
    if (!values.load_mode) errors.push('Load mode is required');
    if (values.is_bar_loaded && !values.default_bar_weight) errors.push('Bar weight is required when bar is loaded');
    
    try {
      JSON.parse(values.attribute_values_json);
    } catch {
      errors.push('Attribute values must be valid JSON object');
    }
    
    return errors;
  };

  const validateReadyToPublish = () => {
    const errors = validateRequired();
    const values = form.getValues();
    
    if (!values.movement_pattern_id) errors.push('Movement pattern is recommended');
    if (!values.primary_muscle_id) errors.push('Primary muscle is recommended');
    
    return errors;
  };

  const onSubmit = async (values: FormValues) => {
    setSaving(true);
    
    try {
      const requiredErrors = validateRequired();
      if (requiredErrors.length > 0) {
        const errorMessage = requiredErrors.join(', ');
        setDebugInfo(prev => ({
          ...prev,
          lastError: { type: 'validation', errors: requiredErrors },
          validationErrors: requiredErrors
        }));
        toast({ 
          title: 'Validation Error', 
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      // Parse JSON fields
      let contraindications, capability_schema, attribute_values_json;
      try {
        contraindications = JSON.parse(values.contraindications || '[]');
        capability_schema = JSON.parse(values.capability_schema || '{}');
        attribute_values_json = JSON.parse(values.attribute_values_json || '{}');
      } catch (e) {
        setDebugInfo(prev => ({
          ...prev,
          lastError: { type: 'json_parse', error: e, values: { contraindications: values.contraindications, capability_schema: values.capability_schema, attribute_values_json: values.attribute_values_json } }
        }));
        toast({ 
          title: 'JSON Parse Error', 
          description: 'Invalid JSON in advanced fields',
          variant: "destructive"
        });
        return;
      }

      // Clean UUID fields (empty string to null)
      const cleanUUID = (val: string | undefined) => val === '' ? null : val;

      const exercisePayload = {
        slug: values.slug,
        display_name: values.display_name,
        custom_display_name: values.custom_display_name || null,
        is_public: values.is_public,
        owner_user_id: cleanUUID(values.owner_user_id),
        popularity_rank: values.popularity_rank,
        loading_hint: null, // This field is reserved for 'total'/'per_side' only - description goes to translations
        
        body_part_id: cleanUUID(values.body_part_id),
        movement_pattern_id: cleanUUID(values.movement_pattern_id),
        movement_id: cleanUUID(values.movement_id),
        primary_muscle_id: cleanUUID(values.primary_muscle_id),
        secondary_muscle_group_ids: values.secondary_muscle_group_ids || [],
        tags: values.tags || [],
        
        equipment_id: values.equipment_id,
        equipment_ref_id: cleanUUID(values.equipment_ref_id),
        effort_mode: values.effort_mode,
        load_mode: values.load_mode,
        load_type: values.load_type,
        
        is_bar_loaded: values.is_bar_loaded,
        default_bar_type_id: cleanUUID(values.default_bar_type_id),
        default_bar_weight: values.default_bar_weight,
        
        exercise_skill_level: values.exercise_skill_level,
        complexity_score: values.complexity_score,
        is_unilateral: values.is_unilateral,
        allows_grips: values.allows_grips,
        default_grip_ids: values.default_grip_ids || [],
        
        contraindications,
        capability_schema,
        attribute_values_json,
        
        name_locale: values.name_locale,
        name_version: values.name_version,
        
        image_url: values.image_url || null,
        thumbnail_url: values.thumbnail_url || null,
        source_url: values.source_url || null,
        
        configured: values.configured,
      };

      // Log the payload for debugging
      setDebugInfo(prev => ({
        ...prev,
        lastNetworkCall: { type: isEdit ? 'update' : 'insert', payload: exercisePayload, timestamp: new Date().toISOString() }
      }));

      console.log('Exercise payload:', exercisePayload);

      if (isEdit) {
        const updateQuery = supabase
          .from('exercises')
          .update(exercisePayload)
          .eq('id', params.id);
          
        console.log('Update query:', updateQuery);
        
        const { error, data } = await updateQuery;
        
        setDebugInfo(prev => ({
          ...prev,
          dbQueries: [...prev.dbQueries, { type: 'exercises_update', query: 'UPDATE exercises SET ... WHERE id = ?', params: { id: params.id, payload: exercisePayload }, result: { error, data }, timestamp: new Date().toISOString() }]
        }));
          
        if (error) {
          console.error('Update error:', error);
          setDebugInfo(prev => ({
            ...prev,
            lastError: { type: 'supabase_update', error, payload: exercisePayload }
          }));
          throw error;
        }

        // Update translation
        const translationPayload = {
          exercise_id: params.id,
          language_code: 'en',
          name: values.display_name,
          description: values.loading_hint || null,
        };
        
        const { error: translationError } = await supabase
          .from('exercises_translations')
          .upsert(translationPayload, {
            onConflict: 'exercise_id,language_code'
          });
          
        setDebugInfo(prev => ({
          ...prev,
          dbQueries: [...prev.dbQueries, { type: 'translation_upsert', payload: translationPayload, result: { error: translationError }, timestamp: new Date().toISOString() }]
        }));
          
        if (translationError) {
          console.warn('Translation update failed:', translationError);
          setDebugInfo(prev => ({
            ...prev,
            consoleErrors: [...prev.consoleErrors, { type: 'translation_warning', error: translationError, timestamp: new Date().toISOString() }]
          }));
        }

        toast({ title: 'Exercise updated successfully!' });
      } else {
        const insertQuery = supabase
          .from('exercises')
          .insert(exercisePayload)
          .select('id');
          
        console.log('Insert query:', insertQuery);
        
        const { data, error } = await insertQuery.single();
          
        setDebugInfo(prev => ({
          ...prev,
          dbQueries: [...prev.dbQueries, { type: 'exercises_insert', query: 'INSERT INTO exercises (...) VALUES (...)', payload: exercisePayload, result: { error, data }, timestamp: new Date().toISOString() }]
        }));
          
        if (error) {
          console.error('Insert error:', error);
          setDebugInfo(prev => ({
            ...prev,
            lastError: { type: 'supabase_insert', error, payload: exercisePayload }
          }));
          throw error;
        }

        // Create translation
        const translationPayload = {
          exercise_id: data.id,
          language_code: 'en',
          name: values.display_name,
          description: values.loading_hint || null,
        };
        
        const { error: translationError } = await supabase
          .from('exercises_translations')
          .insert(translationPayload);
          
        setDebugInfo(prev => ({
          ...prev,
          dbQueries: [...prev.dbQueries, { type: 'translation_insert', payload: translationPayload, result: { error: translationError }, timestamp: new Date().toISOString() }]
        }));
          
        if (translationError) {
          console.warn('Translation creation failed:', translationError);
          setDebugInfo(prev => ({
            ...prev,
            consoleErrors: [...prev.consoleErrors, { type: 'translation_warning', error: translationError, timestamp: new Date().toISOString() }]
          }));
        }

        toast({ title: 'Exercise created successfully!' });
      }
      
      navigate('/admin/exercises');
      
    } catch (e: any) {
      console.error('Save error:', e);
      setDebugInfo(prev => ({
        ...prev,
        lastError: { type: 'catch_block', error: e, timestamp: new Date().toISOString() },
        consoleErrors: [...prev.consoleErrors, { type: 'save_error', error: e, timestamp: new Date().toISOString() }]
      }));
      toast({ 
        title: 'Failed to save exercise', 
        description: e?.message || 'Unknown error',
        variant: "destructive"
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

  const requiredErrors = validateRequired();
  const publishErrors = validateReadyToPublish();

  // Update debug info with form errors
  React.useEffect(() => {
    setDebugInfo(prev => ({
      ...prev,
      formErrors: form.formState.errors,
      validationErrors: [...requiredErrors, ...publishErrors]
    }));
  }, [form.formState.errors, requiredErrors, publishErrors]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Exercise' : 'Add Exercise'}</h1>
          <Button variant="secondary" asChild>
            <Link to="/admin/exercises">Back to Exercise Management</Link>
          </Button>
        </div>
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Exercise' : 'Add Exercise'}</h1>
        <Button variant="secondary" asChild>
          <Link to="/admin/exercises">Back to Exercise Management</Link>
        </Button>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section A - Basics */}
        <Card>
          <CardHeader>
            <CardTitle>Section A — Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_name">Display Name (English, canonical) *</Label>
                <Input 
                  id="display_name" 
                  {...form.register('display_name')} 
                  placeholder="e.g., Barbell Bench Press" 
                />
                {form.formState.errors.display_name && (
                  <p className="text-sm text-destructive">{form.formState.errors.display_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input 
                  id="slug" 
                  {...form.register('slug')} 
                  placeholder="barbell-bench-press" 
                />
                {form.formState.errors.slug && (
                  <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="advanced-basics">
                <AccordionTrigger>Advanced</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom_display_name">Custom Display Name</Label>
                    <Input 
                      id="custom_display_name" 
                      {...form.register('custom_display_name')} 
                      placeholder="Override shown name globally (not for translations)" 
                    />
                    <p className="text-xs text-muted-foreground">
                      Use only to override the shown name globally; not for translations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="owner_user_id">Owner User ID</Label>
                      <Input 
                        id="owner_user_id" 
                        {...form.register('owner_user_id')} 
                        placeholder="UUID (optional)" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="popularity_rank">Popularity Rank</Label>
                      <Input 
                        id="popularity_rank" 
                        type="number"
                        {...form.register('popularity_rank', { valueAsNumber: true })} 
                        placeholder="1-100" 
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-2">
              <Label htmlFor="loading_hint">Description / Loading Hint</Label>
              <Textarea 
                id="loading_hint" 
                {...form.register('loading_hint')} 
                placeholder="Brief instructions, loading cues, etc." 
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch 
                id="is_public"
                checked={form.watch('is_public')} 
                onCheckedChange={(v) => form.setValue('is_public', v)} 
              />
              <Label htmlFor="is_public">Make Public (visible to everyone)</Label>
            </div>
          </CardContent>
        </Card>

        {/* Section B - Classification */}
        <Card>
          <CardHeader>
            <CardTitle>Section B — Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Body Part</Label>
                <Select 
                  onValueChange={(v) => {
                    form.setValue('body_part_id', v);
                    form.setValue('primary_muscle_id', ''); // Reset dependent fields
                  }} 
                  value={form.watch('body_part_id') || ''}
                >
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
                <Label>Primary Muscle</Label>
                <Select 
                  onValueChange={(v) => form.setValue('primary_muscle_id', v)} 
                  value={form.watch('primary_muscle_id') || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary muscle" />
                  </SelectTrigger>
                  <SelectContent>
                    {muscles.map((mu) => (
                      <SelectItem key={mu.id} value={mu.id}>{mu.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Movement Pattern</Label>
                <Select 
                  onValueChange={(v) => {
                    form.setValue('movement_pattern_id', v);
                    form.setValue('movement_id', ''); // Reset dependent field
                  }} 
                  value={form.watch('movement_pattern_id') || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select movement pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    {movementPatterns.map((mp) => (
                      <SelectItem key={mp.id} value={mp.id}>{mp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Movement</Label>
                <Select 
                  onValueChange={(v) => form.setValue('movement_id', v)} 
                  value={form.watch('movement_id') || ''}
                  disabled={!selectedMovementPatternId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedMovementPatternId ? "Select movement" : "Select pattern first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMovements.map((mv) => (
                      <SelectItem key={mv.id} value={mv.id}>{mv.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
          </CardContent>
        </Card>

        {/* Section C - Equipment & Load */}
        <Card>
          <CardHeader>
            <CardTitle>Section C — Equipment & Load</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Equipment *</Label>
                <Select 
                  onValueChange={(v) => form.setValue('equipment_id', v)} 
                  value={form.watch('equipment_id') || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.equipment_id && (
                  <p className="text-sm text-destructive">{form.formState.errors.equipment_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment_ref_id">Equipment Ref ID</Label>
                <Input 
                  id="equipment_ref_id" 
                  {...form.register('equipment_ref_id')} 
                  placeholder="Secondary equipment reference (optional)" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Effort Mode *</Label>
                <Select 
                  onValueChange={(v) => form.setValue('effort_mode', v as any)} 
                  value={form.watch('effort_mode')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select effort mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reps">Reps</SelectItem>
                    <SelectItem value="time">Time</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="calories">Calories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Load Mode *</Label>
                <Select 
                  onValueChange={(v) => form.setValue('load_mode', v as any)} 
                  value={form.watch('load_mode')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select load mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bodyweight_plus_optional">Bodyweight + Optional</SelectItem>
                    <SelectItem value="external_added">External Added</SelectItem>
                    <SelectItem value="external_assist">External Assist</SelectItem>
                    <SelectItem value="machine_level">Machine Level</SelectItem>
                    <SelectItem value="band_level">Band Level</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_unilateral"
                  checked={form.watch('is_unilateral')} 
                  onCheckedChange={(v) => form.setValue('is_unilateral', v)} 
                />
                <Label htmlFor="is_unilateral">Unilateral Exercise</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  id="allows_grips"
                  checked={form.watch('allows_grips')} 
                  onCheckedChange={(v) => form.setValue('allows_grips', v)} 
                />
                <Label htmlFor="allows_grips">Allows Grips</Label>
              </div>

              <div className="space-y-2">
                <Label>Load Type</Label>
                <Select 
                  onValueChange={(v) => form.setValue('load_type', v === 'none' ? undefined : v as any)} 
                  value={form.watch('load_type') || 'none'}
                >
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

            {/* Conditional barbell section */}
            {isBarLoaded && (
              <Card className="bg-muted">
                <CardHeader>
                  <CardTitle className="text-sm">Barbell Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="is_bar_loaded"
                      checked={form.watch('is_bar_loaded')} 
                      onCheckedChange={(v) => form.setValue('is_bar_loaded', v)} 
                    />
                    <Label htmlFor="is_bar_loaded">Bar Loaded Exercise</Label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Bar Type</Label>
                      <Select 
                        onValueChange={(v) => form.setValue('default_bar_type_id', v)} 
                        value={form.watch('default_bar_type_id') || ''}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select bar type" />
                        </SelectTrigger>
                        <SelectContent>
                          {barTypes.map((bt) => (
                            <SelectItem key={bt.id} value={bt.id}>{bt.name} ({bt.default_weight}kg)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default_bar_weight">Default Bar Weight (kg) *</Label>
                      <Input 
                        id="default_bar_weight" 
                        type="number"
                        step="0.1"
                        {...form.register('default_bar_weight', { valueAsNumber: true })} 
                        placeholder="20.0" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isBarLoaded && (
              <div className="flex items-center space-x-2">
                <Switch 
                  id="is_bar_loaded"
                  checked={form.watch('is_bar_loaded')} 
                  onCheckedChange={(v) => form.setValue('is_bar_loaded', v)} 
                />
                <Label htmlFor="is_bar_loaded">Bar Loaded Exercise</Label>
              </div>
            )}

            {/* Default grips (conditional) */}
            {allowsGrips && (
              <div className="space-y-2">
                <Label>Default Grips</Label>
                <div className="text-xs text-muted-foreground mb-2">
                  Multi-select grip implementation would go here
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section D - Capability & Difficulty */}
        <Card>
          <CardHeader>
            <CardTitle>Section D — Difficulty & Safety</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Skill Level</Label>
                <Select 
                  onValueChange={(v) => form.setValue('exercise_skill_level', v as any)} 
                  value={form.watch('exercise_skill_level')}
                >
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="contraindications">Contraindications (JSON array)</Label>
              <Textarea 
                id="contraindications" 
                {...form.register('contraindications')} 
                placeholder='["lower back injury", "shoulder impingement"]'
                rows={3}
              />
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="advanced-safety">
                <AccordionTrigger>Advanced</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="capability_schema">Capability Schema (JSON object)</Label>
                    <Textarea 
                      id="capability_schema" 
                      {...form.register('capability_schema')} 
                      placeholder='{"supports_cables": true, "max_weight": 200}'
                      rows={3}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Section E - Media */}
        <Card>
          <CardHeader>
            <CardTitle>Section E — Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input 
                  id="image_url" 
                  {...form.register('image_url')} 
                  placeholder="https://example.com/image.jpg" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input 
                  id="thumbnail_url" 
                  {...form.register('thumbnail_url')} 
                  placeholder="https://example.com/thumb.jpg" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source_url">Source URL</Label>
                <Input 
                  id="source_url" 
                  {...form.register('source_url')} 
                  placeholder="https://example.com" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section F - System / Advanced */}
        <Card>
          <CardHeader>
            <CardTitle>Section F — System / Advanced</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="attribute_values_json">Attribute Values JSON (required) *</Label>
              <Textarea 
                id="attribute_values_json" 
                {...form.register('attribute_values_json')} 
                placeholder='{"custom_field": "value"}'
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Must be a valid JSON object</p>
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value="localization">
                <AccordionTrigger>Localization</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name_locale">Name Locale</Label>
                      <Input 
                        id="name_locale" 
                        {...form.register('name_locale')} 
                        placeholder="en" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name_version">Name Version</Label>
                      <Input 
                        id="name_version" 
                        type="number"
                        {...form.register('name_version', { valueAsNumber: true })} 
                        placeholder="1" 
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex items-center space-x-2">
              <Switch 
                id="configured"
                checked={form.watch('configured')} 
                onCheckedChange={(v) => form.setValue('configured', v)} 
                disabled={publishErrors.length > 0}
              />
              <Label htmlFor="configured">Configured (ready to publish)</Label>
              {publishErrors.length > 0 && (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Summary */}
        {(requiredErrors.length > 0 || publishErrors.length > 0) && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Validation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requiredErrors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Required Fields (will block save):</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
                    {requiredErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {publishErrors.length > requiredErrors.length && (
                <div>
                  <h4 className="font-medium text-amber-800 mb-2">Recommended for Publishing:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-amber-700">
                    {publishErrors.slice(requiredErrors.length).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <Button type="button" variant="secondary" asChild>
            <Link to="/admin/exercises">Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving || requiredErrors.length > 0}>
            {saving ? 'Saving…' : (isEdit ? 'Update Exercise' : 'Create Exercise')}
          </Button>
        </div>

        {/* Debug Panel */}
        <Card className="border-border bg-card text-card-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Debug Information
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={() => setShowDebug(!showDebug)}
                className="ml-auto"
              >
                {showDebug ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
          </CardHeader>
          {showDebug && (
            <CardContent className="space-y-4">
              {/* Form State */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Form State
                </h4>
                <div className="text-xs bg-muted text-muted-foreground p-3 rounded border overflow-auto max-h-32">
                  <strong>Is Valid:</strong> {form.formState.isValid ? 'Yes' : 'No'}<br/>
                  <strong>Is Dirty:</strong> {form.formState.isDirty ? 'Yes' : 'No'}<br/>
                  <strong>Is Submitting:</strong> {form.formState.isSubmitting ? 'Yes' : 'No'}<br/>
                  <strong>Submit Count:</strong> {form.formState.submitCount}<br/>
                  <strong>Form Errors:</strong> {Object.keys(debugInfo.formErrors).length > 0 ? JSON.stringify(debugInfo.formErrors, null, 2) : 'None'}<br/>
                  <strong>Current Values:</strong> <pre>{JSON.stringify(form.getValues(), null, 2)}</pre>
                </div>
              </div>

              {/* Validation Errors */}
              {debugInfo.validationErrors.length > 0 && (
                <div>
                  <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Validation Errors
                  </h4>
                  <div className="text-xs bg-destructive/10 text-destructive p-3 rounded border">
                    <ul className="list-disc pl-4">
                      {debugInfo.validationErrors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Last Error */}
              {debugInfo.lastError && (
                <div>
                  <h4 className="font-medium text-destructive mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Last Error ({debugInfo.lastError.type})
                  </h4>
                  <div className="text-xs bg-destructive/10 text-destructive p-3 rounded border overflow-auto max-h-32">
                    <pre>{JSON.stringify(debugInfo.lastError, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Database Queries */}
              {debugInfo.dbQueries.length > 0 && (
                <div>
                  <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Database Queries ({debugInfo.dbQueries.length})
                  </h4>
                  <div className="text-xs bg-primary/10 text-primary p-3 rounded border overflow-auto max-h-40 space-y-2">
                    {debugInfo.dbQueries.slice(-3).map((query, i) => (
                      <div key={i} className="border-b border-primary/20 pb-2">
                        <strong>{query.type}</strong> at {query.timestamp}<br/>
                        <pre className="text-xs text-muted-foreground">{JSON.stringify(query, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Network Calls */}
              {debugInfo.lastNetworkCall && (
                <div>
                  <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    Last Network Call
                  </h4>
                  <div className="text-xs bg-green-50 text-green-800 p-3 rounded border overflow-auto max-h-32">
                    <pre>{JSON.stringify(debugInfo.lastNetworkCall, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Console Errors */}
              {debugInfo.consoleErrors.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-600 mb-2">Console Errors ({debugInfo.consoleErrors.length})</h4>
                  <div className="text-xs bg-orange-50 text-orange-800 p-3 rounded border overflow-auto max-h-32 space-y-1">
                    {debugInfo.consoleErrors.slice(-5).map((err, i) => (
                      <div key={i}>
                        <strong>{err.type}</strong> at {err.timestamp}: {err.error?.message || JSON.stringify(err.error)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Debug Info */}
              <Button 
                type="button"
                variant="outline" 
                size="sm"
                onClick={() => setDebugInfo({
                  lastError: null,
                  lastNetworkCall: null,
                  formErrors: {},
                  validationErrors: [],
                  dbQueries: [],
                  consoleErrors: []
                })}
              >
                Clear Debug Info
              </Button>
            </CardContent>
          )}
        </Card>
      </form>
    </div>
  );
};

export default AdminExerciseEdit;