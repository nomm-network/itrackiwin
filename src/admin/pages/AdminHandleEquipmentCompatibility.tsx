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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from '@/hooks/useTranslations';
import { Plus, Trash2 } from "lucide-react";
import AdminMenu from "@/admin/components/AdminMenu";

const AdminHandleEquipmentCompatibility: React.FC = () => {
  const { getTranslatedName } = useTranslations();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    handle_id: "",
    equipment_id: "",
    is_default: false,
  });

  const queryClient = useQueryClient();

  React.useEffect(() => {
    document.title = "Handle-Equipment Compatibility | Admin";
  }, []);

  // Fetch equipment
  const { data: equipment = [] } = useQuery({
    queryKey: ["equipment-with-translations"],
    queryFn: async () => {
      const { data: equipmentData, error: equipmentError } = await supabase
        .from("equipment")
        .select("*")
        .order("slug");
      if (equipmentError) throw equipmentError;

      const { data: translationsData, error: translationsError } = await supabase
        .from("equipment_translations")
        .select("*");
      if (translationsError) throw translationsError;

      return equipmentData.map(equipment => {
        const translations = translationsData
          .filter(t => t.equipment_id === equipment.id)
          .reduce((acc, t) => {
            acc[t.language_code] = { name: t.name, description: t.description };
            return acc;
          }, {} as Record<string, { name: string; description?: string }>);

        return { ...equipment, translations, name: translations.en?.name || equipment.slug };
      });
    },
  });

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
        .from("handles_translations")
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

  // Fetch handle-equipment compatibility
  const { data: handleEquipment = [], isLoading } = useQuery({
    queryKey: ["handle-equipment"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("handle_equipment")
        .select("handle_id, equipment_id, is_default")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const resetForm = () => {
    setFormData({ handle_id: "", equipment_id: "", is_default: false });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Create handle-equipment compatibility
  const createCompatibilityMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("handle_equipment")
        .insert({
          handle_id: data.handle_id,
          equipment_id: data.equipment_id,
          is_default: data.is_default,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Compatibility created",
        description: "Handle-equipment compatibility has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["handle-equipment"] });
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
    mutationFn: async ({ handle_id, equipment_id }: { handle_id: string; equipment_id: string }) => {
      const { error } = await supabase
        .from("handle_equipment")
        .delete()
        .eq("handle_id", handle_id)
        .eq("equipment_id", equipment_id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Compatibility deleted",
        description: "Handle-equipment compatibility has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["handle-equipment"] });
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

  const toggleDefaultMutation = useMutation({
    mutationFn: async ({ handle_id, equipment_id, isDefault }: { handle_id: string; equipment_id: string; isDefault: boolean }) => {
      const { error } = await supabase
        .from("handle_equipment")
        .update({ is_default: isDefault })
        .eq("handle_id", handle_id)
        .eq("equipment_id", equipment_id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["handle-equipment"] });
    },
    onError: (error: any) => {
      console.error("Toggle default error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update default status.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.handle_id || !formData.equipment_id) {
      toast({
        title: "Validation Error",
        description: "Please select both handle and equipment.",
        variant: "destructive",
      });
      return;
    }
    createCompatibilityMutation.mutate(formData);
  };

  const getEquipmentName = (equipmentId: string) => {
    const eq = equipment.find(e => e.id === equipmentId);
    return eq?.name || "Unknown Equipment";
  };

  const getHandleName = (handleId: string) => {
    const handle = handles.find(h => h.id === handleId);
    return handle ? getTranslatedName(handle) : "Unknown Handle";
  };

  if (isLoading) {
    return (
      <main className="container py-6">
        <PageNav current="Admin / Setup / Handle-Equipment Compatibility" />
        <AdminMenu />
        <div className="flex items-center justify-center py-8">
          <p>Loading compatibility data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-6">
      <PageNav current="Admin / Setup / Handle-Equipment Compatibility" />
      <AdminMenu />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Handle-Equipment Compatibility</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Compatibility
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Handle-Equipment Compatibility</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="equipment">Equipment</Label>
                    <Select
                      value={formData.equipment_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, equipment_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipment.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id}>
                            {(eq as any).name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_default"
                      checked={formData.is_default}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_default: checked }))}
                    />
                    <Label htmlFor="is_default">Set as default handle for this equipment</Label>
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
              Define which handles are compatible with each piece of equipment. This controls 
              which handles appear when creating exercises with specific equipment.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipment</TableHead>
                <TableHead>Handle</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {handleEquipment.map((item, index) => (
                <TableRow key={`${item.handle_id}-${item.equipment_id}`}>
                  <TableCell className="font-medium">
                    {getEquipmentName(item.equipment_id)}
                  </TableCell>
                  <TableCell>{getHandleName(item.handle_id)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={item.is_default}
                        onCheckedChange={(checked) => 
                          toggleDefaultMutation.mutate({ 
                            handle_id: item.handle_id, 
                            equipment_id: item.equipment_id, 
                            isDefault: checked 
                          })
                        }
                        disabled={toggleDefaultMutation.isPending}
                      />
                      {item.is_default && <span className="text-xs text-muted-foreground">Default</span>}
                    </div>
                  </TableCell>
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
                              equipment_id: item.equipment_id
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
              {handleEquipment.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No compatibility rules found. Add some to define which handles work with which equipment.
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

export default AdminHandleEquipmentCompatibility;