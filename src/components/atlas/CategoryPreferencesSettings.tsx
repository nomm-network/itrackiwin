import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GripVertical, Settings } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface LifeCategory { 
  id: string; 
  slug: string; 
  translations: Record<string, { name: string; description?: string }> | null; 
  display_order: number; 
}

interface UserPref { 
  id?: string; 
  user_id: string; 
  category_id: string; 
  display_order: number;
  selected_coach_id?: string;
  is_enabled: boolean;
  nav_pinned: boolean;
}

interface LifeSubcategory { 
  id: string; 
  category_id: string; 
  translations: Record<string, { name: string; description?: string }> | null; 
}

interface UserPin { 
  id?: string; 
  user_id: string; 
  subcategory_id: string; 
}

export function CategoryPreferencesSettings() {
  const { user } = useAuth();
  const { getTranslatedName } = useTranslations();
  const qc = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["life_categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_categories_with_translations")
        .select("id, slug, translations, display_order")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as LifeCategory[];
    },
  });

  const { data: prefs = [] } = useQuery({
    queryKey: ["user_category_prefs"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_category_prefs")
        .select("*");
      if (error) throw error;
      return (data ?? []) as UserPref[];
    },
  });

  const { data: allSubcats = [] } = useQuery({
    queryKey: ["life_subcategories_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v_subcategories_with_translations")
        .select("id, category_id, translations");
      if (error) throw error;
      return (data ?? []) as LifeSubcategory[];
    },
  });

  const { data: pins = [] } = useQuery({
    queryKey: ["user_pins"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_pinned_subcategories")
        .select("id, user_id, subcategory_id");
      if (error) throw error;
      return (data ?? []) as UserPin[];
    },
  });

  const upsertPrefs = useMutation({
    mutationFn: async (items: UserPref[]) => {
      if (!user) throw new Error("No user");
      const payload = items.map((i) => ({ ...i, user_id: user.id }));
      const { error } = await supabase
        .from("user_category_prefs")
        .upsert(payload, { onConflict: "user_id,category_id" });
      if (error) throw error;
    },
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ["user_category_prefs"] }); 
      qc.invalidateQueries({ queryKey: ["user-priorities"] });
      qc.invalidateQueries({ queryKey: ["bottom-nav"] });
      toast.success("Preferences saved"); 
    },
    onError: (e: any) => toast.error(e.message || "Failed to save"),
  });

  const togglePin = useMutation({
    mutationFn: async (subcatId: string) => {
      if (!user) throw new Error("No user");
      const isPinned = pins.some((p) => p.subcategory_id === subcatId);
      if (isPinned) {
        const { error } = await supabase
          .from("user_pinned_subcategories")
          .delete()
          .eq("subcategory_id", subcatId);
        if (error) throw error;
        return;
      }
      if (pins.length >= 3) throw new Error("You can pin up to 3 subcategories");
      const { error } = await supabase
        .from("user_pinned_subcategories")
        .insert({ user_id: user.id, subcategory_id: subcatId });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["user_pins"] }); },
    onError: (e: any) => toast.error(e.message || "Failed to update pins"),
  });

  // Local editable state
  const [rows, setRows] = useState<UserPref[]>([]);
  React.useEffect(() => {
    const items: UserPref[] = categories.map((c, idx) => {
      const p = prefs.find((x) => x.category_id === c.id);
      return {
        ...(p ?? { 
          user_id: user?.id!, 
          category_id: c.id, 
          display_order: idx + 1,
          is_enabled: true,
          nav_pinned: false 
        }),
      } as UserPref;
    });
    items.sort((a, b) => a.display_order - b.display_order);
    setRows(items);
  }, [categories, prefs, user?.id]);

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

  const handleNavPinToggle = (categoryId: string, pinned: boolean) => {
    setRows((prev) => prev.map((r) => 
      r.category_id === categoryId 
        ? { ...r, nav_pinned: pinned, is_enabled: pinned } 
        : r
    ));
  };

  const pinnedCount = rows.filter(r => r.nav_pinned).length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Category Preferences</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Navigation & Priority</CardTitle>
              <p className="text-sm text-muted-foreground">
                Drag to reorder priorities and select which categories appear in navigation (max 3)
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Order</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-32">In Navigation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, idx) => {
                    const c = categories.find((x) => x.id === r.category_id);
                    const canPin = pinnedCount < 3 || r.nav_pinned;
                    
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
                            <span>{c ? getTranslatedName(c) : 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            checked={r.nav_pinned}
                            disabled={!canPin && !r.nav_pinned}
                            onCheckedChange={(checked) => 
                              handleNavPinToggle(r.category_id, !!checked)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {pinnedCount >= 3 && (
                <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg mt-4">
                  Maximum of 3 categories can be pinned. Unpin a category to add a different one.
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Button onClick={() => upsertPrefs.mutate(rows.map((r, i) => ({ ...r, display_order: i + 1 })))}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pinned Subcategories (max 3)</CardTitle>
              <p className="text-sm text-muted-foreground">
                Pin your most important subcategories for quick access
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {categories.map((c) => (
                  <div key={c.id}>
                    <div className="font-medium mb-2">{getTranslatedName(c)}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {(subByCat[c.id] || []).map((s) => {
                        const isPinned = pins.some((p) => p.subcategory_id === s.id);
                        const disabled = !isPinned && pins.length >= 3;
                        return (
                          <label 
                            key={s.id} 
                            className={`flex items-center gap-2 rounded border p-2 cursor-pointer hover:bg-muted/50 ${
                              disabled ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                          >
                            <Checkbox 
                              checked={isPinned} 
                              disabled={disabled} 
                              onCheckedChange={() => togglePin.mutate(s.id)} 
                            />
                            <span className="text-sm">{getTranslatedName(s)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}