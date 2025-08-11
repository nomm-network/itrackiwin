import React, { useMemo, useState } from "react";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface LifeCategory { id: string; slug: string; name: string; display_order: number; }
interface UserPref { id?: string; user_id: string; category_id: string; display_order: number; priority: number; }
interface LifeSubcategory { id: string; category_id: string; name: string; }
interface UserPin { id?: string; user_id: string; subcategory_id: string; }

const UserDashboard: React.FC = () => {
  React.useEffect(() => {
    document.title = "Dashboard | I Track I Win";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Customize your categories order, set priorities, and pin subcategories');
  }, []);

  const qc = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: categories = [] } = useQuery({
    queryKey: ["life_categories"],
    queryFn: async () => {
      const { data, error } = (supabase as any)
        .from("life_categories")
        .select("id, slug, name, display_order")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as LifeCategory[];
    },
  });

  const { data: prefs = [] } = useQuery({
    queryKey: ["user_category_prefs"],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = (supabase as any)
        .from("user_category_prefs")
        .select("id, user_id, category_id, display_order, priority");
      if (error) throw error;
      return data as UserPref[];
    },
  });

  const merged = useMemo(() => {
    return categories.map((c, idx) => {
      const p = prefs.find((x) => x.category_id === c.id);
      return {
        category: c,
        pref: p ?? { user_id: userId!, category_id: c.id, display_order: idx, priority: 0 },
      };
    });
  }, [categories, prefs, userId]);

  const upsertPrefs = useMutation({
    mutationFn: async (items: UserPref[]) => {
      if (!userId) throw new Error("No user");
      const payload = items.map((i) => ({ ...i, user_id: userId }));
      const { error } = (supabase as any)
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
      const { data, error } = (supabase as any)
        .from("life_subcategories")
        .select("id, category_id, name");
      if (error) throw error;
      return data as LifeSubcategory[];
    },
  });

  const { data: pins = [] } = useQuery({
    queryKey: ["user_pins"],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = (supabase as any)
        .from("user_pinned_subcategories")
        .select("id, user_id, subcategory_id");
      if (error) throw error;
      return data as UserPin[];
    },
  });

  const togglePin = useMutation({
    mutationFn: async (subcatId: string) => {
      if (!userId) throw new Error("No user");
      const isPinned = pins.some((p) => p.subcategory_id === subcatId);
      if (isPinned) {
        const { error } = (supabase as any)
          .from("user_pinned_subcategories")
          .delete()
          .eq("subcategory_id", subcatId);
        if (error) throw error;
        return;
      }
      if (pins.length >= 3) throw new Error("You can pin up to 3 subcategories");
      const { error } = (supabase as any)
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
    setRows(merged.map(({ pref }) => ({ ...pref })));
  }, [merged.length]);

  const onChangeRow = (categoryId: string, patch: Partial<UserPref>) => {
    setRows((prev) => prev.map((r) => r.category_id === categoryId ? { ...r, ...patch } : r));
  };

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
            <p className="text-sm text-muted-foreground">Reorder categories, set priorities, and pin up to 3 subcategories</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline"><Link to="/profile">Account</Link></Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle>Categories order & priority</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-32">Order</TableHead>
                  <TableHead className="w-32">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow key={r.category_id}>
                    <TableCell>{categories.find(c=>c.id===r.category_id)?.name}</TableCell>
                    <TableCell>
                      <Input type="number" value={r.display_order} onChange={(e)=>onChangeRow(r.category_id, { display_order: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={r.priority} onChange={(e)=>onChangeRow(r.category_id, { priority: Number(e.target.value) })} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => upsertPrefs.mutate(rows)}>Save</Button>
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
