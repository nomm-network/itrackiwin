import React, { useState, useMemo } from "react";
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
import { Pencil, Plus, Trash2, Search } from "lucide-react";

import PageNav from "@/components/PageNav";
import { useTranslations } from "@/hooks/useTranslations";
import { useGrips } from "@/hooks/useGrips";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlateInventorySection } from "@/components/equipment/PlateInventorySection";
import { StackWeightsSection } from "@/components/equipment/StackWeightsSection";
import { EquipmentProfilesSection } from "@/components/equipment/EquipmentProfilesSection";

interface Equipment {
  id: string;
  slug?: string;
  created_at: string;
  configured: boolean;
  translations: Record<string, { name: string; description?: string }> | null;
}

interface EquipmentGrip {
  id: string;
  grip_id: string;
  is_default: boolean;
  grip: {
    id: string;
    slug: string;
    category: string;
    name?: string;
  };
}

const AdminEquipmentManagement: React.FC = () => {
  const { t } = useTranslation();
  const { getTranslatedName } = useTranslations();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [configuredFilter, setConfiguredFilter] = useState<string>("all");
  const [selectedGripIds, setSelectedGripIds] = useState<string[]>([]);
  

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

  // Fetch grips data
  const { data: grips = [] } = useGrips();

  // Fetch equipment grips for editing item
  const { data: equipmentGrips = [] } = useQuery({
    queryKey: ['equipment-grips', editingItem?.id],
    queryFn: async () => {
      if (!editingItem?.id) return [];
      
      const { data, error } = await supabase
        .from('equipment_grip_defaults')
        .select(`
          id,
          grip_id,
          is_default,
          grip:grips (id, slug, category)
        `)
        .eq('equipment_id', editingItem.id);
      
      if (error) throw error;
      
      // Add names to grips
      return data.map(eg => ({
        ...eg,
        grip: {
          ...eg.grip,
          name: grips.find(g => g.id === eg.grip.id)?.name || eg.grip.slug
        }
      }));
    },
    enabled: !!editingItem?.id
  });

  // Filter equipment based on search term and configured status
  const filteredEquipment = useMemo(() => {
    let filtered = equipment;
    
    // Filter by configured status
    if (configuredFilter !== "all") {
      const isConfigured = configuredFilter === "configured";
      filtered = filtered.filter(item => item.configured === isConfigured);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const name = getTranslatedName(item).toLowerCase();
        const slug = (item.slug || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        
        return name.includes(search) || slug.includes(search);
      });
    }
    
    return filtered;
  }, [equipment, searchTerm, configuredFilter, getTranslatedName]);

  // Form
  const equipmentForm = useForm({
    defaultValues: { name: '', slug: '', configured: false }
  });

  // Mutations
  const createEquipmentMutation = useMutation({
    mutationFn: async (data: { name: string; slug?: string; configured?: boolean }) => {
      // If setting this equipment as configured, unset all others first
      if (data.configured) {
        const { error: unsetError } = await supabase
          .from('equipment')
          .update({ configured: false });
        if (unsetError) throw unsetError;
      }

      // Create equipment
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .insert([{ 
          slug: data.slug,
          configured: data.configured || false
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
    mutationFn: async ({ id, data }: { id: string; data: { name: string; slug?: string; configured?: boolean } }) => {
      // If setting this equipment as configured, unset all others first
      if (data.configured) {
        const { error: unsetError } = await supabase
          .from('equipment')
          .update({ configured: false })
          .neq('id', id);
        if (unsetError) throw unsetError;
      }

      // Update equipment
      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({ 
          slug: data.slug,
          configured: data.configured || false
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
        }, {
          onConflict: 'equipment_id,language_code'
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

  // Grip management mutations
  const addGripMutation = useMutation({
    mutationFn: async ({ equipmentId, gripIds }: { equipmentId: string; gripIds: string[] }) => {
      const mappings = gripIds.map(gripId => ({
        equipment_id: equipmentId,
        grip_id: gripId,
        is_default: false
      }));

      const { error } = await supabase
        .from('equipment_grip_defaults')
        .insert(mappings);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-grips', editingItem?.id] });
      toast.success('Grips added successfully');
      setSelectedGripIds([]);
    },
    onError: (error) => {
      toast.error('Failed to add grips: ' + error.message);
    }
  });

  const removeGripMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('equipment_grip_defaults')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-grips', editingItem?.id] });
      toast.success('Grip removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove grip: ' + error.message);
    }
  });

  const toggleDefaultGripMutation = useMutation({
    mutationFn: async ({ id, isDefault }: { id: string; isDefault: boolean }) => {
      if (isDefault) {
        // First, clear all defaults for this equipment
        await supabase
          .from('equipment_grip_defaults')
          .update({ is_default: false })
          .eq('equipment_id', editingItem!.id);
      }

      // Then set the new default
      const { error } = await supabase
        .from('equipment_grip_defaults')
        .update({ is_default: isDefault })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-grips', editingItem?.id] });
      toast.success('Default grip updated');
    },
    onError: (error) => {
      toast.error('Failed to update default grip: ' + error.message);
    }
  });

  const handleEdit = (item: Equipment) => {
    setEditingItem(item);
    const name = getTranslatedName(item);
    equipmentForm.reset({ name, slug: item.slug || '', configured: item.configured || false });
    setSelectedGripIds([]);
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
    setSelectedGripIds([]);
    setIsDialogOpen(true);
  };

  const toggleGripSelection = (gripId: string) => {
    setSelectedGripIds(prev => 
      prev.includes(gripId)
        ? prev.filter(id => id !== gripId)
        : [...prev, gripId]
    );
  };

  const handleAddGrips = () => {
    if (editingItem && selectedGripIds.length > 0) {
      addGripMutation.mutate({ equipmentId: editingItem.id, gripIds: selectedGripIds });
    }
  };

  const availableGrips = grips;

  return (
    <main className="container py-8">
      <PageNav current="Admin / Others / Equipment" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Equipment Management</h1>
        <p className="text-muted-foreground">Manage exercise equipment</p>
      </div>

      

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
                      <FormField
                        control={equipmentForm.control}
                        name="configured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Configured</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Mark as configured when all settings are complete
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                       />
                       
                        {editingItem && (
                          <>
                            <div className="space-y-4">
                              <h4 className="font-medium">Equipment Profiles</h4>
                              <EquipmentProfilesSection equipmentId={editingItem.id} />
                             </div>
                             
                            <div className="space-y-4">
                              <h4 className="font-medium">Standard Plate Inventory</h4>
                              <PlateInventorySection equipmentId={editingItem.id} />
                             </div>
                             
                             <div className="space-y-4">
                               <h4 className="font-medium">Default Stack Weights</h4>
                               <StackWeightsSection equipmentId={editingItem.id} />
                             </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Grip Configuration</h4>
                           
                              <div className="space-y-3">
                                {availableGrips.map((grip) => {
                                  const equipmentGrip = equipmentGrips.find(eg => eg.grip_id === grip.id);
                                  const isAllowed = !!equipmentGrip;
                                  const isDefault = equipmentGrip?.is_default || false;
                                  
                                  return (
                                    <div key={grip.id} className="flex items-center justify-between p-3 border rounded-md">
                                      <div className="font-medium">{grip.name}</div>
                                      <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            checked={isAllowed}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                addGripMutation.mutate({ equipmentId: editingItem.id, gripIds: [grip.id] });
                                              } else {
                                                if (equipmentGrip) {
                                                  removeGripMutation.mutate(equipmentGrip.id);
                                                }
                                              }
                                            }}
                                          />
                                          <label className="text-sm">Allowed</label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            checked={isDefault}
                                            disabled={!isAllowed}
                                            onCheckedChange={(checked) => {
                                              if (equipmentGrip) {
                                                toggleDefaultGripMutation.mutate({ 
                                                  id: equipmentGrip.id, 
                                                  isDefault: checked as boolean
                                                });
                                              }
                                            }}
                                          />
                                          <label className="text-sm">Default</label>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      
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
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search equipment..."
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
                  <SelectItem value="all">All Equipment</SelectItem>
                  <SelectItem value="configured">Configured</SelectItem>
                  <SelectItem value="not-configured">Not Configured</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {equipmentLoading ? (
              <div>Loading...</div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Configured</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                  {filteredEquipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {getTranslatedName(item)}
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">{item.slug}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.configured ? "default" : "secondary"}>
                          {item.configured ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
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