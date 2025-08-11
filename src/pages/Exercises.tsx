import React from "react";
import PageNav from "@/components/PageNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { NavLink } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Basic SEO for the page
const useSEO = () => {
  React.useEffect(() => {
    document.title = "Exercises | I Track I Win";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Browse and manage exercises in I Track I Win.');
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

  const [exercises, setExercises] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [equipmentOptions, setEquipmentOptions] = React.useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  // Add dialog state
  const [addOpen, setAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newEquipmentId, setNewEquipmentId] = React.useState("");
  const [newIsPublic, setNewIsPublic] = React.useState(true);
  const [newSaving, setNewSaving] = React.useState(false);

  // Edit dialog state
  const [editOpen, setEditOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editEquipmentId, setEditEquipmentId] = React.useState("");
  const [editIsPublic, setEditIsPublic] = React.useState(true);
  const [editSaving, setEditSaving] = React.useState(false);

  // Auth
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setCurrentUserId(session?.user?.id ?? null));
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const loadEquipment = React.useCallback(async () => {
    const { data, error } = await supabase.from('equipment').select('id,name').order('name');
    if (!error) setEquipmentOptions(data || []);
  }, []);

  const loadExercises = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id,name,owner_user_id')
        .order('name', { ascending: true })
        .limit(500);
      if (error) throw error;
      setExercises(data || []);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to load exercises', description: e?.message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => { loadEquipment(); loadExercises(); }, [loadEquipment, loadExercises]);

  const createExercise = async () => {
    if (!newName.trim()) { toast({ title: 'Name is required' }); return; }
    setNewSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('exercises').insert({
        name: newName.trim(),
        owner_user_id: user.id,
        is_public: newIsPublic,
        equipment_id: newEquipmentId || null,
      });
      if (error) throw error;
      toast({ title: 'Exercise added' });
      setAddOpen(false);
      setNewName(''); setNewEquipmentId(''); setNewIsPublic(true);
      await loadExercises();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to add', description: e?.message || 'Unknown error' });
    } finally {
      setNewSaving(false);
    }
  };

  const openEdit = async (ex: any) => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id,name,equipment_id,is_public,owner_user_id')
        .eq('id', ex.id)
        .maybeSingle();
      if (error) throw error;
      setEditId(data?.id || ex.id);
      setEditName(data?.name || ex.name || '');
      setEditEquipmentId(data?.equipment_id || '');
      setEditIsPublic(!!data?.is_public);
      setEditOpen(true);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to open', description: e?.message || 'Unknown error' });
    }
  };

  const saveEdit = async () => {
    if (!editId) return;
    setEditSaving(true);
    try {
      const { error } = await supabase.from('exercises').update({
        name: editName.trim(),
        equipment_id: editEquipmentId || null,
        is_public: editIsPublic,
      }).eq('id', editId);
      if (error) throw error;
      toast({ title: 'Exercise updated' });
      setEditOpen(false);
      setEditId(null);
      await loadExercises();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to update', description: e?.message || 'Unknown error' });
    } finally {
      setEditSaving(false);
    }
  };

  const deleteExercise = async () => {
    if (!editId) return;
    setEditSaving(true);
    try {
      const { error } = await supabase.from('exercises').delete().eq('id', editId);
      if (error) throw error;
      toast({ title: 'Exercise deleted' });
      setEditOpen(false);
      setEditId(null);
      await loadExercises();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to delete', description: e?.message || 'Unknown error' });
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
            <NavigationMenuItem>
              <NavLink to="/fitness/configure" className={({ isActive }) => `${navigationMenuTriggerStyle()} ${isActive ? 'bg-accent/50' : ''}`}>
                Configure
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </nav>

      <main className="container py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Exercises</h1>
          <Button onClick={() => setAddOpen(true)}>+ Add Exercise</Button>
        </div>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>All Exercises</CardTitle>
              <CardDescription>Showing names only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
              {!loading && exercises.length === 0 && <p className="text-sm text-muted-foreground">No exercises yet.</p>}
              {exercises.map((ex) => (
                <div key={ex.id} className="flex items-center justify-between border rounded-md p-2">
                  <span className="text-sm font-medium">{ex.name}</span>
                  {currentUserId && ex.owner_user_id === currentUserId && (
                    <Button size="sm" variant="outline" onClick={() => openEdit(ex)}>Edit</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
            <DialogDescription>Create a new exercise.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="new_name">Name</Label>
              <Input id="new_name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Push-up" />
            </div>
            <div className="space-y-2">
              <Label>Equipment</Label>
              <Select value={newEquipmentId} onValueChange={setNewEquipmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {equipmentOptions.map((eq: any) => (
                    <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="new_public" checked={newIsPublic} onCheckedChange={setNewIsPublic} />
              <Label htmlFor="new_public">Public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={createExercise} disabled={newSaving}>{newSaving ? 'Saving…' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>Update name or equipment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="edit_name">Name</Label>
              <Input id="edit_name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Equipment</Label>
              <Select value={editEquipmentId} onValueChange={setEditEquipmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {equipmentOptions.map((eq: any) => (
                    <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="edit_public" checked={editIsPublic} onCheckedChange={setEditIsPublic} />
              <Label htmlFor="edit_public">Public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={deleteExercise} disabled={editSaving}>Delete</Button>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={editSaving}>{editSaving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Exercises;
