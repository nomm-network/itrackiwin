import React, { useState } from 'react';
import { useGymEquipment, useCreateGymEquipment, useUpdateGymEquipment, useDeleteGymEquipment } from '@/hooks/useGymEquipment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Dumbbell, Plus, Edit, Trash2 } from 'lucide-react';
import { GymInventoryTab } from './GymInventoryTab';
import { GymEquipmentProfilesTab } from './GymEquipmentProfilesTab';

interface GymEquipmentTabProps {
  gymId: string;
  isAdmin: boolean | null;
}

export default function GymEquipmentTab({ gymId, isAdmin }: GymEquipmentTabProps) {
  const { data: equipment, isLoading, error } = useGymEquipment(gymId);
  const createEquipment = useCreateGymEquipment();
  const updateEquipment = useUpdateGymEquipment();
  const deleteEquipment = useDeleteGymEquipment();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    loading_mode: 'plates',
    min_weight_kg: 0,
    max_weight_kg: 100,
    increment_kg: 2.5,
    count: 1,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      loading_mode: 'plates',
      min_weight_kg: 0,
      max_weight_kg: 100,
      increment_kg: 2.5,
      count: 1,
      notes: ''
    });
  };

  const handleCreateEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEquipment.mutateAsync({
        gym_id: gymId,
        equipment_id: crypto.randomUUID(),
        ...formData,
      });
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create equipment:', error);
    }
  };

  const getLoadingModeColor = (mode: string) => {
    switch (mode) {
      case 'plates':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'stack':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fixed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'bodyweight':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'band':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Equipment Profile Overrides */}
      <GymEquipmentProfilesTab gymId={gymId} />
      
      {/* Gym Inventory Management */}
      <GymInventoryTab gymId={gymId} isAdmin={isAdmin} />
      
      {/* Existing Equipment Management */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Gym Equipment</h3>
            <p className="text-sm text-muted-foreground">Configure equipment available at this gym</p>
          </div>
        
        {isAdmin && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Equipment</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateEquipment} className="space-y-4">
                <div>
                  <Label htmlFor="name">Equipment Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Barbell, Dumbbells"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createEquipment.isPending}>
                    {createEquipment.isPending ? 'Adding...' : 'Add Equipment'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading equipment...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && equipment && equipment.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-3">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium">No equipment configured</h3>
              <p className="text-muted-foreground">Add equipment to help coaches plan workouts.</p>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}