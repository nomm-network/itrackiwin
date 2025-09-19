import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
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
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    setRows((prev) => {
      const next = [...prev];
      const [moved] = next.splice(sourceIndex, 1);
      next.splice(destinationIndex, 0, moved);
      return next.map((r, idx) => ({ ...r, display_order: idx + 1 }));
    });
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

  const handleNavPinToggle = (categoryId: string, pinned: boolean) => {
    // This function is no longer used since we auto-pin top 3
  };

  // Auto-pin top 3 categories based on display order
  React.useEffect(() => {
    setRows((prev) => prev.map((r, idx) => ({
      ...r,
      nav_pinned: idx < 3, // Automatically pin top 3
      is_enabled: idx < 3 || r.is_enabled // Enable if pinned or already enabled
    })));
  }, [categories]);

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
                Drag to reorder priorities. The top 3 categories will automatically appear in navigation.
              </p>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Order</TableHead>
                      <TableHead>Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <Droppable droppableId="categories">
                    {(provided) => (
                      <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                        {rows.map((r, idx) => {
                          const c = categories.find((x) => x.id === r.category_id);
                          const isInTopThree = idx < 3;
                          
                          return (
                            <Draggable key={r.category_id} draggableId={r.category_id} index={idx}>
                              {(provided, snapshot) => (
                                <TableRow
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={cn(
                                    "cursor-grab",
                                    isInTopThree && "bg-primary/5 border-l-4 border-l-primary",
                                    snapshot.isDragging && "bg-muted/50"
                                  )}
                                >
                                  <TableCell className="font-mono">{idx + 1}.</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                      <span>{c ? getTranslatedName(c) : 'Unknown'}</span>
                                      {isInTopThree && (
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                                          In Navigation
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </TableBody>
                    )}
                  </Droppable>
                </Table>
              </DragDropContext>
              
              <div className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg mt-4">
                The top 3 categories in your priority list will automatically appear in the bottom navigation.
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={() => upsertPrefs.mutate(rows.map((r, i) => ({ ...r, display_order: i + 1, nav_pinned: i < 3, is_enabled: i < 3 || r.is_enabled })))}>
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