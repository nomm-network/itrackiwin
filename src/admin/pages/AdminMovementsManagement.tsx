import React, { useState } from "react";
import PageNav from "@/components/PageNav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from '@/hooks/useTranslations';
import { Plus, Edit, Trash2 } from "lucide-react";
import AdminMenu from "@/admin/components/AdminMenu";

interface MovementPattern {
  id: string;
  slug: string;
  created_at: string;
  updated_at: string;
  translations?: Record<string, { name: string; description?: string }>;
}

const AdminMovementsManagement: React.FC = () => {
  const { getTranslatedName } = useTranslations();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<MovementPattern | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    name_en: "",
    description_en: "",
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    document.title = "Movement Patterns | Admin";
  }, []);

  // Fetch movement patterns with translations
  const { data: movements = [], isLoading } = useQuery({
    queryKey: ["movement-patterns-with-translations"],
    queryFn: async () => {
      const { data: movementsData, error: movementsError } = await supabase
        .from("movement_patterns")
        .select("*")
        .order("slug");
      if (movementsError) throw movementsError;

      const { data: translationsData, error: translationsError } = await supabase
        .from("movement_patterns_translations")
        .select("*");
      if (translationsError) throw translationsError;

      return movementsData.map(movement => {
        const translations = translationsData
          .filter(t => t.movement_pattern_id === movement.id)
          .reduce((acc, t) => {
            acc[t.language_code] = { name: t.name, description: t.description };
            return acc;
          }, {} as Record<string, { name: string; description?: string }>);

        return { ...movement, translations };
      });
    },
  });

  const resetForm = () => {
    setFormData({ slug: "", name_en: "", description_en: "" });
    setEditingMovement(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (movement: MovementPattern) => {
    setEditingMovement(movement);
    setFormData({
      slug: movement.slug,
      name_en: movement.translations?.en?.name || "",
      description_en: movement.translations?.en?.description || "",
    });
    setIsEditDialogOpen(true);
  };

  // Create movement pattern
  const createMovementMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Create movement pattern
      const { data: movementData, error: movementError } = await supabase
        .from("movement_patterns")
        .insert({ slug: data.slug })
        .select()
        .single();
      if (movementError) throw movementError;

      // Create English translation
      const { error: translationError } = await supabase
        .from("movement_patterns_translations")
        .insert({
          movement_pattern_id: movementData.id,
          language_code: "en",
          name: data.name_en,
          description: data.description_en || null,
        });
      if (translationError) throw translationError;
    },
    onSuccess: () => {
      toast({
        title: "Movement pattern created",
        description: "Movement pattern has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["movement-patterns-with-translations"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Create movement error:", error);
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create movement pattern. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update movement pattern
  const updateMovementMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!editingMovement) return;

      // Update movement pattern
      const { error: movementError } = await supabase
        .from("movement_patterns")
        .update({ slug: data.slug })
        .eq("id", editingMovement.id);
      if (movementError) throw movementError;

      // Update English translation
      const { error: translationError } = await supabase
        .from("movement_patterns_translations")
        .upsert({
          movement_pattern_id: editingMovement.id,
          language_code: "en",
          name: data.name_en,
          description: data.description_en || null,
        });
      if (translationError) throw translationError;
    },
    onSuccess: () => {
      toast({
        title: "Movement pattern updated",
        description: "Movement pattern has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["movement-patterns-with-translations"] });
      setIsEditDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Update movement error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update movement pattern. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMovementMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("movement_patterns")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Movement pattern deleted",
        description: "Movement pattern has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["movement-patterns-with-translations"] });
    },
    onError: (error: any) => {
      console.error("Delete movement error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete movement pattern. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug || !formData.name_en) {
      toast({
        title: "Validation Error",
        description: "Please fill in slug and English name.",
        variant: "destructive",
      });
      return;
    }

    if (editingMovement) {
      updateMovementMutation.mutate(formData);
    } else {
      createMovementMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <main className="container py-6">
        <PageNav current="Admin / Setup / Movement Patterns" />
        <AdminMenu />
        <div className="flex items-center justify-center py-8">
          <p>Loading movement patterns...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-6">
      <PageNav current="Admin / Setup / Movement Patterns" />
      <AdminMenu />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Movement Patterns</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Movement Pattern
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Movement Pattern</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="press, row, squat..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="name_en">English Name</Label>
                    <Input
                      id="name_en"
                      value={formData.name_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                      placeholder="Press, Row, Squat..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="description_en">English Description</Label>
                    <Textarea
                      id="description_en"
                      value={formData.description_en}
                      onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                      placeholder="Description of the movement pattern..."
                      rows={3}
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
                    <Button type="submit" disabled={createMovementMutation.isPending}>
                      {createMovementMutation.isPending ? "Creating..." : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Movement patterns are fundamental movement types used to categorize exercises.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-mono text-sm">{movement.slug}</TableCell>
                  <TableCell className="font-medium">
                    {getTranslatedName(movement) || movement.slug}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {movement.translations?.en?.description || "-"}
                  </TableCell>
                  <TableCell>{new Date(movement.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(movement)}
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
                            <AlertDialogTitle>Delete Movement Pattern</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this movement pattern? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMovementMutation.mutate(movement.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {movements.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No movement patterns found. Add some to categorize exercises by movement type.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Movement Pattern</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit_slug">Slug</Label>
              <Input
                id="edit_slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="press, row, squat..."
              />
            </div>
            <div>
              <Label htmlFor="edit_name_en">English Name</Label>
              <Input
                id="edit_name_en"
                value={formData.name_en}
                onChange={(e) => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
                placeholder="Press, Row, Squat..."
              />
            </div>
            <div>
              <Label htmlFor="edit_description_en">English Description</Label>
              <Textarea
                id="edit_description_en"
                value={formData.description_en}
                onChange={(e) => setFormData(prev => ({ ...prev, description_en: e.target.value }))}
                placeholder="Description of the movement pattern..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMovementMutation.isPending}>
                {updateMovementMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default AdminMovementsManagement;