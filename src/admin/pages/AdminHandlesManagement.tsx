import React, { useState } from "react";
import PageNav from "@/components/PageNav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from '@/hooks/useTranslations';
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import AdminMenu from "@/admin/components/AdminMenu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Handle {
  id: string;
  slug: string;
  created_at: string;
  configured: boolean;
  translations: Record<string, { name: string; description?: string }> | null;
}

const AdminHandlesManagement: React.FC = () => {
  const { getTranslatedName, getTranslatedDescription } = useTranslations();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingHandle, setEditingHandle] = useState<Handle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [configuredFilter, setConfiguredFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    configured: false,
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    document.title = "Handles Management | Admin";
  }, []);

  // Fetch handles with translations
  const { data: handles = [], isLoading } = useQuery({
    queryKey: ["admin-handles"],
    queryFn: async () => {
      const { data: handlesData, error: handlesError } = await supabase
        .from("handles")
        .select("*")
        .order("slug", { ascending: true });
      if (handlesError) throw handlesError;

      const { data: translationsData, error: translationsError } = await supabase
        .from("handles_translations")
        .select("*");
      if (translationsError) throw translationsError;

      // Combine handles with their translations
      return handlesData.map(handle => {
        const translations = translationsData
          .filter(t => t.handle_id === handle.id)
          .reduce((acc, t) => {
            acc[t.language_code] = {
              name: t.name,
              description: t.description
            };
            return acc;
          }, {} as Record<string, { name: string; description?: string }>);

        return {
          ...handle,
          translations
        };
      });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", configured: false });
    setEditingHandle(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (handle: Handle) => {
    const englishTranslation = handle.translations?.['en'];
    setFormData({
      name: englishTranslation?.name || "",
      slug: handle.slug,
      description: englishTranslation?.description || "",
      configured: handle.configured || false,
    });
    setEditingHandle(handle);
    setIsCreateDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  // Create/Update handle mutation
  const upsertMutation = useMutation({
    mutationFn: async (handle: Partial<Handle> & { name: string; description?: string; configured?: boolean }) => {
      if (editingHandle) {
        const { data, error } = await supabase
          .from("handles")
          .update({ 
            slug: handle.slug,
            configured: handle.configured || false
          })
          .eq("id", editingHandle.id)
          .select()
          .single();
        if (error) throw error;
        
        // Update English translation
        await supabase
          .from("handles_translations")
          .upsert({
            handle_id: editingHandle.id,
            language_code: "en",
            name: handle.name,
            description: handle.description || null,
          });
        
        return data;
      } else {
        const { data, error } = await supabase
          .from("handles")
          .insert({ 
            slug: handle.slug,
            configured: handle.configured || false
          })
          .select()
          .single();
        if (error) throw error;

        // Create English translation
        await supabase
          .from("handles_translations")
          .insert({
            handle_id: data.id,
            language_code: "en",
            name: handle.name,
            description: handle.description || null,
          });
        
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: editingHandle ? "Handle updated" : "Handle created",
        description: editingHandle 
          ? `Handle "${formData.name}" has been updated successfully.`
          : `Handle "${formData.name}" has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-handles"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Handle operation error:", error);
      toast({
        title: "Operation failed",
        description: error.message || "Failed to save handle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("handles")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Handle deleted",
        description: "Handle has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-handles"] });
    },
    onError: (error: any) => {
      console.error("Delete handle error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete handle. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and slug are required.",
        variant: "destructive",
      });
      return;
    }
    upsertMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const filteredHandles = handles.filter(handle => {
    // Filter by configured status
    if (configuredFilter !== "all") {
      const isConfigured = configuredFilter === "configured";
      if (handle.configured !== isConfigured) return false;
    }
    
    // Filter by search term
    const name = getTranslatedName(handle) || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           handle.slug.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <main className="container py-6">
        <PageNav current="Admin / Setup / Handles" />
        <AdminMenu />
        <div className="flex items-center justify-center py-8">
          <p>Loading handles...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-6">
      <PageNav current="Admin / Setup / Handles" />
      <AdminMenu />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Handles Management</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Handle
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingHandle ? "Edit Handle" : "Create Handle"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., Straight Bar, EZ Bar, Rope"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="Auto-generated from name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this handle type"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label className="text-base">Configured</Label>
                      <div className="text-sm text-muted-foreground">
                        Mark as configured when all settings are complete
                      </div>
                    </div>
                    <Switch
                      checked={formData.configured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, configured: checked }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={upsertMutation.isPending}>
                      {upsertMutation.isPending ? "Saving..." : (editingHandle ? "Update" : "Create")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search handles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={configuredFilter} onValueChange={setConfiguredFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by configured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Handles</SelectItem>
                <SelectItem value="configured">Configured</SelectItem>
                <SelectItem value="not-configured">Not Configured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Configured</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHandles.map((handle) => (
                <TableRow key={handle.id}>
                  <TableCell className="font-medium">
                    {getTranslatedName(handle) || "Unnamed"}
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{handle.slug}</code>
                  </TableCell>
                  <TableCell>
                    {getTranslatedDescription(handle) || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={handle.configured ? "default" : "secondary"}>
                      {handle.configured ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(handle.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(handle)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Handle</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{getTranslatedName(handle)}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(handle.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminHandlesManagement;