import React from "react";
import PageNav from "@/components/PageNav";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Link, NavLink } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";

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
  secondary_muscle_group_ids: string[] | null;
}

interface BodyPart { id: string; name: string }
interface MuscleGroup { id: string; name: string; body_part_id: string }
interface Muscle { id: string; name: string; muscle_group_id: string }

const Exercises: React.FC = () => {
  useSEO();
  const { toast } = useToast();
  const [rows, setRows] = React.useState<ExerciseRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // filters
  const [query, setQuery] = React.useState("");
  const [ownership, setOwnership] = React.useState<"all" | "public" | "yours">("all");
  const [bpId, setBpId] = React.useState<string>("");
  const [groupId, setGroupId] = React.useState<string>("");
  const [muscleId, setMuscleId] = React.useState<string>("");

  // taxonomy
  const [bodyParts, setBodyParts] = React.useState<BodyPart[]>([]);
  const [muscleGroups, setMuscleGroups] = React.useState<MuscleGroup[]>([]);
  const [muscles, setMuscles] = React.useState<Muscle[]>([]);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [{ data, error }, u, bp, mg, m] = await Promise.all([
          supabase
            .from('exercises')
            .select('id,name,owner_user_id,primary_muscle_id,secondary_muscle_group_ids')
            .order('name', { ascending: true })
            .limit(100),
          supabase.auth.getUser(),
          supabase.from('v_body_parts_with_translations').select('id, slug, translations'),
          supabase.from('v_muscle_groups_with_translations').select('id, slug, body_part_id, translations'),
          supabase.from('v_muscles_with_translations').select('id, slug, muscle_group_id, translations'),
        ]);
        if (!isMounted) return;
        if (error) setError(error.message);
        setRows(data || []);
        setUserId(u.data.user?.id || null);
        if (bp.error) throw bp.error; if (mg.error) throw mg.error; if (m.error) throw m.error;
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
      } catch (e: any) {
        console.error('[Exercises] load error', e);
        if (isMounted) setError(e?.message || String(e));
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const groupsFiltered = React.useMemo(() => {
    if (!bpId) return muscleGroups;
    return muscleGroups.filter((g) => g.body_part_id === bpId);
  }, [muscleGroups, bpId]);

  const musclesFiltered = React.useMemo(() => {
    if (!groupId) return [] as Muscle[];
    return muscles.filter((mu) => mu.muscle_group_id === groupId);
  }, [muscles, groupId]);

  const muscleById = React.useMemo(() => {
    const map = new Map<string, Muscle>();
    muscles.forEach((mu) => map.set(mu.id, mu));
    return map;
  }, [muscles]);

  const groupById = React.useMemo(() => {
    const map = new Map<string, MuscleGroup>();
    muscleGroups.forEach((g) => map.set(g.id, g));
    return map;
  }, [muscleGroups]);

  const matchesFilters = React.useCallback((r: ExerciseRow) => {
    // search
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!r.name.toLowerCase().includes(q)) return false;
    }
    // ownership
    if (ownership === 'public' && r.owner_user_id !== null) return false;
    if (ownership === 'yours' && r.owner_user_id !== userId) return false;

    // body part / group / muscle
    const ids = [r.primary_muscle_id, ...(r.secondary_muscle_group_ids || [])].filter(Boolean) as string[];
    if (muscleId) {
      return ids.includes(muscleId);
    }
    if (groupId) {
      const groupMuscleIds = muscles.filter((mu) => mu.muscle_group_id === groupId).map((mu) => mu.id);
      return ids.some((id) => groupMuscleIds.includes(id));
    }
    if (bpId) {
      // any muscle under selected body part
      return ids.some((id) => {
        const mu = muscleById.get(id);
        if (!mu) return false;
        const g = groupById.get(mu.muscle_group_id);
        return g?.body_part_id === bpId;
      });
    }
    return true;
  }, [query, ownership, userId, muscleId, groupId, bpId, muscles, muscleById, groupById]);

  const filtered = React.useMemo(() => rows.filter(matchesFilters), [rows, matchesFilters]);

  const handleDelete = async (id: string) => {
    const ok = window.confirm('Delete this exercise? This cannot be undone.');
    if (!ok) return;
    const { error } = await supabase.from('exercises').delete().eq('id', id);
    if (error) {
      toast({ title: 'Failed to delete', description: error.message });
    } else {
      setRows((prev) => prev.filter((x) => x.id !== id));
      toast({ title: 'Exercise deleted' });
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
          <h1 className="text-xl md:text-2xl font-semibold">Exercises</h1>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/fitness/exercises/add">Add Exercise</Link>
          </Button>
        </div>

        <section className="grid gap-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input id="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <Label>Body Part</Label>
                <Select value={bpId || "all"} onValueChange={(v) => { setBpId(v === "all" ? "" : v); setGroupId(""); setMuscleId(""); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {bodyParts.map((bp) => (
                      <SelectItem key={bp.id} value={bp.id}>{bp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Group</Label>
                <Select value={groupId || "all"} onValueChange={(v) => { setGroupId(v === "all" ? "" : v); setMuscleId(""); }} disabled={!bpId}>
                  <SelectTrigger>
                    <SelectValue placeholder={bpId ? 'All' : 'Select body part first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {groupsFiltered.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Muscle</Label>
                <Select value={muscleId || "all"} onValueChange={(v) => setMuscleId(v === "all" ? "" : v)} disabled={!groupId}>
                  <SelectTrigger>
                    <SelectValue placeholder={groupId ? 'All' : 'Select group first'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {musclesFiltered.map((mu) => (
                      <SelectItem key={mu.id} value={mu.id}>{mu.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3">
            <div className="w-full sm:w-auto">
              <Label>Visibility</Label>
              <Select value={ownership} onValueChange={(v) => setOwnership(v as any)}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="yours">Yours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary" type="button" onClick={() => { setQuery(""); setOwnership("all"); setBpId(""); setGroupId(""); setMuscleId(""); }} className="w-full sm:w-auto">Clear</Button>
          </div>
        </section>

        {loading && <p>Loading…</p>}
        {error && (
          <div role="alert" className="text-destructive">
            Failed to load exercises: {error}
          </div>
        )}

        {!loading && !error && (
          <ul className="space-y-2">
            {filtered.map((r) => {
              const mu = r.primary_muscle_id ? muscleById.get(r.primary_muscle_id) : undefined;
              const grp = mu ? groupById.get(mu.muscle_group_id) : undefined;
              return (
                <li key={r.id} className="rounded border p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{r.name}</span>
                        {r.owner_user_id ? (
                          <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded">yours</span>
                        ) : (
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">public</span>
                        )}
                      </div>
                      {mu && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {grp ? `${grp.name} • ` : ''}{mu.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {r.owner_user_id === userId && (
                        <>
                          <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
                            <Link to={`/fitness/exercises/${r.id}/edit`}>
                              <Pencil className="mr-1 h-4 w-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </Link>
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)} className="flex-1 sm:flex-none">
                            <Trash2 className="mr-1 h-4 w-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="text-sm text-muted-foreground">No exercises found.</li>
            )}
          </ul>
        )}
      </main>
    </>
  );
};

export default Exercises;