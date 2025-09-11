import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface PlateInventorySectionProps {
  equipmentId: string;
}

interface PlateProfile {
  id: string;
  default_unit: 'kg' | 'lb';
  name: string;
  plate_profile_plates: { weight_kg: number; count_per_side: number; }[];
}

export const PlateInventorySection: React.FC<PlateInventorySectionProps> = ({ equipmentId }) => {
  const queryClient = useQueryClient();
  const [newPlate, setNewPlate] = useState({ weight: '', quantity: '2' });
  const [selectedUnit, setSelectedUnit] = useState<'kg' | 'lb'>('kg');

  // Fetch plate profiles for this equipment
  const { data: plateProfiles = [] } = useQuery({
    queryKey: ['equipment-plate-profiles', equipmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plate_profiles')
        .select(`
          id,
          default_unit,
          name,
          plate_profile_plates(weight_kg, count_per_side)
        `)
        .eq('name', `equipment_${equipmentId}`);
      
      if (error) throw error;
      
      return data;
    }
  });

  // Create plate profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async ({ unit }: { unit: 'kg' | 'lb' }) => {
      const { data, error } = await supabase
        .from('plate_profiles')
        .insert([{
          name: `equipment_${equipmentId}_${unit}`,
          default_unit: unit,
          is_active: true
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-plate-profiles', equipmentId] });
      toast.success('Plate profile created');
    }
  });

  // Add plate mutation
  const addPlateMutation = useMutation({
    mutationFn: async ({ profileId, weight, quantity }: { profileId: string; weight: number; quantity: number }) => {
      const { error } = await supabase
        .from('plate_profile_plates')
        .insert([{
          profile_id: profileId,
          weight_kg: weight,
          count_per_side: quantity
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-plate-profiles', equipmentId] });
      toast.success('Plate added to inventory');
      setNewPlate({ weight: '', quantity: '2' });
    }
  });

  // Remove plate mutation
  const removePlateMutation = useMutation({
    mutationFn: async ({ profileId, weight }: { profileId: string; weight: number }) => {
      const { error } = await supabase
        .from('plate_profile_plates')
        .delete()
        .eq('profile_id', profileId)
        .eq('weight_kg', weight);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-plate-profiles', equipmentId] });
      toast.success('Plate removed from inventory');
    }
  });

  const getProfileForUnit = (unit: 'kg' | 'lb') => {
    return plateProfiles.find(p => p.default_unit === unit);
  };

  const handleCreateProfile = async () => {
    if (!getProfileForUnit(selectedUnit)) {
      await createProfileMutation.mutateAsync({ unit: selectedUnit });
    }
  };

  const handleAddPlate = async () => {
    const weight = parseFloat(newPlate.weight);
    const quantity = parseInt(newPlate.quantity);
    
    if (isNaN(weight) || weight <= 0 || isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter valid weight and quantity');
      return;
    }

    let profile = getProfileForUnit(selectedUnit);
    
    if (!profile) {
      const newProfile = await createProfileMutation.mutateAsync({ unit: selectedUnit });
      profile = { ...newProfile, plate_profile_plates: [] };
    }

    await addPlateMutation.mutateAsync({
      profileId: profile.id,
      weight,
      quantity
    });
  };

  const handleRemovePlate = async (profileId: string, weight: number) => {
    await removePlateMutation.mutateAsync({ profileId, weight });
  };

  const commonPlates = {
    kg: [1.25, 2.5, 5, 10, 15, 20, 25],
    lb: [2.5, 5, 10, 25, 35, 45]
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Kilogram Plates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Kilogram Plates</span>
              {!getProfileForUnit('kg') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUnit('kg');
                    handleCreateProfile();
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Profile
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getProfileForUnit('kg') ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {getProfileForUnit('kg')!.plate_profile_plates
                    .sort((a, b) => a.weight_kg - b.weight_kg)
                    .map((plate, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {plate.weight_kg}kg (×{plate.count_per_side})
                        <button
                          onClick={() => handleRemovePlate(getProfileForUnit('kg')!.id, plate.weight_kg)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {commonPlates.kg.map(weight => {
                    const exists = getProfileForUnit('kg')!.plate_profile_plates.some(p => p.weight_kg === weight);
                    return !exists ? (
                      <Button
                        key={weight}
                        size="sm"
                        variant="outline"
                        onClick={() => addPlateMutation.mutate({
                          profileId: getProfileForUnit('kg')!.id,
                          weight,
                          quantity: 2
                        })}
                        className="text-xs px-2 py-1 h-auto"
                      >
                        +{weight}kg
                      </Button>
                    ) : null;
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No kg plate profile configured</p>
            )}
          </CardContent>
        </Card>

        {/* Pound Plates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Pound Plates</span>
              {!getProfileForUnit('lb') && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedUnit('lb');
                    handleCreateProfile();
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Profile
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getProfileForUnit('lb') ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {getProfileForUnit('lb')!.plate_profile_plates
                    .sort((a, b) => a.weight_kg - b.weight_kg)
                    .map((plate, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {plate.weight_kg}lb (×{plate.count_per_side})
                        <button
                          onClick={() => handleRemovePlate(getProfileForUnit('lb')!.id, plate.weight_kg)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {commonPlates.lb.map(weight => {
                    const exists = getProfileForUnit('lb')!.plate_profile_plates.some(p => p.weight_kg === weight);
                    return !exists ? (
                      <Button
                        key={weight}
                        size="sm"
                        variant="outline"
                        onClick={() => addPlateMutation.mutate({
                          profileId: getProfileForUnit('lb')!.id,
                          weight,
                          quantity: 2
                        })}
                        className="text-xs px-2 py-1 h-auto"
                      >
                        +{weight}lb
                      </Button>
                    ) : null;
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No lb plate profile configured</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Custom Plate Addition */}
      <Card>
        <CardHeader>
          <CardTitle>Add Custom Plate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <Label htmlFor="unit-select">Unit</Label>
              <Select value={selectedUnit} onValueChange={(value: 'kg' | 'lb') => setSelectedUnit(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms</SelectItem>
                  <SelectItem value="lb">Pounds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="plate-weight">Weight</Label>
              <Input
                id="plate-weight"
                type="number"
                step="0.25"
                value={newPlate.weight}
                onChange={(e) => setNewPlate({ ...newPlate, weight: e.target.value })}
                placeholder="2.5"
              />
            </div>
            <div>
              <Label htmlFor="plate-quantity">Quantity</Label>
              <Input
                id="plate-quantity"
                type="number"
                value={newPlate.quantity}
                onChange={(e) => setNewPlate({ ...newPlate, quantity: e.target.value })}
                placeholder="2"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddPlate} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};