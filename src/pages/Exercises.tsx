import React from "react";
import PageNav from "@/components/PageNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { NavLink } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
const useSEO = () => {
  React.useEffect(() => {
    document.title = "Exercises | I Track I Win";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Create custom exercises and upload images in I Track I Win.');
    document.head.appendChild(desc);

    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', `${window.location.origin}/fitness/exercises`);
    document.head.appendChild(link);
  }, []);
};

const Exercises: React.FC = () => {
  useSEO();
  const { toast } = useToast();

  const [name, setName] = React.useState("");
  const [primaryMuscle, setPrimaryMuscle] = React.useState("");
  const [bodyPart, setBodyPart] = React.useState("");
  const [equipment, setEquipment] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [sourceUrl, setSourceUrl] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(true);
  const [files, setFiles] = React.useState<File[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [secondaryMuscles, setSecondaryMuscles] = React.useState("");

  const [filterName, setFilterName] = React.useState("");
  const [filterBodyPart, setFilterBodyPart] = React.useState("");
  const [filterPrimary, setFilterPrimary] = React.useState("");
  const [exercises, setExercises] = React.useState<any[]>([]);
  const [loadingExercises, setLoadingExercises] = React.useState(false);

  const [matches, setMatches] = React.useState<any[]>([]);
  const [showMatchDialog, setShowMatchDialog] = React.useState(false);

  // Authenticated user id to control edit permissions
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editSaving, setEditSaving] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editPrimaryMuscle, setEditPrimaryMuscle] = React.useState("");
  const [editSecondaryMuscles, setEditSecondaryMuscles] = React.useState("");
  const [editBodyPart, setEditBodyPart] = React.useState("");
  const [editEquipment, setEditEquipment] = React.useState("");
  const [editDescription, setEditDescription] = React.useState("");
  const [editSourceUrl, setEditSourceUrl] = React.useState("");
  const [editIsPublic, setEditIsPublic] = React.useState(true);
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files ?? []);
    setFiles(f);
  };

  const fetchExercises = async () => {
    setLoadingExercises(true);
    try {
      let query: any = supabase
        .from('exercises')
        .select('id,name,body_part,primary_muscle,secondary_muscles,equipment,description,source_url,thumbnail_url,image_url,is_public,owner_user_id')
        .order('name', { ascending: true });
      if (filterName.trim()) query = query.ilike('name', `%${filterName.trim()}%`);
      if (filterBodyPart.trim()) query = query.ilike('body_part', `%${filterBodyPart.trim()}%`);
      if (filterPrimary.trim()) query = query.ilike('primary_muscle', `%${filterPrimary.trim()}%`);
      const { data, error } = await query.limit(200);
      if (error) throw error;
      setExercises(data || []);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Failed to load exercises', description: err?.message || 'Unknown error' });
    } finally {
      setLoadingExercises(false);
    }
  };

  React.useEffect(() => {
    fetchExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const onAdd = async () => {
    if (!name.trim()) {
      toast({ title: "Name is required" });
      return;
    }

    // Duplicate check before creating
    try {
      const nameNorm = name.trim();
      let q: any = supabase
        .from('exercises')
        .select('id,name,body_part,primary_muscle,equipment,thumbnail_url,image_url')
        .ilike('name', `%${nameNorm}%`);
      if (bodyPart.trim()) q = q.ilike('body_part', `%${bodyPart.trim()}%`);
      if (primaryMuscle.trim()) q = q.ilike('primary_muscle', `%${primaryMuscle.trim()}%`);
      const { data: existing, error: exErr } = await q.limit(10);
      if (exErr) throw exErr;
      if ((existing?.length || 0) > 0) {
        setMatches(existing || []);
        setShowMatchDialog(true);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    await createExercise();
  };

  const createExercise = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const secArr = secondaryMuscles
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // 1) Create exercise
      const { data: ex, error: e1 } = await supabase
        .from("exercises")
        .insert({
          name: name.trim(),
          description: description || null,
          equipment: equipment || null,
          primary_muscle: primaryMuscle || null,
          body_part: bodyPart || null,
          secondary_muscles: secArr.length ? secArr : null,
          source_url: sourceUrl || null,
          is_public: isPublic,
          owner_user_id: user.id,
        })
        .select("id")
        .single();
      if (e1) throw e1;
      const exerciseId = (ex as any).id as string;

      let firstUrl: string | null = null;
      // 2) Upload images (optional)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `${user.id}/${exerciseId}/${Date.now()}-${i}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("exercise-images")
          .upload(path, file, { upsert: false, contentType: file.type });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from("exercise-images").getPublicUrl(path);
        const url = pub.publicUrl;
        if (!firstUrl) firstUrl = url;
        const { error: e2 } = await supabase.from("exercise_images").insert({
          user_id: user.id,
          exercise_id: exerciseId,
          url,
          path,
          is_primary: i === 0,
          order_index: i + 1,
        });
        if (e2) throw e2;
      }

      // 3) Set thumbnail on exercise
      if (firstUrl) {
        const { error: e3 } = await supabase
          .from("exercises")
          .update({ image_url: firstUrl, thumbnail_url: firstUrl })
          .eq("id", exerciseId)
          .eq("owner_user_id", user.id);
        if (e3) throw e3;
      }

      toast({ title: "Exercise added", description: files.length ? `Uploaded ${files.length} image(s)` : undefined });
      // Reset form
      setName("");
      setPrimaryMuscle("");
      setBodyPart("");
      setEquipment("");
      setDescription("");
      setSourceUrl("");
      setIsPublic(true);
      setFiles([]);
      setSecondaryMuscles("");

      // Refresh list
      fetchExercises();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Failed to add exercise", description: e?.message ?? "Unknown error" });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (ex: any) => {
    setEditingId(ex.id);
    setEditName(ex.name ?? "");
    setEditPrimaryMuscle(ex.primary_muscle ?? "");
    setEditSecondaryMuscles(Array.isArray(ex.secondary_muscles) ? ex.secondary_muscles.join(", ") : "");
    setEditBodyPart(ex.body_part ?? "");
    setEditEquipment(ex.equipment ?? "");
    setEditDescription(ex.description ?? "");
    setEditSourceUrl(ex.source_url ?? "");
    setEditIsPublic(!!ex.is_public);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setEditSaving(true);
    try {
      const secArr = editSecondaryMuscles
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const { error } = await supabase
        .from('exercises')
        .update({
          name: editName.trim(),
          primary_muscle: editPrimaryMuscle || null,
          secondary_muscles: secArr.length ? secArr : null,
          body_part: editBodyPart || null,
          equipment: editEquipment || null,
          description: editDescription || null,
          source_url: editSourceUrl || null,
          is_public: editIsPublic,
        })
        .eq('id', editingId)
        .select();
      if (error) throw error;
      toast({ title: 'Exercise updated' });
      setEditOpen(false);
      setEditingId(null);
      await fetchExercises();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to update', description: e?.message || 'Unknown error' });
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <>
      <PageNav current="Fitness" />
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
          </NavigationMenuList>
        </NavigationMenu>
      </nav>
      <main className="container py-8">
        <h1 className="text-2xl font-semibold mb-6">Exercises</h1>
        <section className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Browse Exercises</CardTitle>
              <CardDescription>Filter by name, body part, and primary muscle.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="filter_name">Name</Label>
                  <Input id="filter_name" placeholder="e.g., Bench" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter_body">Body part</Label>
                  <Input id="filter_body" placeholder="e.g., Upper body" value={filterBodyPart} onChange={(e) => setFilterBodyPart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filter_primary">Primary muscle</Label>
                  <Input id="filter_primary" placeholder="e.g., Chest" value={filterPrimary} onChange={(e) => setFilterPrimary(e.target.value)} />
                </div>
              </div>
              <div>
                <Button variant="secondary" onClick={fetchExercises} disabled={loadingExercises} aria-label="Search exercises">
                  {loadingExercises ? "Searching…" : "Search"}
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {exercises.map((ex) => (
                  <Card key={ex.id}>
                    <CardContent className="pt-4">
                      <img src={ex.thumbnail_url || ex.image_url || '/placeholder.svg'} alt={`${ex.name} exercise thumbnail`} loading="lazy" className="w-full h-24 object-cover rounded-md" />
                      <div className="mt-2">
                        <div className="text-sm font-medium">{ex.name}</div>
                        <div className="text-xs text-muted-foreground">{ex.primary_muscle || '-'} • {ex.body_part || '-'} • {ex.equipment || '-'}</div>
                      </div>
                      {currentUserId && ex.owner_user_id === currentUserId && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline" onClick={() => openEdit(ex)} aria-label={`Edit ${ex.name}`}>
                            Edit
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {!loadingExercises && exercises.length === 0 && (
                  <p className="text-sm text-muted-foreground">No exercises found.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Add Exercise</CardTitle>
              <CardDescription>Fill the fields and optionally upload images.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="e.g., Barbell Bench Press" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_muscle">Primary muscle</Label>
                  <Input id="primary_muscle" placeholder="e.g., Chest" value={primaryMuscle} onChange={(e) => setPrimaryMuscle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondary_muscles">Secondary muscles (comma-separated)</Label>
                  <Input id="secondary_muscles" placeholder="e.g., Triceps, Front delts" value={secondaryMuscles} onChange={(e) => setSecondaryMuscles(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body_part">Body part</Label>
                  <Input id="body_part" placeholder="e.g., Upper body" value={bodyPart} onChange={(e) => setBodyPart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipment">Equipment</Label>
                  <Input id="equipment" placeholder="e.g., Barbell" value={equipment} onChange={(e) => setEquipment(e.target.value)} />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="description">Description / cues</Label>
                  <Textarea id="description" placeholder="How to perform it..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source_url">Source URL (optional)</Label>
                  <Input id="source_url" placeholder="https://..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
                </div>
                <div className="flex items-center gap-3">
                  <Switch id="is_public" checked={isPublic} onCheckedChange={setIsPublic} />
                  <Label htmlFor="is_public">Public</Label>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="images">Images</Label>
                  <Input id="images" type="file" multiple accept="image/*" onChange={onFileChange} />
                  {files.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
                      {files.map((f, i) => (
                        <div key={i} className="text-xs text-muted-foreground truncate" title={f.name}>
                          {f.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="pt-2">
                <Button onClick={onAdd} disabled={saving} aria-label="Add Exercise">
                  {saving ? "Saving…" : "Add exercise"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Exercise already exists</DialogTitle>
              <DialogDescription>Select an existing exercise or create a new one.</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 max-h-80 overflow-auto">
              {matches.map((ex) => (
                <div key={ex.id} className="border rounded-md p-2 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{ex.name}</div>
                    <div className="text-xs text-muted-foreground">{ex.primary_muscle || '-'} • {ex.body_part || '-'}</div>
                  </div>
                  <Button size="sm" onClick={() => {
                    setName(ex.name || '');
                    setPrimaryMuscle(ex.primary_muscle || '');
                    setBodyPart(ex.body_part || '');
                    setEquipment(ex.equipment || '');
                    setShowMatchDialog(false);
                    toast({ title: 'Existing exercise selected', description: ex.name });
                  }}>Use this</Button>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setShowMatchDialog(false)}>Cancel</Button>
              <Button onClick={async () => { setShowMatchDialog(false); await createExercise(); }}>Create new anyway</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit exercise</DialogTitle>
              <DialogDescription>Update your exercise details.</DialogDescription>
            </DialogHeader>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Name</Label>
                <Input id="edit_name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_primary_muscle">Primary muscle</Label>
                <Input id="edit_primary_muscle" value={editPrimaryMuscle} onChange={(e) => setEditPrimaryMuscle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_secondary_muscles">Secondary muscles (comma-separated)</Label>
                <Input id="edit_secondary_muscles" value={editSecondaryMuscles} onChange={(e) => setEditSecondaryMuscles(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_body_part">Body part</Label>
                <Input id="edit_body_part" value={editBodyPart} onChange={(e) => setEditBodyPart(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_equipment">Equipment</Label>
                <Input id="edit_equipment" value={editEquipment} onChange={(e) => setEditEquipment(e.target.value)} />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea id="edit_description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_source_url">Source URL</Label>
                <Input id="edit_source_url" value={editSourceUrl} onChange={(e) => setEditSourceUrl(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <Switch id="edit_is_public" checked={editIsPublic} onCheckedChange={setEditIsPublic} />
                <Label htmlFor="edit_is_public">Public</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={saveEdit} disabled={editSaving}>{editSaving ? 'Saving…' : 'Save changes'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
};

export default Exercises;
