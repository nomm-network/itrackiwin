import React from "react";
import PageNav from "@/components/PageNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { NavLink } from "react-router-dom";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const useSEO = () => {
  React.useEffect(() => {
    document.title = "Configure Muscles | I Track I Win";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Manage body parts, muscle groups, and muscles for your exercise taxonomy.');
    document.head.appendChild(desc);

    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', `${window.location.origin}/fitness/configure`);
    document.head.appendChild(link);
  }, []);
};

const FitnessConfigure: React.FC = () => {
  useSEO();
  const { toast } = useToast();

  const [bodyParts, setBodyParts] = React.useState<any[]>([]);
  const [muscleGroups, setMuscleGroups] = React.useState<any[]>([]);
  const [muscles, setMuscles] = React.useState<any[]>([]);
  const [equipment, setEquipment] = React.useState<any[]>([]);

  const [bpName, setBpName] = React.useState("");
  const [mgName, setMgName] = React.useState("");
  const [mgBodyPartId, setMgBodyPartId] = React.useState("");

  const [mName, setMName] = React.useState("");
  const [mBodyPartId, setMBodyPartId] = React.useState("");
  const [mGroupId, setMGroupId] = React.useState("");
  const [eqName, setEqName] = React.useState("");

  const loadAll = async () => {
    const [{ data: bps }, { data: mgs }, { data: ms }, { data: eqs }] = await Promise.all([
      supabase.from('body_parts').select('id,name').order('name'),
      supabase.from('muscle_groups').select('id,name,body_part_id').order('name'),
      supabase.from('muscles').select('id,name,muscle_group_id').order('name'),
      supabase.from('equipment').select('id,name').order('name'),
    ]);
    setBodyParts(bps || []);
    setMuscleGroups(mgs || []);
    setMuscles(ms || []);
    setEquipment(eqs || []);
  };

  React.useEffect(() => { loadAll(); }, []);

  // Dependent dropdowns in Muscles create form
  const groupsForSelectedBP = React.useMemo(() => muscleGroups.filter(g => g.body_part_id === mBodyPartId), [muscleGroups, mBodyPartId]);

  // CRUD handlers
  const addBodyPart = async () => {
    if (!bpName.trim()) return;
    const { error } = await supabase.from('body_parts').insert({ name: bpName.trim() });
    if (error) { toast({ title: 'Failed to add body part', description: error.message }); return; }
    setBpName("");
    await loadAll();
    toast({ title: 'Body part added' });
  };

  const renameBodyPart = async (bp: any) => {
    const name = prompt('Rename body part', bp.name);
    if (!name) return;
    const { error } = await supabase.from('body_parts').update({ name }).eq('id', bp.id);
    if (error) { toast({ title: 'Failed to update', description: error.message }); return; }
    await loadAll();
    toast({ title: 'Updated' });
  };

  const deleteBodyPart = async (bp: any) => {
    if (!confirm(`Delete ${bp.name} and all its groups/muscles?`)) return;
    const { error } = await supabase.from('body_parts').delete().eq('id', bp.id);
    if (error) { toast({ title: 'Failed to delete', description: error.message }); return; }
    await loadAll();
    toast({ title: 'Deleted' });
  };

  const addMuscleGroup = async () => {
    if (!mgBodyPartId || !mgName.trim()) return;
    const { error } = await supabase.from('muscle_groups').insert({ body_part_id: mgBodyPartId, name: mgName.trim() });
    if (error) { toast({ title: 'Failed to add group', description: error.message }); return; }
    setMgName("");
    await loadAll();
    toast({ title: 'Muscle group added' });
  };

  const renameMuscleGroup = async (mg: any) => {
    const name = prompt('Rename muscle group', mg.name);
    if (!name) return;
    const { error } = await supabase.from('muscle_groups').update({ name }).eq('id', mg.id);
    if (error) { toast({ title: 'Failed to update', description: error.message }); return; }
    await loadAll();
    toast({ title: 'Updated' });
  };

  const deleteMuscleGroup = async (mg: any) => {
    if (!confirm(`Delete ${mg.name} and its muscles?`)) return;
    const { error } = await supabase.from('muscle_groups').delete().eq('id', mg.id);
    if (error) { toast({ title: 'Failed to delete', description: error.message }); return; }
    await loadAll();
    toast({ title: 'Deleted' });
  };

  const addMuscle = async () => {
    if (!mGroupId || !mName.trim()) return;
    const { error } = await supabase.from('muscles').insert({ muscle_group_id: mGroupId, name: mName.trim() });
    if (error) { toast({ title: 'Failed to add muscle', description: error.message }); return; }
    setMName("");
    await loadAll();
    toast({ title: 'Muscle added' });
  };

  const renameMuscle = async (m: any) => {
    const name = prompt('Rename muscle', m.name);
    if (!name) return;
    const { error } = await supabase.from('muscles').update({ name }).eq('id', m.id);
    if (error) { toast({ title: 'Failed to update', description: error.message }); return; }
    await loadAll();
    toast({ title: 'Updated' });
  };

  const deleteMuscle = async (m: any) => {
    if (!confirm(`Delete ${m.name}?`)) return;
    const { error } = await supabase.from('muscles').delete().eq('id', m.id);
    if (error) { toast({ title: 'Failed to delete', description: error.message }); return; }
    await loadAll();
    toast({ title: 'Deleted' });
  };

  // Equipment CRUD
  const addEquipment = async () => {
    if (!eqName.trim()) return;
    const { error } = await supabase.from('equipment').insert({ name: eqName.trim(), slug: eqName.trim().toLowerCase().replace(/\s+/g, '-') });
    if (error) { toast({ title: 'Failed to add equipment', description: error.message }); return; }
    setEqName("");
    await loadAll();
    toast({ title: 'Equipment added' });
  };

  const renameEquipment = async (eq: any) => {
    const name = prompt('Rename equipment', eq.name);
    if (!name) return;
    const { error } = await supabase.from('equipment').update({ name, slug: name.toLowerCase().replace(/\s+/g, '-') }).eq('id', eq.id);
    if (error) { toast({ title: 'Failed to update', description: error.message }); return; }
    await loadAll();
    toast({ title: 'Updated' });
  };

  const deleteEquipment = async (eq: any) => {
    if (!confirm(`Delete ${eq.name}?`)) return;
    const { error } = await supabase.from('equipment').delete().eq('id', eq.id);
    if (error) { toast({ title: 'Failed to delete', description: error.message }); return; }
    await loadAll();
    toast({ title: 'Deleted' });
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

      <main className="container py-8 space-y-8">
        <h1 className="text-2xl font-semibold">Configure Exercise Taxonomy</h1>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Body Parts</CardTitle>
              <CardDescription>Create high-level categories.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="bp_name">Name</Label>
                  <Input id="bp_name" placeholder="e.g., Pectorals" value={bpName} onChange={(e) => setBpName(e.target.value)} />
                </div>
                <div className="pt-6 sm:pt-0">
                  <Button onClick={addBodyPart}>Add</Button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {bodyParts.map(bp => (
                  <div key={bp.id} className="border rounded-md p-3 flex items-center justify-between">
                    <span>{bp.name}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => renameBodyPart(bp)}>Rename</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteBodyPart(bp)}>Delete</Button>
                    </div>
                  </div>
                ))}
                {bodyParts.length === 0 && <p className="text-sm text-muted-foreground">No body parts yet.</p>}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Muscle Groups</CardTitle>
              <CardDescription>Groups under a body part (e.g., Chest under Pectorals).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Body part</Label>
                  <Select value={mgBodyPartId} onValueChange={setMgBodyPartId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select body part" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyParts.map((bp: any) => (
                        <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="mg_name">Group name</Label>
                  <div className="flex gap-2">
                    <Input id="mg_name" placeholder="e.g., Chest" value={mgName} onChange={(e) => setMgName(e.target.value)} />
                    <Button onClick={addMuscleGroup} disabled={!mgBodyPartId || !mgName.trim()}>Add</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {muscleGroups.length === 0 && <p className="text-sm text-muted-foreground">No groups yet.</p>}
                {bodyParts.map(bp => (
                  <div key={bp.id}>
                    <h4 className="font-medium mb-2">{bp.name}</h4>
                    <div className="space-y-2">
                      {muscleGroups.filter(g => g.body_part_id === bp.id).map(g => (
                        <div key={g.id} className="border rounded-md p-2 flex items-center justify-between">
                          <span>{g.name}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => renameMuscleGroup(g)}>Rename</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteMuscleGroup(g)}>Delete</Button>
                          </div>
                        </div>
                      ))}
                      {muscleGroups.filter(g => g.body_part_id === bp.id).length === 0 && (
                        <p className="text-xs text-muted-foreground">No groups for this body part.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Muscles</CardTitle>
              <CardDescription>Muscles under a group (e.g., Upper Chest under Chest).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Body part</Label>
                  <Select value={mBodyPartId} onValueChange={(v) => { setMBodyPartId(v); setMGroupId(""); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select body part" />
                    </SelectTrigger>
                    <SelectContent>
                      {bodyParts.map((bp: any) => (
                        <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Muscle group</Label>
                  <Select value={mGroupId} onValueChange={setMGroupId} disabled={!mBodyPartId}>
                    <SelectTrigger>
                      <SelectValue placeholder={!mBodyPartId ? 'Select body part first' : 'Select group'} />
                    </SelectTrigger>
                    <SelectContent>
                      {groupsForSelectedBP.map((g: any) => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="m_name">Muscle name</Label>
                  <div className="flex gap-2">
                    <Input id="m_name" placeholder="e.g., Upper Chest" value={mName} onChange={(e) => setMName(e.target.value)} />
                    <Button onClick={addMuscle} disabled={!mGroupId || !mName.trim()}>Add</Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {muscles.length === 0 && <p className="text-sm text-muted-foreground">No muscles yet.</p>}
                {muscleGroups.map(g => (
                  <div key={g.id}>
                    <h4 className="font-medium mb-2">{g.name}</h4>
                    <div className="space-y-2">
                      {muscles.filter(m => m.muscle_group_id === g.id).map(m => (
                        <div key={m.id} className="border rounded-md p-2 flex items-center justify-between">
                          <span>{m.name}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary" onClick={() => renameMuscle(m)}>Rename</Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteMuscle(m)}>Delete</Button>
                          </div>
                        </div>
                      ))}
                      {muscles.filter(m => m.muscle_group_id === g.id).length === 0 && (
                        <p className="text-xs text-muted-foreground">No muscles for this group.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default FitnessConfigure;
