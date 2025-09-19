import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickWeightChipsProps {
  currentWeight: number | '';
  onWeightChange: (weight: number) => void;
  mode?: 'bodyweight' | 'loaded';
  assistMode?: 'added' | 'assist';
  equipmentIncrement?: number;
  className?: string;
}

export const QuickWeightChips: React.FC<QuickWeightChipsProps> = ({
  currentWeight,
  onWeightChange,
  mode = 'loaded',
  assistMode = 'added',
  equipmentIncrement = 2.5,
  className
}) => {
  const current = Number(currentWeight) || 0;

  // Different chip sets based on mode
  const getChips = () => {
    if (mode === 'bodyweight') {
      const baseChips = [0, 5, 10, 15, 20, 25];
      return baseChips.map(weight => ({
        value: weight,
        label: weight === 0 ? 'BW' : assistMode === 'assist' ? `${weight}kg` : `+${weight}kg`,
        isSelected: current === weight
      }));
    }

    // For loaded exercises, show incremental chips
    const increments = [-10, -5, -2.5, +2.5, +5, +10];
    return increments.map(increment => ({
      value: Math.max(0, current + increment),
      label: increment > 0 ? `+${increment}kg` : `${increment}kg`,
      isSelected: false,
      isIncrement: true
    }));
  };

  const chips = getChips();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm font-medium text-muted-foreground">
        {mode === 'bodyweight' ? 'Quick Weights' : 'Quick Adjustments'}
      </div>
      <div className="flex gap-1 flex-wrap -mx-1">{/* Reduced gap to fit on one row */}
        {chips.map((chip, index) => (
          <Button
            key={index}
            type="button"
            variant={chip.isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onWeightChange(chip.value)}
            className="text-xs px-2 h-7 min-w-0 flex-shrink-0" // Reduced padding
          >
            {chip.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickWeightChips;