import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import PageNav from "@/components/PageNav";
import { useTranslations } from "@/hooks/useTranslations";

interface Equipment {
  id: string;
  slug?: string;
  created_at: string;
  configured: boolean;
  translations: Record<string, { name: string; description?: string }> | null;
}

const AdminEquipmentManagement: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getTranslatedName } = useTranslations();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [configuredFilter, setConfiguredFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  // Form for creating new equipment
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
      setIsAddDialogOpen(false);
      equipmentForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to create equipment: ' + error.message);
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
    navigate(`/admin/equipment/${item.id}/edit`);
  };

  const handleSubmit = (data: any) => {
    createEquipmentMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      deleteEquipmentMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setIsAddDialogOpen(true);
  };

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
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Equipment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Equipment</DialogTitle>
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
                       
                       <div className="flex justify-end gap-2">
                         <Button 
                           type="button" 
                           variant="outline" 
                           onClick={() => setIsAddDialogOpen(false)}
                         >
                           Cancel
                         </Button>
                         <Button 
                           type="submit" 
                           disabled={createEquipmentMutation.isPending}
                         >
                           {createEquipmentMutation.isPending ? 'Creating...' : 'Create Equipment'}
                         </Button>
                       </div>
                     </form>
                   </Form>
                 </DialogContent>
               </Dialog>
             </div>
           </CardHeader>
           <CardContent>
             <div className="space-y-4 mb-6">
               <div className="flex gap-4">
                 <div className="relative flex-1">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                   <Input
                     placeholder="Search equipment..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-10"
                   />
                 </div>
                 <Select value={configuredFilter} onValueChange={setConfiguredFilter}>
                   <SelectTrigger className="w-48">
                     <SelectValue placeholder="Filter by status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Equipment</SelectItem>
                     <SelectItem value="configured">Configured Only</SelectItem>
                     <SelectItem value="unconfigured">Unconfigured Only</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>

             {equipmentLoading ? (
               <div className="flex items-center justify-center py-8">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                 <span className="ml-2">Loading equipment...</span>
               </div>
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