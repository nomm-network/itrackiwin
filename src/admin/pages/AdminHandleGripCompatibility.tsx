import React, { useState } from "react";
import PageNav from "@/components/PageNav";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from '@/hooks/useTranslations';
import { Plus, Trash2 } from "lucide-react";
import AdminMenu from "@/admin/components/AdminMenu";

const AdminHandleGripCompatibility: React.FC = () => {
  const { getTranslatedName } = useTranslations();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    handle_id: "",
    grip_id: "",
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    document.title = "Handle-Grip Compatibility | Admin";
  }, []);

  // Fetch handles
  const { data: handles = [] } = useQuery({
    queryKey: ["handles-with-translations"],
    queryFn: async () => {
      const { data: handlesData, error: handlesError } = await supabase
        .from("handles")
        .select("*")
        .order("slug");
      if (handlesError) throw handlesError;

      const { data: translationsData, error: translationsError } = await supabase
        .from("handle_translations")
        .select("*");
      if (translationsError) throw translationsError;

      return handlesData.map(handle => {
        const translations = translationsData
          .filter(t => t.handle_id === handle.id)
          .reduce((acc, t) => {
            acc[t.language_code] = { name: t.name, description: t.description };
            return acc;
          }, {} as Record<string, { name: string; description?: string }>);

        return { ...handle, translations };
      });
    },
  });

  // Fetch grips
  const { data: grips = [] } = useQuery({
    queryKey: ["grips-with-translations"],
    queryFn: async () => {
      const { data: gripsData, error: gripsError } = await supabase
        .from("grips")
        .select("*")
        .order("slug");
      if (gripsError) throw gripsError;

      const { data: translationsData, error: translationsError } = await supabase
        .from("grips_translations")
        .select("*");
      if (translationsError) throw translationsError;

      return gripsData.map(grip => {
        const translations = translationsData
          .filter(t => t.grip_id === grip.id)
          .reduce((acc, t) => {
            acc[t.language_code] = { name: t.name, description: t.description };
            return acc;
          }, {} as Record<string, { name: string; description?: string }>);

        return { ...grip, translations };
      });
    },
  });

  // Fetch handle-grip compatibility
  const { data: handleGrips = [], isLoading } = useQuery({
    queryKey: ["handle-grip-compatibility"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("handle_grip_compatibility")
        .select("handle_id, grip_id")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const resetForm = () => {
    setFormData({ handle_id: "", grip_id: "" });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Create handle-grip compatibility
  const createCompatibilityMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("handle_grip_compatibility")
        .insert({
          handle_id: data.handle_id,
          grip_id: data.grip_id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Compatibility created",
        description: "Handle-grip compatibility has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["handle-grip-compatibility"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error("Create compatibility error:", error);
      toast({
        title: "Creation failed",
        description: error.message || "Failed to create compatibility. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCompatibilityMutation = useMutation({
    mutationFn: async ({ handle_id, grip_id }: { handle_id: string; grip_id: string }) => {
      const { error } = await supabase
        .from("handle_grip_compatibility")
        .delete()
        .eq("handle_id", handle_id)
        .eq("grip_id", grip_id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Compatibility deleted",
        description: "Handle-grip compatibility has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["handle-grip-compatibility"] });
    },
    onError: (error: any) => {
      console.error("Delete compatibility error:", error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete compatibility. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.handle_id || !formData.grip_id) {
      toast({
        title: "Validation Error",
        description: "Please select both handle and grip.",
        variant: "destructive",
      });
      return;
    }
    createCompatibilityMutation.mutate(formData);
  };

  const getHandleName = (handleId: string) => {
    const handle = handles.find(h => h.id === handleId);
    return handle ? getTranslatedName(handle) : "Unknown Handle";
  };

  const getGripName = (gripId: string) => {
    const grip = grips.find(g => g.id === gripId);
    return grip ? getTranslatedName(grip) : "Unknown Grip";
  };

  if (isLoading) {
    return (
      <main className="container py-6">
        <PageNav current="Admin / Setup / Handle-Grip Compatibility" />
        <AdminMenu />
        <div className="flex items-center justify-center py-8">
          <p>Loading compatibility data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-6">
      <PageNav current="Admin / Setup / Handle-Grip Compatibility" />
      <AdminMenu />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Handle-Grip Compatibility</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Compatibility
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Handle-Grip Compatibility</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="handle">Handle</Label>
                    <Select
                      value={formData.handle_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, handle_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select handle" />
                      </SelectTrigger>
                      <SelectContent>
                        {handles.map((handle) => (
                          <SelectItem key={handle.id} value={handle.id}>
                            {getTranslatedName(handle) || handle.slug}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="grip">Grip</Label>
                    <Select
                      value={formData.grip_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, grip_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grip" />
                      </SelectTrigger>
                      <SelectContent>
                        {grips.map((grip) => (
                          <SelectItem key={grip.id} value={grip.id}>
                            {getTranslatedName(grip) || grip.slug}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCompatibilityMutation.isPending}>
                      {createCompatibilityMutation.isPending ? "Creating..." : "Create"}
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
              Define which grip orientations are possible with each handle. This determines 
              which grip options appear when creating exercises with specific handles.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Handle</TableHead>
                <TableHead>Grip</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {handleGrips.map((item) => (
                <TableRow key={`${item.handle_id}-${item.grip_id}`}>
                  <TableCell className="font-medium">
                    {getHandleName(item.handle_id)}
                  </TableCell>
                  <TableCell>{getGripName(item.grip_id)}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Compatibility</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this compatibility rule? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => 
                            deleteCompatibilityMutation.mutate({
                              handle_id: item.handle_id,
                              grip_id: item.grip_id
                            })
                          }>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
              {handleGrips.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No compatibility rules found. Add some to define which grips work with which handles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminHandleGripCompatibility;