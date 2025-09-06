import React, { useState } from "react";
import PageNav from "@/components/PageNav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, Plus, Edit, Trash2, Tag } from "lucide-react";
import AdminMenu from "@/admin/components/AdminMenu";

interface ExerciseAlias {
  id: string;
  exercise_id: string;
  alias: string;
  created_at: string;
  exercise?: {
    id: string;
    slug: string;
    display_name?: string;
  };
}

const AdminTagsAliasesManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("aliases");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlias, setEditingAlias] = useState<ExerciseAlias | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    exercise_id: "",
    alias: "",
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    document.title = "Tags & Aliases Management | Admin";
  }, []);

  // Fetch exercises for dropdown
  const { data: exercises = [] } = useQuery({
    queryKey: ["exercises-for-aliases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercises")
        .select("id, slug, display_name")
        .eq("is_public", true)
        .order("display_name");
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch exercise aliases
  const { data: aliases = [], isLoading } = useQuery({
    queryKey: ["exercise-aliases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exercise_aliases")
        .select(`
          *,
          exercise:exercise_id (id, slug, display_name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const resetForm = () => {
    setFormData({ exercise_id: "", alias: "" });
    setEditingAlias(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (alias: ExerciseAlias) => {
    setFormData({
      exercise_id: alias.exercise_id,
      alias: alias.alias,
    });
    setEditingAlias(alias);
    setIsCreateDialogOpen(true);
  };

  // Create/Update alias mutation
  const upsertAliasMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (editingAlias) {
        const { error } = await supabase
          .from("exercise_aliases")
          .update({
            exercise_id: data.exercise_id,
            alias: data.alias,
          })
          .eq("id", editingAlias.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("exercise_aliases")
          .insert({
            exercise_id: data.exercise_id,
            alias: data.alias,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: editingAlias ? "Alias updated" : "Alias created",
        description: editingAlias 
          ? `Alias "${formData.alias}" has been updated successfully.`
          : `Alias "${formData.alias}" has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["exercise-aliases"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Alias operation error:", error);
      toast({
        title: "Operation failed",
        description: error.message || "Failed to save alias. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAliasMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("exercise_aliases")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Alias deleted",
        description: "Exercise alias has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["exercise-aliases"] });
    },
    onError: (error: any) => {
      console.error("Delete alias error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete alias. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.exercise_id || !formData.alias.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select an exercise and enter an alias.",
        variant: "destructive",
      });
      return;
    }
    upsertAliasMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    deleteAliasMutation.mutate(id);
  };

  const filteredAliases = aliases.filter(alias =>
    alias.alias.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alias.exercise?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alias.exercise?.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    return exercise?.display_name || exercise?.slug || "Unknown Exercise";
  };

  if (isLoading) {
    return (
      <main className="container py-6">
        <PageNav current="Admin / Setup / Tags & Aliases" />
        <AdminMenu />
        <div className="flex items-center justify-center py-8">
          <p>Loading tags and aliases...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-6">
      <PageNav current="Admin / Setup / Tags & Aliases" />
      <AdminMenu />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Tags & Aliases Management</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Alias
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingAlias ? "Edit Exercise Alias" : "Create Exercise Alias"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="exercise">Exercise</Label>
                    <Select
                      value={formData.exercise_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, exercise_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        {exercises.map((exercise) => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.display_name || exercise.slug}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="alias">Alias</Label>
                    <Input
                      id="alias"
                      value={formData.alias}
                      onChange={(e) => setFormData(prev => ({ ...prev, alias: e.target.value }))}
                      placeholder="e.g., Close Grip Bench, CG Bench"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Alternative names that users might search for this exercise
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={upsertAliasMutation.isPending}>
                      {upsertAliasMutation.isPending ? "Saving..." : (editingAlias ? "Update" : "Create")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full max-w-md">
              <TabsTrigger value="aliases">Exercise Aliases</TabsTrigger>
              <TabsTrigger value="tags">Exercise Tags (Future)</TabsTrigger>
            </TabsList>

            <TabsContent value="aliases" className="mt-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search aliases or exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exercise</TableHead>
                    <TableHead>Alias</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAliases.map((alias) => (
                    <TableRow key={alias.id}>
                      <TableCell className="font-medium">
                        {alias.exercise?.display_name || alias.exercise?.slug || "Unknown Exercise"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {alias.alias}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(alias.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(alias)}
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
                                <AlertDialogTitle>Delete Exercise Alias</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the alias "{alias.alias}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(alias.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAliases.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No aliases found. Create some to help users find exercises with alternative names.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="tags" className="mt-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-amber-600" />
                  <h3 className="font-medium text-amber-900">Exercise Tags - Coming Soon</h3>
                </div>
                <p className="text-amber-800 text-sm">
                  Exercise tags will allow categorizing exercises with custom labels like "compound", "isolation", 
                  "beginner-friendly", etc. This feature will be implemented after the core exercise system is complete.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminTagsAliasesManagement;