import React from "react";
import PageNav from "@/components/PageNav";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Basic SEO
const useSEO = () => {
  React.useEffect(() => {
    document.title = "Add Exercise | I Track I Win";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Create a new exercise in I Track I Win.');
    document.head.appendChild(desc);

    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', `${window.location.origin}/fitness/exercises/add`);
    document.head.appendChild(link);
  }, []);
};

const ExerciseAdd: React.FC = () => {
  useSEO();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [lastError, setLastError] = React.useState<string | null>(null);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast({ title: 'Name is required' });
      return;
    }
    setSaving(true);
    setLastError(null);
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error('Not authenticated');
      console.info('[ExerciseAdd] creating', { name: name.trim(), owner_user_id: user.id });
      const { error } = await supabase.from('exercises').insert({
        name: name.trim(),
        owner_user_id: user.id,
      });
      if (error) throw error;
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Add Exercise</h1>
          <Button variant="secondary" asChild>
            <Link to="/fitness/exercises">Back to Exercises</Link>
          </Button>
        </div>

        <section className="max-w-md space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Push-up" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" asChild>
              <Link to="/fitness/exercises">Cancel</Link>
            </Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Create'}</Button>
          </div>
          {lastError && (
            <p role="alert" className="text-destructive text-sm">{lastError}</p>
          )}
          <pre className="text-xs text-muted-foreground">{JSON.stringify({ name, saving, lastError }, null, 2)}</pre>
        </section>
      </main>
    </>
  );
};

export default ExerciseAdd;
