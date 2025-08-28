import React, { useState, useEffect, useMemo } from "react";
import PageNav from "@/components/PageNav";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SecondaryMuscleGroupSelector from "@/components/SecondaryMuscleGroupSelector";
import { Switch } from "@/components/ui/switch";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ExerciseImageUploader from "@/components/ExerciseImageUploader";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNamingTemplates, buildExerciseName } from "@/hooks/useNamingTemplates";

// Basic SEO
const useSEO = () => {
  React.useEffect(() => {
    document.title = "Add Exercise | I Track I Win";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Create a new exercise with muscles, equipment and images.');
    document.head.appendChild(desc);

    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', `${window.location.origin}/fitness/exercises/add`);
    document.head.appendChild(link);
  }, []);
};

// Types for taxonomy
interface BodyPart { id: string; name: string }
interface MuscleGroup { id: string; name: string; body_part_id: string }
interface Muscle { id: string; name: string; muscle_group_id: string }
interface Equipment { id: string; name: string }

const schema = z.object({
  custom_display_name: z.string().optional(),
  description: z.string().optional(),
  body_part_id: z.string().uuid().optional().or(z.literal('')),
  primary_muscle_group_id: z.string().uuid().optional().or(z.literal('')),
  primary_muscle_id: z.string().uuid().optional().or(z.literal('')),
  secondary_muscle_group_ids: z.array(z.string().uuid()).optional(),
  equipment_id: z.string().uuid().optional().or(z.literal('')),
  source_url: z.string().url().optional().or(z.literal('')),
  is_public: z.boolean().default(true),
  use_custom_name: z.boolean().default(false),
});

type FormValues = z.infer<typeof schema>;

const ExerciseAdd: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('basics');
  const location = useLocation();
  const isAdminContext = location.pathname.startsWith('/admin');
  useSEO();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [lastError, setLastError] = React.useState<string | null>(null);

  const [bodyParts, setBodyParts] = React.useState<BodyPart[]>([]);
  const [muscleGroups, setMuscleGroups] = React.useState<MuscleGroup[]>([]);
  const [muscles, setMuscles] = React.useState<Muscle[]>([]);
  const [equipment, setEquipment] = React.useState<Equipment[]>([]);

  const [files, setFiles] = React.useState<File[]>([]);
  
  // Fetch naming templates
  const { data: namingTemplates } = useNamingTemplates();

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: {
    custom_display_name: "",
    description: "",
    body_part_id: "",
    primary_muscle_group_id: "",
    primary_muscle_id: "",
    secondary_muscle_group_ids: [],
    equipment_id: "",
    source_url: "",
    is_public: true,
    use_custom_name: false,
  },
});

  const selectedBodyPartId = form.watch("body_part_id") || "";

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[ExerciseAdd] Auth check error:', error);
          navigate('/auth');
          return;
        }
        if (!session?.user) {
          console.error('[ExerciseAdd] No authenticated user');
          navigate('/auth');
          return;
        }
        console.log('[ExerciseAdd] User authenticated:', session.user.id);
        setUser(session.user);
      } catch (err) {
        console.error('[ExerciseAdd] Auth check failed:', err);
        navigate('/auth');
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [navigate]);

  React.useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [bp, mg, m, eq] = await Promise.all([
          supabase.from("v_body_parts_with_translations").select("id, slug, translations"),
          supabase.from("v_muscle_groups_with_translations").select("id, slug, body_part_id, translations"),
          supabase.from("v_muscles_with_translations").select("id, slug, muscle_group_id, translations"),
          supabase.from("v_equipment_with_translations").select("id, slug, translations"),
        ]);
        if (bp.error) throw bp.error; if (mg.error) throw mg.error; if (m.error) throw m.error; if (eq.error) throw eq.error;
        setBodyParts(bp.data?.map(item => ({ 
          id: item.id, 
          slug: item.slug, 
          name: (item.translations as any)?.en?.name || item.slug || 'Unknown' 
        })) || []);
        setMuscleGroups(mg.data?.map(item => ({ 
          id: item.id, 
          slug: item.slug, 
          body_part_id: item.body_part_id, 
          name: (item.translations as any)?.en?.name || item.slug || 'Unknown' 
        })) || []);
        setMuscles(m.data?.map(item => ({ 
          id: item.id, 
          slug: item.slug, 
          muscle_group_id: item.muscle_group_id, 
          name: (item.translations as any)?.en?.name || item.slug || 'Unknown' 
        })) || []);
        setEquipment(eq.data?.map(item => ({ 
          id: item.id, 
          name: (item.translations as any)?.en?.name || item.slug || 'Unknown' 
        })) || []);
      } catch (e: any) {
        console.error("[ExerciseAdd] load error", e);
        setLastError(e?.message || String(e));
        toast({ title: "Failed to load options", description: e?.message || "Unknown error" });
      } finally {
        setLoading(false);
      }
    };
    
    // Only load data if user is authenticated
    if (user && !isAuthChecking) {
      loadAll();
    }
  }, [toast, user, isAuthChecking]);

const filteredMuscleGroups = React.useMemo(() => {
  if (!selectedBodyPartId) return muscleGroups;
  return muscleGroups.filter((g) => g.body_part_id === selectedBodyPartId);
}, [muscleGroups, selectedBodyPartId]);

const selectedGroupId = form.watch('primary_muscle_group_id') || '';

const primaryMusclesOptions = React.useMemo(() => {
  if (!selectedGroupId) return [] as Muscle[];
  return muscles.filter((mu) => mu.muscle_group_id === selectedGroupId);
}, [muscles, selectedGroupId]);

// Watch form values for live preview
const primaryMuscleId = form.watch('primary_muscle_id');
const equipmentId = form.watch('equipment_id');

// Live preview of auto-generated name
const previewName = useMemo(() => {
  if (!primaryMuscleId && !equipmentId) return '';
  
  // Find names for the selected items
  const primaryMuscleName = muscles.find(m => m.id === primaryMuscleId)?.name || '';
  const equipmentName = equipment.find(e => e.id === equipmentId)?.name || '';
  
  // Get the appropriate template (fallback to default)
  const template = namingTemplates?.[0]?.template || '{PrimaryMuscle} – {Equipment} {Movement}';
  
  return buildExerciseName({
    template,
    primaryMuscle: primaryMuscleName,
    movement: '', // No movement selection in current form
    equipment: equipmentName,
    attrs: {},
    handle: '',
    grip: '',
    separator: namingTemplates?.[0]?.sep || ' – '
  });
}, [primaryMuscleId, equipmentId, muscles, equipment, namingTemplates]);

  const onSubmit = async (values: FormValues) => {
    console.log('[ExerciseAdd] Form submission started');
    console.log('[ExerciseAdd] Current user state:', user);
    
    // Name validation only if using custom name
    if (values.use_custom_name && !values.custom_display_name?.trim()) {
      toast({ title: 'Custom name is required when enabled' });
      return;
    }
    
    setSaving(true);
    setLastError(null);
    
    try {
      // Double-check authentication with fresh session
      const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
      console.log('[ExerciseAdd] Fresh session check:', session);
      console.log('[ExerciseAdd] Session error:', sessionErr);
      
      if (sessionErr) {
        console.error('[ExerciseAdd] Session error:', sessionErr);
        throw new Error('Authentication error: ' + sessionErr.message);
      }
      
      if (!session?.user?.id) {
        console.error('[ExerciseAdd] No valid user in session');
        toast({ title: 'Authentication Error', description: 'Please log in to create exercises' });
        navigate('/auth');
        return;
      }

      const userId = session.user.id;
      console.log('[ExerciseAdd] Using user ID:', userId);

      const payload = {
        custom_display_name: values.use_custom_name ? values.custom_display_name?.trim() || null : null,
        body_part_id: values.body_part_id || null,
        primary_muscle_id: values.primary_muscle_id || null,
        secondary_muscle_group_ids: values.secondary_muscle_group_ids && values.secondary_muscle_group_ids.length > 0 ? values.secondary_muscle_group_ids : null,
        equipment_id: values.equipment_id || null,
        source_url: values.source_url || null,
        is_public: values.is_public,
        owner_user_id: userId,
        slug: (values.use_custom_name ? values.custom_display_name?.trim() : 'exercise') + '-' + Math.random().toString(36).substring(2, 8),
      };

      console.log('[ExerciseAdd] FINAL PAYLOAD BEING SENT:', JSON.stringify(payload, null, 2));
      
      const { data: inserted, error } = await supabase
        .from('exercises')
        .insert(payload)
        .select('id')
        .single();
      if (error) {
        console.error('[ExerciseAdd] Insert error:', error);
        throw error;
      }
      const exerciseId = inserted?.id;
      if (!exerciseId) throw new Error('Failed to get new exercise id');

      // Insert translations for name and description
      const exerciseName = values.use_custom_name ? values.custom_display_name?.trim() : previewName;
      if (exerciseName || values.description) {
        const { error: translationError } = await supabase
          .from('exercises_translations')
          .insert({
            exercise_id: exerciseId,
            language_code: 'en', // Default to English, could be made dynamic based on user locale
            name: exerciseName || 'Untitled Exercise',
            description: values.description || null
          });
        
        if (translationError) {
          console.error('[ExerciseAdd] Translation insert error:', translationError);
          // Don't throw here - exercise was created successfully, just warn about translation
          toast({ title: 'Warning', description: 'Exercise created but translation failed to save' });
        }
      }

      // Upload images if any
      if (files.length > 0) {
        const uploads = await Promise.all(files.map(async (file, idx) => {
          const path = `${userId}/${exerciseId}/${Date.now()}-${idx}-${file.name}`;
          const { error: upErr } = await supabase.storage.from('exercise-images').upload(path, file, { upsert: false });
          if (upErr) throw upErr;
          const { data: pub } = supabase.storage.from('exercise-images').getPublicUrl(path);
          const publicUrl = pub.publicUrl;
          const { error: insErr } = await supabase.from('exercise_images').insert({
            user_id: userId,
            exercise_id: exerciseId,
            path,
            url: publicUrl,
            order_index: idx + 1,
            is_primary: idx === 0,
          });
          if (insErr) throw insErr;
          return publicUrl;
        }));

        // Set thumbnail_url to first image
        if (uploads[0]) {
          const { error: updErr } = await supabase
            .from('exercises')
            .update({ thumbnail_url: uploads[0], image_url: uploads[0] })
            .eq('id', exerciseId);
          if (updErr) throw updErr;
        }
      }

      toast({ title: 'Exercise added' });
      if (isAdminContext) {
        navigate('/admin/exercises');
      } else {
        navigate('/fitness/exercises');
      }
    } catch (e: any) {
      console.error('[ExerciseAdd] create error', e);
      setLastError(e?.message || String(e));
      toast({ title: 'Failed to add', description: e?.message || 'Unknown error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageNav current={isAdminContext ? "Admin / Add Exercise" : "Fitness"} />
      {!isAdminContext && (
        <nav className="container pt-4" aria-label="Fitness navigation">
          <NavigationMenu>
            <NavigationMenuList className="grid grid-cols-2 gap-1 w-full">
              <NavigationMenuItem>
                <NavLink to="/fitness" end className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''} w-full justify-center`}>
                  Workouts
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/fitness/exercises" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''} w-full justify-center`}>
                  Exercises
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/fitness/templates" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''} w-full justify-center`}>
                  Templates
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/fitness/configure" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''} w-full justify-center`}>
                  Configure
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>
      )}

      <main className="container py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-semibold">Add Exercise</h1>
          <Button variant="secondary" asChild className="w-full sm:w-auto">
            <Link to={isAdminContext ? "/admin/exercises" : "/fitness/exercises"}>
              Back to Exercises
            </Link>
          </Button>
        </div>


        {isAuthChecking ? (
          <p className="text-muted-foreground">Checking authentication...</p>
        ) : loading ? (
          <p className="text-muted-foreground">Loading options…</p>
        ) : (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="border-b border-border">
              <nav className="flex space-x-8" aria-label="Exercise configuration tabs">
                {[
                  { id: 'basics', label: 'Basics' },
                  { id: 'equipment', label: 'Equipment' },
                  { id: 'handles-grips', label: 'Handles & Grips' },
                  { id: 'attributes', label: 'Attributes' },
                  { id: 'advanced', label: 'Advanced' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basics Tab */}
              {activeTab === 'basics' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                  <section className="lg:col-span-2 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Exercise Name</Label>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={form.watch('use_custom_name')}
                            onCheckedChange={(checked) => form.setValue('use_custom_name', checked)}
                          />
                          <span className="text-sm text-muted-foreground">Use custom name</span>
                        </div>
                      </div>
                      
                      {form.watch('use_custom_name') ? (
                        <div className="space-y-2">
                          <Input
                            {...form.register('custom_display_name')}
                            placeholder="e.g., Barbell Bench Press"
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-muted rounded-md">
                          {previewName ? (
                            <div>
                              <p className="text-sm font-medium text-foreground">{previewName}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Auto-generated from name
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Auto-generated from name
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input 
                        id="slug" 
                        value="Auto-generated from name" 
                        disabled 
                        className="bg-muted text-muted-foreground" 
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        rows={4} 
                        {...form.register('description')} 
                        placeholder="Exercise description and cues" 
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Body Part *</Label>
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
                        <Label>Muscle Group *</Label>
                        <Select onValueChange={(v) => { form.setValue('primary_muscle_group_id', v); form.setValue('primary_muscle_id', ''); }} value={form.watch('primary_muscle_group_id') || ''}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select muscle group" />
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

                    <SecondaryMuscleGroupSelector
                      bodyParts={bodyParts}
                      muscleGroups={muscleGroups}
                      selectedMuscleGroupIds={form.watch('secondary_muscle_group_ids') || []}
                      excludedMuscleGroupId={form.watch('primary_muscle_group_id') || ''}
                      onChange={(ids) => form.setValue('secondary_muscle_group_ids', ids)}
                    />

                    <div className="space-y-2">
                      <Label htmlFor="source_url">Source URL (optional)</Label>
                      <Input id="source_url" {...form.register('source_url')} placeholder="https://example.com" />
                    </div>
                  </section>

                  <aside className="space-y-4">
                    <div className="space-y-2">
                      <Label>Images</Label>
                      <ExerciseImageUploader files={files} onChange={setFiles} />
                      <p className="text-xs text-muted-foreground">JPG, PNG. You can select multiple.</p>
                      <p className="text-xs text-muted-foreground">Upload images for this exercise (first becomes thumbnail).</p>
                    </div>
                  </aside>
                </div>
              )}

              {/* Equipment Tab */}
              {activeTab === 'equipment' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Equipment *</Label>
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
                  
                  <div className="rounded-lg border border-border p-4 space-y-4">
                    <h3 className="font-medium">Load Configuration</h3>
                    <p className="text-sm text-muted-foreground">Configure how weight is loaded for this exercise.</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="barLoaded" className="rounded" />
                        <Label htmlFor="barLoaded">Bar loaded exercise</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="unilateral" className="rounded" />
                        <Label htmlFor="unilateral">Unilateral (single side)</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="requiresHandle" className="rounded" />
                        <Label htmlFor="requiresHandle">Requires handle</Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Handles & Grips Tab */}
              {activeTab === 'handles-grips' && (
                <div className="space-y-6">
                  <div className="rounded-lg border border-border p-4 space-y-4">
                    <h3 className="font-medium">Handle Configuration</h3>
                    <p className="text-sm text-muted-foreground">Configure available handles for this exercise.</p>
                    <p className="text-sm text-muted-foreground">Handles will be populated here based on equipment selection.</p>
                  </div>

                  <div className="rounded-lg border border-border p-4 space-y-4">
                    <h3 className="font-medium">Grip Configuration</h3>
                    <p className="text-sm text-muted-foreground">Configure available grips for this exercise.</p>
                    <p className="text-sm text-muted-foreground">Grips will be populated here based on equipment and handle selection.</p>
                  </div>
                </div>
              )}

              {/* Attributes Tab */}
              {activeTab === 'attributes' && (
                <div className="space-y-6">
                  <div className="rounded-lg border border-border p-4 space-y-4">
                    <h3 className="font-medium">Exercise Attributes</h3>
                    <p className="text-sm text-muted-foreground">Configure exercise-specific attributes and settings.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Skill Level</Label>
                        <Select defaultValue="medium">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Movement Pattern</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="push">Push</SelectItem>
                            <SelectItem value="pull">Pull</SelectItem>
                            <SelectItem value="squat">Squat</SelectItem>
                            <SelectItem value="hinge">Hinge</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div className="rounded-lg border border-border p-4 space-y-4">
                    <h3 className="font-medium">Advanced Configuration</h3>
                    <p className="text-sm text-muted-foreground">Advanced settings and constraints for this exercise.</p>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Make Public</Label>
                        <div className="flex items-center gap-3">
                          <Switch checked={form.watch('is_public')} onCheckedChange={(v) => form.setValue('is_public', v)} />
                          <span className="text-sm text-muted-foreground">Visible to everyone</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Complexity Score</Label>
                        <Select defaultValue="3">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 - Very Simple</SelectItem>
                            <SelectItem value="2">2 - Simple</SelectItem>
                            <SelectItem value="3">3 - Medium</SelectItem>
                            <SelectItem value="4">4 - Complex</SelectItem>
                            <SelectItem value="5">5 - Very Complex</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-6 border-t border-border">
                <Button type="button" variant="secondary" asChild>
                  <Link to={isAdminContext ? "/admin/exercises" : "/fitness/exercises"}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add Exercise'}</Button>
              </div>

              {lastError && (
                <p role="alert" className="text-destructive text-sm">{lastError}</p>
              )}
            </form>
          </div>
        )}
      </main>
    </>
  );
};

export default ExerciseAdd;