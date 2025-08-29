import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import AdminMenu from "../components/AdminMenu";
import PageNav from "@/components/PageNav";
import { useTranslations } from "@/hooks/useTranslations";

interface Equipment {
  id: string;
  slug?: string;
  created_at: string;
  translations: Record<string, { name: string; description?: string }> | null;
}

const AdminEquipmentManagement: React.FC = () => {
  const { t } = useTranslation();
  const { getTranslatedName } = useTranslations();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch equipment data with translations
  const { data: equipment = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ['admin-equipment'],
    queryFn: async () => {
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at');
      if (equipmentError) throw equipmentError;

      const { data: translationsData, error: translationsError } = await supabase
        .from('equipment_translations')
        .select('*');
      if (translationsError) throw translationsError;

      return equipmentData.map(equipment => {
        const translations = translationsData
          .filter(t => t.equipment_id === equipment.id)
          .reduce((acc, t) => {
            acc[t.language_code] = { name: t.name, description: t.description };
            return acc;
          }, {} as Record<string, { name: string; description?: string }>);

        return { ...equipment, translations };
      });
    },
  });

  // Form
  const equipmentForm = useForm({
    defaultValues: { name: '', slug: '' }
  });

  // Mutations
  const createEquipmentMutation = useMutation({
    mutationFn: async (data: { name: string; slug?: string }) => {
      // Create equipment
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .insert([{ 
          slug: data.slug 
        }])
        .select()
        .single();
      if (equipmentError) throw equipmentError;

      // Create English translation
      const { error: translationError } = await supabase
        .from('equipment_translations')
        .insert([{
          equipment_id: equipment.id,
          language_code: 'en',
          name: data.name
        }]);
      if (translationError) throw translationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-equipment'] });
      toast.success('Equipment created successfully');
      setIsDialogOpen(false);
      equipmentForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to create equipment: ' + error.message);
    }
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; slug?: string } }) => {
      // Update equipment
      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({ 
          slug: data.slug 
        })
        .eq('id', id);
      if (equipmentError) throw equipmentError;

      // Update English translation
      const { error: translationError } = await supabase
        .from('equipment_translations')
        .upsert({ 
          equipment_id: id,
          language_code: 'en',
          name: data.name 
        });
      if (translationError) throw translationError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-equipment'] });
      toast.success('Equipment updated successfully');
      setIsDialogOpen(false);
      setEditingItem(null);
      equipmentForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to update equipment: ' + error.message);
    }
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-equipment'] });
      toast.success('Equipment deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete equipment: ' + error.message);
    }
  });

  const handleEdit = (item: Equipment) => {
    setEditingItem(item);
    const name = getTranslatedName(item);
    equipmentForm.reset({ name, slug: item.slug || '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updateEquipmentMutation.mutate({ id: editingItem.id, data });
    } else {
      createEquipmentMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      deleteEquipmentMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  return (
    <main className="container py-8">
      <PageNav current="Admin / Others / Equipment" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Equipment Management</h1>
        <p className="text-muted-foreground">Manage exercise equipment</p>
      </div>

      <AdminMenu />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Equipment</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? 'Edit Equipment' : 'Create Equipment'}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...equipmentForm}>
                    <form onSubmit={equipmentForm.handleSubmit(handleSubmit)} className="space-y-4">
                      <FormField
                        control={equipmentForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Equipment name" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={equipmentForm.control}
                        name="slug"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slug (optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="equipment-slug" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2">
                        <Button type="submit" disabled={createEquipmentMutation.isPending || updateEquipmentMutation.isPending}>
                          {createEquipmentMutation.isPending || updateEquipmentMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {equipmentLoading ? (
              <div>Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {getTranslatedName(item)}
                      </TableCell>
                      <TableCell>{item.slug || '-'}</TableCell>
                      <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default AdminEquipmentManagement;