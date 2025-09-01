import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PageNav } from '@/components/ui/page-nav';
import { AdminMenu } from '@/components/AdminMenu';
import { 
  useEquipmentGripDefaults, 
  useCreateEquipmentGripDefault, 
  useDeleteEquipmentGripDefault, 
  useToggleEquipmentGripDefault 
} from '@/hooks/useEquipmentGripDefaults';
import { useGrips } from '@/hooks/useGrips';

const AdminEquipmentGripCompatibility = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedGrip, setSelectedGrip] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch data
  const { data: equipmentGripDefaults, isLoading: defaultsLoading } = useEquipmentGripDefaults();
  const { data: grips } = useGrips();

  // Fetch equipment
  const { data: equipment } = useQuery({
    queryKey: ['equipment-with-translations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select(`
          id,
          slug,
          equipment_type,
          translations:equipment_translations(
            name,
            description,
            language_code
          )
        `)
        .order('slug');

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const createMutation = useCreateEquipmentGripDefault();
  const deleteMutation = useDeleteEquipmentGripDefault();
  const toggleDefaultMutation = useToggleEquipmentGripDefault();

  // Helper functions
  const getEquipmentName = (equipmentId: string) => {
    const eq = equipment?.find(e => e.id === equipmentId);
    return eq?.translations?.[0]?.name || eq?.slug || 'Unknown Equipment';
  };

  const getGripName = (gripId: string) => {
    const grip = grips?.find(g => g.id === gripId);
    return grip?.name || 'Unknown Grip';
  };

  // Filter data
  const filteredDefaults = equipmentGripDefaults?.filter(def => {
    const equipmentName = getEquipmentName(def.equipment_id).toLowerCase();
    const gripName = getGripName(def.grip_id).toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return equipmentName.includes(search) || gripName.includes(search);
  }) || [];

  const handleCreateCompatibility = () => {
    if (selectedEquipment && selectedGrip) {
      createMutation.mutate({
        equipment_id: selectedEquipment,
        grip_id: selectedGrip,
        is_default: false
      });
      setSelectedEquipment('');
      setSelectedGrip('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleDeleteCompatibility = (equipmentId: string, gripId: string) => {
    deleteMutation.mutate({ equipment_id: equipmentId, grip_id: gripId });
  };

  const handleToggleDefault = (equipmentId: string, gripId: string, currentDefault: boolean) => {
    toggleDefaultMutation.mutate({
      equipment_id: equipmentId,
      grip_id: gripId,
      is_default: !currentDefault
    });
  };

  if (defaultsLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <PageNav 
        items={[
          { label: 'Admin', href: '/admin' },
          { label: 'Equipment-Grip Compatibility', href: '/admin/setup/equipment-grip-compatibility' }
        ]} 
      />
      
      <div className="flex gap-6">
        <AdminMenu />
        
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Equipment-Grip Compatibility</CardTitle>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Compatibility
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Equipment-Grip Compatibility</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="equipment">Equipment</Label>
                        <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select equipment" />
                          </SelectTrigger>
                          <SelectContent>
                            {equipment?.map((eq) => (
                              <SelectItem key={eq.id} value={eq.id}>
                                {getEquipmentName(eq.id)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="grip">Grip</Label>
                        <Select value={selectedGrip} onValueChange={setSelectedGrip}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grip" />
                          </SelectTrigger>
                          <SelectContent>
                            {grips?.map((grip) => (
                              <SelectItem key={grip.id} value={grip.id}>
                                {grip.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateCompatibility}
                          disabled={!selectedEquipment || !selectedGrip || createMutation.isPending}
                        >
                          {createMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Create
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Search equipment or grips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                
                <div className="border rounded-lg">
                  <div className="grid grid-cols-4 gap-4 p-4 font-medium bg-muted">
                    <div>Equipment</div>
                    <div>Grip</div>
                    <div>Default</div>
                    <div>Actions</div>
                  </div>
                  <Separator />
                  
                  {filteredDefaults.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No equipment-grip compatibilities found
                    </div>
                  ) : (
                    filteredDefaults.map((def) => (
                      <div key={`${def.equipment_id}-${def.grip_id}`} className="grid grid-cols-4 gap-4 p-4 border-b last:border-b-0">
                        <div>
                          <Badge variant="outline">
                            {getEquipmentName(def.equipment_id)}
                          </Badge>
                        </div>
                        <div>
                          <Badge variant="secondary">
                            {getGripName(def.grip_id)}
                          </Badge>
                        </div>
                        <div>
                          <Switch
                            checked={def.is_default}
                            onCheckedChange={() => handleToggleDefault(def.equipment_id, def.grip_id, def.is_default)}
                            disabled={toggleDefaultMutation.isPending}
                          />
                        </div>
                        <div>
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
                                  Are you sure you want to delete this equipment-grip compatibility? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCompatibility(def.equipment_id, def.grip_id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminEquipmentGripCompatibility;