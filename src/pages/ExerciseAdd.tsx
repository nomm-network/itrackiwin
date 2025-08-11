import React from "react";
import PageNav from "@/components/PageNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { NavLink, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const useSEO = () => {
  React.useEffect(() => {
    document.title = "Add Exercise | I Track I Win";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Add a new exercise in I Track I Win.');
    document.head.appendChild(desc);

    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', `${window.location.origin}/fitness/exercises/add`);
    document.head.appendChild(link);
  }, []);
};

const ExerciseAdd: React.FC = () => {
  useSEO();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [equipmentOptions, setEquipmentOptions] = React.useState<any[]>([]);
  const [name, setName] = React.useState("");
  const [equipmentId, setEquipmentId] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    supabase.from('equipment').select('id,name').order('name').then(({ data, error }) => {
      if (error) console.error(error);
      setEquipmentOptions(data || []);
    });
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) { toast({ title: 'Name is required' }); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('exercises').insert({
        name: name.trim(),
        owner_user_id: user.id,
        is_public: isPublic,
        equipment_id: equipmentId || null,
      });
      if (error) throw error;
      toast({ title: 'Exercise added' });
      navigate('/fitness/exercises');
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Failed to add', description: e?.message || 'Unknown error' });
    } finally {
      setSaving(false);
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
          <h1 className="text-2xl font-semibold">Add Exercise</h1>
          <Button variant="secondary" onClick={() => navigate('/fitness/exercises')}>Back to list</Button>
        </div>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>New Exercise</CardTitle>
              <CardDescription>Fill in the details and save.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Push-up" />
              </div>
              <div className="space-y-2">
                <Label>Equipment</Label>
                <Select value={equipmentId} onValueChange={setEquipmentId}>
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
                <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="public">Public</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => navigate('/fitness/exercises')}>Cancel</Button>
                <Button onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Create'}</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
};

export default ExerciseAdd;
