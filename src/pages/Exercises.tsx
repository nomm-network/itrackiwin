import React from "react";
import PageNav from "@/components/PageNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
  const [lastError, setLastError] = React.useState<string | null>(null);
  const [debug] = React.useState(true);


  // Edit dialog state
  
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
    if (error) {
      console.error(error);
    }
    setEquipmentOptions(data || []);
  }, []);

  const loadExercises = React.useCallback(async () => {
    setLoading(true);
    setLastError(null);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('id,name,owner_user_id,primary_muscle_id,secondary_muscle_ids')
        .order('name', { ascending: true })
        .limit(500);
      console.debug('loadExercises result', { count: data?.length, error });
      if (error) throw error;
      setExercises(data || []);
    } catch (e: any) {
      console.error('loadExercises error', e);
      setLastError(e?.message || String(e));
      toast({ title: 'Failed to load exercises', description: e?.message || 'Unknown error' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  React.useEffect(() => { loadEquipment(); loadExercises(); }, [loadEquipment, loadExercises]);


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
      }).eq('id', editId).eq('owner_user_id', currentUserId);
      if (error) throw error;
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
      const { error } = await supabase.from('exercises').delete().eq('id', editId).eq('owner_user_id', currentUserId);
      if (error) throw error;
      toast({ title: 'Exercise deleted' });
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
          <Button asChild>
            <NavLink to="/fitness/exercises/add">+ Add Exercise</NavLink>
          </Button>
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
                <div key={ex.id} className="border rounded-md p-2">
                  {editId === ex.id ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`edit_name_${ex.id}`}>Name</Label>
                        <Input id={`edit_name_${ex.id}`} value={editName} onChange={(e) => setEditName(e.target.value)} />
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
                        <Switch id={`edit_public_${ex.id}`} checked={editIsPublic} onCheckedChange={setEditIsPublic} />
                        <Label htmlFor={`edit_public_${ex.id}`}>Public</Label>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="destructive" onClick={deleteExercise} disabled={editSaving}>Delete</Button>
                        <Button variant="secondary" onClick={() => setEditId(null)}>Cancel</Button>
                        <Button onClick={saveEdit} disabled={editSaving}>{editSaving ? 'Saving…' : 'Save'}</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{ex.name}</span>
                      {currentUserId && ex.owner_user_id === currentUserId && (
                        <Button size="sm" variant="outline" onClick={() => openEdit(ex)}>Edit</Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
        {debug && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Debug</CardTitle>
                <CardDescription>State and last error</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs whitespace-pre-wrap">{JSON.stringify({ route: 'Exercises', loading, currentUserId, count: exercises.length, lastError, sample: exercises.slice(0,3) }, null, 2)}</pre>
              </CardContent>
            </Card>
          </section>
        )}
      </main>


    </>
  );
};

export default Exercises;
