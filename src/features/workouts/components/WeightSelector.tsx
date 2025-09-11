import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';
import { getAvailableWeights } from '@/lib/loading/equipmentResolver';

interface WeightSelectorProps {
  value?: number;
  onChange: (weight: number) => void;
  exerciseId?: string;
  loadType?: 'dual_load' | 'single_load' | 'stack';
  userId?: string;
  unit?: 'kg' | 'lb';
  maxWeight?: number;
  className?: string;
}

export const WeightSelector: React.FC<WeightSelectorProps> = ({
  value,
  onChange,
  exerciseId,
  loadType = 'dual_load',
  userId,
  unit = 'kg',
  maxWeight = 200,
  className
}) => {
  const [availableWeights, setAvailableWeights] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loadAvailableWeights = async () => {
      setIsLoading(true);
      try {
        const weights = await getAvailableWeights(
          loadType,
          exerciseId,
          userId,
          maxWeight,
          unit
        );
        setAvailableWeights(weights);
      } catch (error) {
        console.error('Error loading available weights:', error);
        setAvailableWeights([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadAvailableWeights();
    }
  }, [isOpen, loadType, exerciseId, userId, maxWeight, unit]);

  const handleWeightSelect = (weight: number) => {
    onChange(weight);
    setIsOpen(false);
  };

  const getLoadTypeLabel = () => {
    switch (loadType) {
      case 'dual_load': return 'Barbell';
      case 'single_load': return 'Dumbbell';
      case 'stack': return 'Stack';
      default: return 'Weight';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={className}
          disabled={isLoading}
        >
          <span className="flex items-center gap-2">
            {value ? `${value} ${unit}` : `Select ${getLoadTypeLabel()}`}
            <ChevronDown className="h-4 w-4" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2">
            <h4 className="font-medium">Available {getLoadTypeLabel()} Weights</h4>
            <Badge variant="outline">{unit}</Badge>
          </div>
          
          {isLoading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Loading available weights...
            </div>
          ) : availableWeights.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No weights available
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1 max-h-60 overflow-y-auto">
              {availableWeights.map((weight) => (
                <Button
                  key={weight}
                  variant={value === weight ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleWeightSelect(weight)}
                  className="text-xs"
                >
                  {weight}
                </Button>
              ))}
            </div>
          )}
          
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              {loadType === 'dual_load' && 'Weights shown include bar + plates'}
              {loadType === 'single_load' && 'Available dumbbell weights'}
              {loadType === 'stack' && 'Selectable stack positions'}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};