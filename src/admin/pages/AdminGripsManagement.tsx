import React, { useState } from "react";
import PageNav from "@/components/PageNav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from '@/hooks/useTranslations';
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react";


interface Grip {
  id: string;
  slug: string;
  category: string;
  is_compatible_with?: any;
  created_at: string;
  translations: Record<string, { name: string; description?: string }> | null;
}

const AdminGripsManagement: React.FC = () => {
  const { getTranslatedName, getTranslatedDescription } = useTranslations();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingGrip, setEditingGrip] = useState<Grip | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    category: "",
    description: "",
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    document.title = "Grips Management | Admin";
  }, []);

  // Fetch grips with translations
  const { data: grips = [], isLoading } = useQuery({
    queryKey: ["admin-grips"],
    queryFn: async () => {
      const { data: gripsData, error: gripsError } = await supabase
        .from("grips")
        .select("*")
        .order("category", { ascending: true })
        .order("slug", { ascending: true });
      if (gripsError) throw gripsError;

      const { data: translationsData, error: translationsError } = await supabase
        .from("grips_translations")
        .select("*");
      if (translationsError) throw translationsError;

      // Combine grips with their translations
      return gripsData.map(grip => {
        const translations = translationsData
          .filter(t => t.grip_id === grip.id)
          .reduce((acc, t) => {
            acc[t.language_code] = {
              name: t.name,
              description: t.description
            };
            return acc;
          }, {} as Record<string, { name: string; description?: string }>);

        return {
          ...grip,
          translations
        };
      });
    },
  });

  // Create/Update grip mutation
  const upsertMutation = useMutation({
    mutationFn: async (grip: Partial<Grip> & { name: string; description?: string }) => {
      if (editingGrip) {
        const { data, error } = await supabase
          .from("grips")
          .update({
            slug: grip.slug,
            category: grip.category,
          })
          .eq("id", editingGrip.id)
          .select()
          .single();
        if (error) throw error;
        
        // Update English translation
        await supabase
          .from("grips_translations")
          .upsert({
            grip_id: editingGrip.id,
            language_code: "en",
            name: grip.name,
            description: grip.description || null,
          });
        
        return data;
      } else {
        const { data, error } = await supabase
          .from("grips")
          .insert({
            slug: grip.slug,
            category: grip.category,
          })
          .select()
          .single();
        if (error) throw error;
        
        // Insert English translation
        await supabase
          .from("grips_translations")
          .insert({
            grip_id: data.id,
            language_code: "en",
            name: grip.name,
            description: grip.description || null,
          });
        
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-grips"] });
      toast({
        title: editingGrip ? "Grip updated" : "Grip created",
        description: `Grip "${formData.name}" has been ${editingGrip ? "updated" : "created"} successfully.`,
      });
      resetForm();
    },
    onError: (error) => {
      console.error("[AdminGrips] Upsert error:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingGrip ? "update" : "create"} grip. Please try again.`,
        variant: "destructive",
      });
    },
  });

  // Delete grip mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("grips")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-grips"] });
      toast({
        title: "Grip deleted",
        description: "Grip has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("[AdminGrips] Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete grip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      category: "",
      description: "",
    });
    setEditingGrip(null);
    setIsCreateDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.slug.trim() || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    upsertMutation.mutate(formData);
  };

  const handleEdit = (grip: Grip) => {
    setEditingGrip(grip);
    setFormData({
      name: getTranslatedName(grip),
      slug: grip.slug,
      category: grip.category,
      description: getTranslatedDescription(grip) || "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (grip: Grip) => {
    console.log("[AdminGrips] Deleting grip:", getTranslatedName(grip));
    deleteMutation.mutate(grip.id);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      name: value,
      slug: generateSlug(value)
    }));
  };

  // Filter grips
  const filteredGrips = grips.filter(grip => {
    const name = getTranslatedName(grip);
    const description = getTranslatedDescription(grip) || "";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grip.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || grip.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Only orientation category now
  const categories = ["orientation"];
  const uniqueCategories = Array.from(new Set(grips.map(g => g.category)));

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      orientation: "bg-green-100 text-green-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <PageNav current="Admin / Others / Grips" />
      <main className="container py-8 space-y-6">
        
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Grips Management</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Grip
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGrip ? "Edit Grip" : "Create New Grip"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Close Grip"
                    disabled={upsertMutation.isPending}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g., close-grip"
                    disabled={upsertMutation.isPending}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    disabled={upsertMutation.isPending}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description of the grip..."
                    disabled={upsertMutation.isPending}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    type="submit" 
                    disabled={upsertMutation.isPending}
                    className="flex-1"
                  >
                    {upsertMutation.isPending ? "Saving..." : (editingGrip ? "Update" : "Create")}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    disabled={upsertMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search grips..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="min-w-[150px]">
                <Label htmlFor="category-filter">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {uniqueCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grips Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Grips ({filteredGrips.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading grips...</div>
            ) : filteredGrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || categoryFilter !== "all" ? "No grips match your filters." : "No grips found."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGrips.map((grip) => (
                    <TableRow key={grip.id}>
                      <TableCell className="font-medium">{getTranslatedName(grip)}</TableCell>
                      <TableCell className="font-mono text-sm">{grip.slug}</TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(grip.category)}>
                          {grip.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {getTranslatedDescription(grip) || "-"}
                      </TableCell>
                      <TableCell>
                        {new Date(grip.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(grip)}
                            disabled={upsertMutation.isPending}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Grip</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{getTranslatedName(grip)}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(grip)}>
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
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default AdminGripsManagement;