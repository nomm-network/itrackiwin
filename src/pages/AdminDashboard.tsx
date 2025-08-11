import React, { useMemo, useState } from "react";
import PageNav from "@/components/PageNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LifeCategory { id: string; slug: string; name: string; icon?: string | null; color?: string | null; display_order: number; }
interface LifeSubcategory { id: string; category_id: string; slug: string | null; name: string; display_order: number; }

const AdminDashboard: React.FC = () => {
  React.useEffect(() => {
    document.title = "Admin | I Track I Win";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Admin dashboard for managing life categories and subcategories');
  }, []);

  const qc = useQueryClient();

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["life_categories"],
    queryFn: async () => {
      const { data, error } = (supabase as any)
        .from("life_categories")
        .select("id, slug, name, icon, color, display_order")
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as LifeCategory[];
    },
  });

  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const selectedCat = useMemo(() => categories.find(c => c.id === selectedCatId) || categories[0] || null, [categories, selectedCatId]);

  const { data: subcategories = [], isLoading: subLoading } = useQuery({
    queryKey: ["life_subcategories", selectedCat?.id],
    enabled: !!selectedCat,
    queryFn: async () => {
      const { data, error } = (supabase as any)
        .from("life_subcategories")
        .select("id, category_id, slug, name, display_order")
        .eq("category_id", selectedCat!.id)
        .order("display_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return data as LifeSubcategory[];
    },
  });

  const upsertCategory = useMutation({
    mutationFn: async (payload: Partial<LifeCategory>) => {
      const { data, error } = (supabase as any)
        .from("life_categories")
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as LifeCategory;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["life_categories"] }); toast.success("Saved category"); },
    onError: (e: any) => toast.error(e.message || "Failed to save"),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = (supabase as any)
        .from("life_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["life_categories"] }); toast.success("Deleted category"); },
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  });

  const upsertSubcategory = useMutation({
    mutationFn: async (payload: Partial<LifeSubcategory>) => {
      const { data, error } = (supabase as any)
        .from("life_subcategories")
        .upsert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as LifeSubcategory;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["life_subcategories", selectedCat?.id] }); toast.success("Saved subcategory"); },
    onError: (e: any) => toast.error(e.message || "Failed to save"),
  });

  const deleteSubcategory = useMutation({
    mutationFn: async (id: string) => {
      const { error } = (supabase as any)
        .from("life_subcategories")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["life_subcategories", selectedCat?.id] }); toast.success("Deleted subcategory"); },
    onError: (e: any) => toast.error(e.message || "Failed to delete"),
  });

  // Form state
  const [catForm, setCatForm] = useState<Partial<LifeCategory>>({});
  const [subForm, setSubForm] = useState<Partial<LifeSubcategory>>({});

  return (
    <main>
      <PageNav current="Admin" />
      <section className="container py-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-4">Manage life categories and subcategories</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Categories</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">Add Category</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{catForm.id ? "Edit" : "Add"} Category</DialogTitle></DialogHeader>
                  <div className="grid gap-3 py-2">
                    <Input placeholder="Slug" value={catForm.slug || ""} onChange={e=>setCatForm({...catForm, slug: e.target.value})} />
                    <Input placeholder="Name" value={catForm.name || ""} onChange={e=>setCatForm({...catForm, name: e.target.value})} />
                    <Input placeholder="Icon (emoji)" value={catForm.icon || ""} onChange={e=>setCatForm({...catForm, icon: e.target.value})} />
                    <Input placeholder="Color (HSL e.g. 152 76% 66%)" value={catForm.color || ""} onChange={e=>setCatForm({...catForm, color: e.target.value})} />
                    <Input type="number" placeholder="Display order" value={catForm.display_order ?? 0} onChange={e=>setCatForm({...catForm, display_order: Number(e.target.value)})} />
                  </div>
                  <DialogFooter>
                    <Button onClick={() => { upsertCategory.mutate(catForm); setCatForm({}); }}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!catLoading && categories.map((c) => (
                    <TableRow key={c.id} className={selectedCat?.id===c.id?"bg-muted/40":""} onClick={()=>setSelectedCatId(c.id)}>
                      <TableCell className="w-16">{c.display_order}</TableCell>
                      <TableCell>{c.slug}</TableCell>
                      <TableCell>{c.name}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={(e)=>{e.stopPropagation(); setCatForm(c);}}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={(e)=>{e.stopPropagation(); if(confirm('Delete category?')) deleteCategory.mutate(c.id);}}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Subcategories {selectedCat ? `for ${selectedCat.name}` : ""}</CardTitle>
              {selectedCat && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">Add Subcategory</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{subForm.id ? "Edit" : "Add"} Subcategory</DialogTitle></DialogHeader>
                    <div className="grid gap-3 py-2">
                      <Input placeholder="Slug (optional)" value={subForm.slug || ""} onChange={e=>setSubForm({...subForm, slug: e.target.value})} />
                      <Input placeholder="Name" value={subForm.name || ""} onChange={e=>setSubForm({...subForm, name: e.target.value})} />
                      <Input type="number" placeholder="Display order" value={subForm.display_order ?? 0} onChange={e=>setSubForm({...subForm, display_order: Number(e.target.value)})} />
                    </div>
                    <DialogFooter>
                      <Button onClick={() => { if(!selectedCat) return; upsertSubcategory.mutate({ ...subForm, category_id: selectedCat.id }); setSubForm({}); }}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {selectedCat ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!subLoading && subcategories.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="w-16">{s.display_order}</TableCell>
                        <TableCell>{s.slug}</TableCell>
                        <TableCell>{s.name}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={()=>setSubForm(s)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={()=>{ if(confirm('Delete subcategory?')) deleteSubcategory.mutate(s.id); }}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">Select a category to manage its subcategories.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboard;
