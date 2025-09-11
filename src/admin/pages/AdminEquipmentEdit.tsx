import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import PageNav from "@/components/PageNav";
import { useTranslations } from "@/hooks/useTranslations";
import { useGrips } from "@/hooks/useGrips";
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

const AdminEquipmentEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getTranslatedName } = useTranslations();
  const queryClient = useQueryClient();
  const [selectedGripIds, setSelectedGripIds] = useState<string[]>([]);

  // Fetch equipment data with translations
  const { data: equipment, isLoading: equipmentLoading } = useQuery({
    queryKey: ['admin-equipment', id],
    queryFn: async () => {
      if (!id) throw new Error('Equipment ID is required');
      
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();
      if (equipmentError) throw equipmentError;

      const { data: translationsData, error: translationsError } = await supabase
        .from('equipment_translations')
        .select('*')
        .eq('equipment_id', id);
      if (translationsError) throw translationsError;

      const translations = translationsData
        .reduce((acc, t) => {
          acc[t.language_code] = { name: t.name, description: t.description };
          return acc;
        }, {} as Record<string, { name: string; description?: string }>);

      return { ...equipmentData, translations };
    },
    enabled: !!id
  });

  // Fetch grips data
  const { data: grips = [] } = useGrips();

  // Fetch equipment grips
  const { data: equipmentGrips = [] } = useQuery({
    queryKey: ['equipment-grips', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('equipment_grip_defaults')
        .select(`
          id,
          grip_id,
          is_default,
          grip:grips (id, slug, category)
        `)
        .eq('equipment_id', id);
      
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
    enabled: !!id
  });

  // Form
  const equipmentForm = useForm({
    defaultValues: { name: '', slug: '', configured: false },
    values: equipment ? {
      name: getTranslatedName(equipment),
      slug: equipment.slug || '',
      configured: equipment.configured || false
    } : undefined
  });

  // Update equipment mutation
  const updateEquipmentMutation = useMutation({
    mutationFn: async (data: { name: string; slug?: string; configured?: boolean }) => {
      if (!id) throw new Error('Equipment ID is required');
      
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
      queryClient.invalidateQueries({ queryKey: ['admin-equipment', id] });
      toast.success('Equipment updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update equipment: ' + error.message);
    }
  });

  // Delete equipment mutation
  const deleteEquipmentMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('Equipment ID is required');
      
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-equipment'] });
      toast.success('Equipment deleted successfully');
      navigate('/admin/equipment');
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
      queryClient.invalidateQueries({ queryKey: ['equipment-grips', id] });
      toast.success('Grips added successfully');
      setSelectedGripIds([]);
    },
    onError: (error) => {
      toast.error('Failed to add grips: ' + error.message);
    }
  });

  const removeGripMutation = useMutation({
    mutationFn: async (gripId: string) => {
      const { error } = await supabase
        .from('equipment_grip_defaults')
        .delete()
        .eq('id', gripId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-grips', id] });
      toast.success('Grip removed successfully');
    },
    onError: (error) => {
      toast.error('Failed to remove grip: ' + error.message);
    }
  });

  const toggleDefaultGripMutation = useMutation({
    mutationFn: async ({ gripId, isDefault }: { gripId: string; isDefault: boolean }) => {
      if (isDefault && id) {
        // First, clear all defaults for this equipment
        await supabase
          .from('equipment_grip_defaults')
          .update({ is_default: false })
          .eq('equipment_id', id);
      }

      // Then set the new default
      const { error } = await supabase
        .from('equipment_grip_defaults')
        .update({ is_default: isDefault })
        .eq('id', gripId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-grips', id] });
      toast.success('Default grip updated');
    },
    onError: (error) => {
      toast.error('Failed to update default grip: ' + error.message);
    }
  });

  const handleSubmit = (data: any) => {
    updateEquipmentMutation.mutate(data);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      deleteEquipmentMutation.mutate();
    }
  };

  const toggleGripSelection = (gripId: string) => {
    setSelectedGripIds(prev => 
      prev.includes(gripId)
        ? prev.filter(id => id !== gripId)
        : [...prev, gripId]
    );
  };

  const handleAddGrips = () => {
    if (id && selectedGripIds.length > 0) {
      addGripMutation.mutate({ equipmentId: id, gripIds: selectedGripIds });
    }
  };

  if (equipmentLoading) {
    return (
      <main className="container py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading equipment...</span>
        </div>
      </main>
    );
  }

  if (!equipment) {
    return (
      <main className="container py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-destructive">Equipment not found</h1>
          <Button onClick={() => navigate('/admin/equipment')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Equipment List
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-8 max-w-4xl">
      <PageNav current={`Admin / Equipment / ${getTranslatedName(equipment)}`} />
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Equipment</h1>
          <p className="text-muted-foreground">Configure equipment settings and profiles</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/equipment')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteEquipmentMutation.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...equipmentForm}>
              <form onSubmit={equipmentForm.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                
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
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={updateEquipmentMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateEquipmentMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Equipment Profiles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Equipment Profiles</CardTitle>
              <Link to="/admin/plates/profiles">
                <Button variant="outline" size="sm">
                  Manage Plate Profiles
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <EquipmentProfilesSection equipmentId={id!} />
          </CardContent>
        </Card>

        {/* Standard Plate Inventory */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Standard Plate Inventory</h3>
          <PlateInventorySection equipmentId={id!} />
        </div>

        {/* Default Stack Weights */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Default Stack Weights</h3>
          <StackWeightsSection equipmentId={id!} />
        </div>

        {/* Grip Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Grip Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {grips.map((grip) => {
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
                              addGripMutation.mutate({ equipmentId: id!, gripIds: [grip.id] });
                            } else {
                              if (equipmentGrip) {
                                removeGripMutation.mutate(equipmentGrip.id);
                              }
                            }
                          }}
                        />
                        <span className="text-sm">Allowed</span>
                      </div>
                      {isAllowed && (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isDefault}
                            onCheckedChange={(checked) => {
                              if (equipmentGrip) {
                                toggleDefaultGripMutation.mutate({ 
                                  gripId: equipmentGrip.id, 
                                  isDefault: !!checked 
                                });
                              }
                            }}
                          />
                          <span className="text-sm">Default</span>
                          {isDefault && <Badge variant="secondary">Default</Badge>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default AdminEquipmentEdit;