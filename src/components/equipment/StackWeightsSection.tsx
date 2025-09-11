import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface StackWeightsSectionProps {
  equipmentId: string;
}

export const StackWeightsSection: React.FC<StackWeightsSectionProps> = ({ equipmentId }) => {
  const queryClient = useQueryClient();
  const [newWeight, setNewWeight] = useState('');
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg');

  // Fetch equipment stack weights
  const { data: equipment } = useQuery({
    queryKey: ['equipment-stack-weights', equipmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('default_stack_weights, default_stack_unit')
        .eq('id', equipmentId)
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  // Update stack weights mutation
  const updateStackMutation = useMutation({
    mutationFn: async ({ weights, unit }: { weights: number[]; unit: 'kg' | 'lb' }) => {
      const { error } = await supabase
        .from('equipment')
        .update({
          default_stack_weights: weights,
          default_stack_unit: unit
        })
        .eq('id', equipmentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-stack-weights', equipmentId] });
      toast.success('Stack weights updated');
    }
  });

  const currentWeights = equipment?.default_stack_weights || [];
  const currentUnit = equipment?.default_stack_unit || 'kg';

  const handleAddWeight = () => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    const newWeights = [...currentWeights, weight].sort((a, b) => a - b);
    updateStackMutation.mutate({ weights: newWeights, unit });
    setNewWeight('');
  };

  const handleRemoveWeight = (weightToRemove: number) => {
    const newWeights = currentWeights.filter(w => w !== weightToRemove);
    updateStackMutation.mutate({ weights: newWeights, unit: currentUnit });
  };

  const handleUnitChange = (newUnit: 'kg' | 'lb') => {
    setUnit(newUnit);
    updateStackMutation.mutate({ weights: currentWeights, unit: newUnit });
  };

  const addCommonStack = (weights: number[]) => {
    const newWeights = [...new Set([...currentWeights, ...weights])].sort((a, b) => a - b);
    updateStackMutation.mutate({ weights: newWeights, unit });
  };

  const commonStacks = {
    kg: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
    lb: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200]
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Default Stack Weights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Unit</Label>
            <Select value={currentUnit} onValueChange={handleUnitChange}>
              <SelectTrigger className="bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-input shadow-lg z-50">
                <SelectItem value="kg">Kilograms</SelectItem>
                <SelectItem value="lb">Pounds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Weight</Label>
            <Input
              type="number"
              step={unit === 'kg' ? '2.5' : '5'}
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              placeholder={unit === 'kg' ? '20' : '45'}
              className="bg-background"
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleAddWeight} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Quick Add Common Stack</Label>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addCommonStack(commonStacks[unit])}
            className="w-full"
          >
            Add Standard {unit.toUpperCase()} Stack (5-100{unit})
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Current Stack Weights</Label>
          <div className="flex flex-wrap gap-2 min-h-[2rem] p-2 border rounded-md bg-muted/30">
            {currentWeights.length > 0 ? (
              currentWeights
                .sort((a, b) => a - b)
                .map((weight, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 bg-background"
                  >
                    {weight}{currentUnit}
                    <button
                      onClick={() => handleRemoveWeight(weight)}
                      className="ml-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
            ) : (
              <span className="text-sm text-muted-foreground">No stack weights configured</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};