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
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import AdminMenu from "@/admin/components/AdminMenu";

interface MovementPattern {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

const AdminMovementsManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<MovementPattern | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    document.title = "Movement Patterns | Admin";
  }, []);

  // Note: This is a demo implementation. In reality, you'd need a movement_patterns table
  const { data: movements = [], isLoading } = useQuery({
    queryKey: ["admin-movements"],
    queryFn: async () => {
      // Mock data for now - replace with actual database query when movement_patterns table is created
      return [
        { id: "1", name: "Press", slug: "press", description: "Pushing movements", created_at: new Date().toISOString() },
        { id: "2", name: "Pull", slug: "pull", description: "Pulling movements", created_at: new Date().toISOString() },
        { id: "3", name: "Squat", slug: "squat", description: "Squatting movements", created_at: new Date().toISOString() },
        { id: "4", name: "Hinge", slug: "hinge", description: "Hip hinge movements", created_at: new Date().toISOString() },
        { id: "5", name: "Carry", slug: "carry", description: "Loaded carries", created_at: new Date().toISOString() },
        { id: "6", name: "Row", slug: "row", description: "Rowing movements", created_at: new Date().toISOString() }
      ] as MovementPattern[];
    },
  });

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "" });
    setEditingMovement(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (movement: MovementPattern) => {
    setFormData({
      name: movement.name,
      slug: movement.slug,
      description: movement.description || "",
    });
    setEditingMovement(movement);
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

  const upsertMutation = useMutation({
    mutationFn: async (movement: Partial<MovementPattern>) => {
      toast({
        title: "Demo Mode",
        description: "Movement patterns management requires database table creation. This is a demonstration interface.",
        variant: "default"
      });
      throw new Error("Demo mode - no actual database operations");
    },
    onSuccess: () => {
      toast({
        title: editingMovement ? "Movement updated" : "Movement created",
        description: editingMovement 
          ? `Movement "${formData.name}" has been updated successfully.`
          : `Movement "${formData.name}" has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-movements"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Movement operation error:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      toast({
        title: "Demo Mode",
        description: "Movement patterns management requires database table creation.",
        variant: "default"
      });
      throw new Error("Demo mode");
    },
    onSuccess: () => {
      toast({
        title: "Movement deleted",
        description: "Movement pattern has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-movements"] });
    },
    onError: (error: any) => {
      console.error("Delete movement error:", error);
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

  const filteredMovements = movements.filter(movement =>
    movement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <CardTitle>Movement Patterns Management</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Movement Pattern
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingMovement ? "Edit Movement Pattern" : "Create Movement Pattern"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., Press, Pull, Squat"
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
                      placeholder="Brief description of this movement pattern"
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
                    <Button type="submit" disabled={upsertMutation.isPending}>
                      {upsertMutation.isPending ? "Saving..." : (editingMovement ? "Update" : "Create")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search movement patterns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Setup Required</h3>
            <p className="text-blue-800 text-sm">
              Movement patterns management requires a <code>movement_patterns</code> table to be created. 
              This interface shows example movement patterns that would be available once the database table is set up.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="font-medium">{movement.name}</TableCell>
                  <TableCell>
                    <code className="bg-muted px-2 py-1 rounded text-sm">{movement.slug}</code>
                  </TableCell>
                  <TableCell>{movement.description || "—"}</TableCell>
                  <TableCell>{new Date(movement.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(movement)}
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
                              Are you sure you want to delete "{movement.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(movement.id)}>
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

export default AdminMovementsManagement;