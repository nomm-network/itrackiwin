import React, { useMemo, useState } from "react";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { GripVertical } from "lucide-react";

interface LifeCategory { id: string; slug: string; name: string; display_order: number; }
interface UserPref { id?: string; user_id: string; category_id: string; display_order: number; }
interface LifeSubcategory { id: string; category_id: string; name: string; }
interface UserPin { id?: string; user_id: string; subcategory_id: string; }

const DEFAULT_ORDER = [
  "Health",
  "Wealth",
  "Relationships",
  "Mind & Emotions",
  "Purpose & Growth",
  "Lifestyle & Contribution",
];

const UserDashboard: React.FC = () => {
  React.useEffect(() => {
    document.title = "Dashboard | I Track I Win";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Reorder categories (drag and drop) and pin subcategories');
  }, []);

  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ["life_categories"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("life_categories")
        .select("id, slug, name, display_order")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as LifeCategory[];
    },
  });

  const { data: prefs = [] } = useQuery({
    queryKey: ["user_category_prefs"],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_category_prefs")
        .select("id, user_id, category_id, display_order");
      if (error) throw error;
      return (data ?? []) as UserPref[];
    },
  });

  const merged = useMemo(() => {
    return categories.map((c, idx) => {
      const p = prefs.find((x) => x.category_id === c.id);
      return {
        category: c,
        pref: p ?? { user_id: userId!, category_id: c.id, display_order: idx },
      };
    });
  }, [categories, prefs, userId]);

  const upsertPrefs = useMutation({
    mutationFn: async (items: UserPref[]) => {
      if (!userId) throw new Error("No user");
      const payload = items.map((i) => ({ ...i, user_id: userId }));
      const { error } = await (supabase as any)
        .from("user_category_prefs")
        .upsert(payload, { onConflict: "user_id,category_id" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["user_category_prefs"] }); toast.success("Preferences saved"); },
    onError: (e: any) => toast.error(e.message || "Failed to save"),
  });

  // Pins
  const { data: allSubcats = [] } = useQuery({
    queryKey: ["life_subcategories_all"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("life_subcategories")
        .select("id, category_id, name");
      if (error) throw error;
      return (data ?? []) as LifeSubcategory[];
    },
  });

  const { data: pins = [] } = useQuery({
    queryKey: ["user_pins"],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_pinned_subcategories")
        .select("id, user_id, subcategory_id");
      if (error) throw error;
      return (data ?? []) as UserPin[];
    },
  });

  const togglePin = useMutation({
    mutationFn: async (subcatId: string) => {
      if (!userId) throw new Error("No user");
      const isPinned = pins.some((p) => p.subcategory_id === subcatId);
      if (isPinned) {
        const { error } = await (supabase as any)
          .from("user_pinned_subcategories")
          .delete()
          .eq("subcategory_id", subcatId);
        if (error) throw error;
        return;
      }
      if (pins.length >= 3) throw new Error("You can pin up to 3 subcategories");
      const { error } = await (supabase as any)
        .from("user_pinned_subcategories")
        .insert({ user_id: userId, subcategory_id: subcatId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["user_pins"] }); },
    onError: (e: any) => toast.error(e.message || "Failed to update pins"),
  });

  // Local editable state
  const [rows, setRows] = useState<UserPref[]>([]);
  React.useEffect(() => {
    const orderMap = new Map<string, number>(DEFAULT_ORDER.map((n, i) => [n, i + 1]));
    const items: UserPref[] = categories.map((c) => {
      const p = prefs.find((x) => x.category_id === c.id);
      const base = p && p.display_order > 0 ? p.display_order : (orderMap.get(c.name) ?? 999);
      return {
        ...(p ?? { user_id: userId!, category_id: c.id, display_order: base }),
        display_order: base,
      } as UserPref;
    });
    items.sort((a, b) => a.display_order - b.display_order);
    const normalized = items.map((it, idx) => ({ ...it, display_order: idx + 1 }));
    setRows(normalized);
  }, [categories, prefs, userId]);

  const onChangeRow = (categoryId: string, patch: Partial<UserPref>) => {
    setRows((prev) => prev.map((r) => r.category_id === categoryId ? { ...r, ...patch } : r));
  };

  const [dragId, setDragId] = useState<string | null>(null);
  const handleDragStart = (id: string) => () => setDragId(id);
  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId || dragId === id) return;
    setRows((prev) => {
      const from = prev.findIndex((r) => r.category_id === dragId);
      const to = prev.findIndex((r) => r.category_id === id);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next.map((r, idx) => ({ ...r, display_order: idx + 1 }));
    });
  };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragId(null); };

  // Group subcategories by category for display
  const subByCat = useMemo(() => {
    const m: Record<string, LifeSubcategory[]> = {};
    for (const s of allSubcats) {
      m[s.category_id] = m[s.category_id] || [];
      m[s.category_id].push(s);
    }
    return m;
  }, [allSubcats]);

  return (
    <main>
      <PageNav current="Dashboard" />
      <section className="container py-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Your Dashboard</h1>
            <p className="text-sm text-muted-foreground">Reorder categories by dragging, and pin up to 3 subcategories</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline"><Link to="/profile">Account</Link></Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">Drag & Drop to change the priority.</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Order</TableHead>
                  <TableHead>Category</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => {
                  const c = categories.find((x) => x.id === r.category_id);
                  return (
                    <TableRow
                      key={r.category_id}
                      draggable
                      onDragStart={handleDragStart(r.category_id)}
                      onDragOver={handleDragOver(r.category_id)}
                      onDrop={handleDrop}
                      className="cursor-grab"
                    >
                      <TableCell className="font-mono">{idx + 1}.</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <span>{c?.name}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => upsertPrefs.mutate(rows.map((r, i) => ({ ...r, display_order: i + 1 })))}>Save</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Pin subcategories (max 3)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-5">
              {categories.map((c) => (
                <div key={c.id}>
                  <div className="font-medium mb-2">{c.name}</div>
                  <div className="grid md:grid-cols-3 gap-2">
                    {(subByCat[c.id] || []).map((s) => {
                      const isPinned = pins.some((p) => p.subcategory_id === s.id);
                      const disabled = !isPinned && pins.length >= 3;
                      return (
                        <label key={s.id} className={`flex items-center gap-2 rounded border p-2 ${disabled?"opacity-60":""}`}>
                          <Checkbox checked={isPinned} disabled={disabled} onCheckedChange={() => togglePin.mutate(s.id)} />
                          <span className="text-sm">{s.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default UserDashboard;
