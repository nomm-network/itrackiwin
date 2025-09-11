import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Dumbbell, Weight } from 'lucide-react';
import { toast } from 'sonner';

interface GymInventoryTabProps {
  gymId: string;
  isAdmin: boolean | null;
}

interface GymInventoryItem {
  id: string;
  weight: number;
  quantity: number;
  unit: 'kg' | 'lb';
}

interface GymDumbbell extends GymInventoryItem {
  min_weight?: number;
  max_weight?: number;
}

interface GymBar {
  id: string;
  bar_type_id: string;
  quantity: number;
  bar_types: {
    name: string;
    default_weight: number;
    unit: 'kg' | 'lb';
  };
}

export const GymInventoryTab: React.FC<GymInventoryTabProps> = ({ gymId, isAdmin }) => {
  const queryClient = useQueryClient();
  const [newPlate, setNewPlate] = useState({ weight: '', quantity: '2', unit: 'kg' });
  const [newDumbbell, setNewDumbbell] = useState({ 
    minWeight: '', 
    maxWeight: '', 
    step: '2.5', 
    unit: 'kg' 
  });
  const [newBar, setNewBar] = useState({ barTypeId: '', quantity: '1' });

  // Fetch gym inventory
  const { data: gymInventory, isLoading } = useQuery({
    queryKey: ['gym-inventory', gymId],
    queryFn: async () => {
      const [platesRes, dumbbellsRes, barsRes] = await Promise.all([
        supabase.from('user_gym_plates').select('*').eq('user_gym_id', gymId),
        supabase.from('user_gym_dumbbells').select('*').eq('user_gym_id', gymId),
        supabase.from('user_gym_bars').select(`
          *,
          bar_types(name, default_weight, unit)
        `).eq('user_gym_id', gymId)
      ]);

      if (platesRes.error) throw platesRes.error;
      if (dumbbellsRes.error) throw dumbbellsRes.error;
      if (barsRes.error) throw barsRes.error;

      return {
        plates: platesRes.data || [],
        dumbbells: dumbbellsRes.data || [],
        bars: barsRes.data || []
      };
    }
  });

  // Fetch bar types for dropdown
  const { data: barTypes = [] } = useQuery({
    queryKey: ['bar-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bar_types')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Add plate mutation
  const addPlateMutation = useMutation({
    mutationFn: async ({ weight, quantity, unit }: { weight: number; quantity: number; unit: 'kg' | 'lb' }) => {
      const { error } = await supabase
        .from('user_gym_plates')
        .insert([{
          user_gym_id: gymId,
          weight,
          quantity,
          unit
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-inventory', gymId] });
      toast.success('Plate added to gym inventory');
      setNewPlate({ weight: '', quantity: '2', unit: 'kg' });
    }
  });

  // Add dumbbell set mutation
  const addDumbbellMutation = useMutation({
    mutationFn: async ({ minWeight, maxWeight, step, unit }: { minWeight: number; maxWeight: number; step: number; unit: 'kg' | 'lb' }) => {
      const dumbbells = [];
      for (let weight = minWeight; weight <= maxWeight; weight += step) {
        dumbbells.push({
          user_gym_id: gymId,
          weight: Math.round(weight * 4) / 4, // Round to nearest 0.25
          quantity: 2, // Pair
          unit
        });
      }

      const { error } = await supabase
        .from('user_gym_dumbbells')
        .insert(dumbbells);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-inventory', gymId] });
      toast.success('Dumbbell set added to gym inventory');
      setNewDumbbell({ minWeight: '', maxWeight: '', step: '2.5', unit: 'kg' });
    }
  });

  // Add bar mutation
  const addBarMutation = useMutation({
    mutationFn: async ({ barTypeId, quantity }: { barTypeId: string; quantity: number }) => {
      const { error } = await supabase
        .from('user_gym_bars')
        .insert([{
          user_gym_id: gymId,
          bar_type_id: barTypeId,
          quantity
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-inventory', gymId] });
      toast.success('Bar added to gym inventory');
      setNewBar({ barTypeId: '', quantity: '1' });
    }
  });

  // Remove mutations
  const removeItemMutation = useMutation({
    mutationFn: async ({ table, id }: { table: 'user_gym_plates' | 'user_gym_dumbbells' | 'user_gym_bars'; id: string }) => {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-inventory', gymId] });
      toast.success('Item removed from inventory');
    }
  });

  const handleAddPlate = async () => {
    const weight = parseFloat(newPlate.weight);
    const quantity = parseInt(newPlate.quantity);
    
    if (isNaN(weight) || weight <= 0 || isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter valid weight and quantity');
      return;
    }

    await addPlateMutation.mutateAsync({
      weight,
      quantity,
      unit: newPlate.unit as 'kg' | 'lb'
    });
  };

  const handleAddDumbbellSet = async () => {
    const minWeight = parseFloat(newDumbbell.minWeight);
    const maxWeight = parseFloat(newDumbbell.maxWeight);
    const step = parseFloat(newDumbbell.step);
    
    if (isNaN(minWeight) || isNaN(maxWeight) || isNaN(step) || 
        minWeight <= 0 || maxWeight <= minWeight || step <= 0) {
      toast.error('Please enter valid weight range and step');
      return;
    }

    await addDumbbellMutation.mutateAsync({
      minWeight,
      maxWeight,
      step,
      unit: newDumbbell.unit as 'kg' | 'lb'
    });
  };

  const handleAddBar = async () => {
    const quantity = parseInt(newBar.quantity);
    
    if (!newBar.barTypeId || isNaN(quantity) || quantity <= 0) {
      toast.error('Please select a bar type and enter valid quantity');
      return;
    }

    await addBarMutation.mutateAsync({
      barTypeId: newBar.barTypeId,
      quantity
    });
  };

  const commonPlates = {
    kg: [1.25, 2.5, 5, 10, 15, 20, 25],
    lb: [2.5, 5, 10, 25, 35, 45]
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">You need admin permissions to manage gym inventory.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Gym Inventory</h3>
        <p className="text-sm text-muted-foreground">
          Manage plates, dumbbells, and bars available at this gym
        </p>
      </div>

      <Tabs defaultValue="plates" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plates">Plates</TabsTrigger>
          <TabsTrigger value="dumbbells">Dumbbells</TabsTrigger>
          <TabsTrigger value="bars">Bars</TabsTrigger>
        </TabsList>

        <TabsContent value="plates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Plates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label>Unit</Label>
                    <Select 
                      value={newPlate.unit} 
                      onValueChange={(value) => setNewPlate({ ...newPlate, unit: value })}
                    >
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
                    <Label>Weight</Label>
                    <Input
                      type="number"
                      step="0.25"
                      value={newPlate.weight}
                      onChange={(e) => setNewPlate({ ...newPlate, weight: e.target.value })}
                      placeholder="2.5"
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
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

                <div className="space-y-2">
                  <Label>Quick Add Common Plates</Label>
                  <div className="flex gap-2 flex-wrap">
                    {commonPlates[newPlate.unit as 'kg' | 'lb'].map(weight => (
                      <Button
                        key={weight}
                        size="sm"
                        variant="outline"
                        onClick={() => addPlateMutation.mutate({
                          weight,
                          quantity: 2,
                          unit: newPlate.unit as 'kg' | 'lb'
                        })}
                        className="text-xs"
                      >
                        +{weight}{newPlate.unit}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            {gymInventory?.plates.map((plate) => (
              <Card key={plate.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{plate.weight}{plate.unit}</span>
                    <Badge variant="secondary">×{plate.quantity}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItemMutation.mutate({ 
                      table: 'user_gym_plates', 
                      id: plate.id 
                    })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dumbbells" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Dumbbell Set</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                <div>
                  <Label>Unit</Label>
                  <Select 
                    value={newDumbbell.unit} 
                    onValueChange={(value) => setNewDumbbell({ ...newDumbbell, unit: value })}
                  >
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
                  <Label>Min Weight</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={newDumbbell.minWeight}
                    onChange={(e) => setNewDumbbell({ ...newDumbbell, minWeight: e.target.value })}
                    placeholder="2.5"
                  />
                </div>
                <div>
                  <Label>Max Weight</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={newDumbbell.maxWeight}
                    onChange={(e) => setNewDumbbell({ ...newDumbbell, maxWeight: e.target.value })}
                    placeholder="50"
                  />
                </div>
                <div>
                  <Label>Step</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={newDumbbell.step}
                    onChange={(e) => setNewDumbbell({ ...newDumbbell, step: e.target.value })}
                    placeholder="2.5"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddDumbbellSet} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Set
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            {gymInventory?.dumbbells.map((dumbbell) => (
              <Card key={dumbbell.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{dumbbell.weight}{dumbbell.unit}</span>
                    <Badge variant="secondary">×{dumbbell.quantity}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItemMutation.mutate({ 
                      table: 'user_gym_dumbbells', 
                      id: dumbbell.id 
                    })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="bars" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add Bars</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Bar Type</Label>
                  <Select 
                    value={newBar.barTypeId} 
                    onValueChange={(value) => setNewBar({ ...newBar, barTypeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select bar type" />
                    </SelectTrigger>
                    <SelectContent>
                      {barTypes.map((barType) => (
                        <SelectItem key={barType.id} value={barType.id}>
                          {barType.name} ({barType.default_weight}{barType.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={newBar.quantity}
                    onChange={(e) => setNewBar({ ...newBar, quantity: e.target.value })}
                    placeholder="1"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddBar} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-2">
            {gymInventory?.bars.map((bar) => (
              <Card key={bar.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted-foreground rounded" />
                    <span className="font-medium">{bar.bar_types.name}</span>
                    <Badge variant="secondary">{bar.bar_types.default_weight}{bar.bar_types.unit}</Badge>
                    <Badge variant="outline">×{bar.quantity}</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItemMutation.mutate({ 
                      table: 'user_gym_bars', 
                      id: bar.id 
                    })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};