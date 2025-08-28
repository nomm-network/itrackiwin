import React, { useState, useEffect } from "react";
import PageNav from "@/components/PageNav";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SecondaryMuscleGroupSelector from "@/components/SecondaryMuscleGroupSelector";
import { Switch } from "@/components/ui/switch";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ExerciseImageUploader from "@/components/ExerciseImageUploader";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
        description: values.description || null,
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
      navigate('/fitness/exercises');
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
      <PageNav current="Fitness" />
      <nav className="container pt-4" aria-label="Fitness navigation">
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

      <main className="container py-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-semibold">Add Exercise</h1>
          <Button variant="secondary" asChild className="w-full sm:w-auto">
            <Link to="/fitness/exercises">Back to Exercises</Link>
          </Button>
        </div>

        {/* DEBUG INFO */}
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded">
          <h3 className="font-bold text-yellow-800">DEBUG INFO:</h3>
          <p className="text-sm text-yellow-700">User: {user ? user.id : 'NULL'}</p>
          <p className="text-sm text-yellow-700">Email: {user?.email || 'NULL'}</p>
          <p className="text-sm text-yellow-700">Auth Checking: {isAuthChecking ? 'YES' : 'NO'}</p>
          <p className="text-sm text-yellow-700">Loading: {loading ? 'YES' : 'NO'}</p>
        </div>

        {isAuthChecking ? (
          <p className="text-muted-foreground">Checking authentication...</p>
        ) : loading ? (
          <p className="text-muted-foreground">Loading options…</p>
        ) : (
          <form className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8" onSubmit={form.handleSubmit(onSubmit)}>
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
                      placeholder="Enter custom exercise name"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Exercise name will be automatically generated based on your selections
                    </p>
                  </div>
                )}
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

              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label>Make Public</Label>
                  <div className="flex items-center gap-3">
                    <Switch checked={form.watch('is_public')} onCheckedChange={(v) => form.setValue('is_public', v)} />
                    <span className="text-sm text-muted-foreground">Visible to everyone</span>
                  </div>
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
                <p className="text-xs text-muted-foreground">Upload images for this exercise (first becomes thumbnail).</p>
              </div>

              <div className="flex gap-2 pt-2 pb-20">
                <Button type="button" variant="secondary" asChild>
                  <Link to="/fitness/exercises">Cancel</Link>
                </Button>
                <Button type="submit" disabled={saving}>{saving ? 'Adding…' : 'Add Exercise'}</Button>
              </div>

              {lastError && (
                <p role="alert" className="text-destructive text-sm">{lastError}</p>
              )}
            </aside>
          </form>
        )}
      </main>
    </>
  );
};

export default ExerciseAdd;