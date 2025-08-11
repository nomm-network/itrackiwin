import React from "react";
import PageNav from "@/components/PageNav";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link, NavLink } from "react-router-dom";

// Basic SEO for the page (non-visual)
const useSEO = () => {
  React.useEffect(() => {
    document.title = "Exercises | I Track I Win";
    const desc = document.querySelector('meta[name="description"]') || document.createElement('meta');
    desc.setAttribute('name', 'description');
    desc.setAttribute('content', 'Browse exercises in I Track I Win.');
    document.head.appendChild(desc);

    const link = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', `${window.location.origin}/fitness/exercises`);
    document.head.appendChild(link);
  }, []);
};

interface ExerciseRow {
  id: string;
  name: string;
  owner_user_id: string | null;
  primary_muscle_id: string | null;
  secondary_muscle_ids: string[] | null;
}

const Exercises: React.FC = () => {
  useSEO();
  const [rows, setRows] = React.useState<ExerciseRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('exercises')
        .select('id,name,owner_user_id,primary_muscle_id,secondary_muscle_ids')
        .order('name', { ascending: true })
        .limit(100);
      console.info('[Exercises] fetch', { count: data?.length, error });
      if (!isMounted) return;
      if (error) setError(error.message);
      setRows(data || []);
      setLoading(false);
    })();
    return () => { isMounted = false; };
  }, []);

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
          <h1 className="text-2xl font-semibold">Exercises</h1>
          <Button asChild>
            <Link to="/fitness/exercises/add">Add Exercise</Link>
          </Button>
        </div>

        {loading && <p>Loading…</p>}
        {error && (
          <div role="alert" className="text-destructive">
            Failed to load exercises: {error}
          </div>
        )}

        {!loading && !error && (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li key={r.id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <span>{r.name}</span>
                  {r.owner_user_id ? (
                    <span className="text-xs text-muted-foreground">yours</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">public</span>
                  )}
                </div>
              </li>
            ))}
            {rows.length === 0 && (
              <li className="text-sm text-muted-foreground">No exercises found.</li>
            )}
          </ul>
        )}
      </main>
    </>
  );
};

export default Exercises;
