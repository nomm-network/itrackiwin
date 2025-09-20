// workout-flow-v0.7.0 (SOT) – DO NOT DUPLICATE
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PerSideToggleProps {
  mode: 'per_side' | 'total';
  onModeChange: (mode: 'per_side' | 'total') => void;
  equipmentType?: string;
  className?: string;
}

export const PerSideToggle: React.FC<PerSideToggleProps> = ({
  mode,
  onModeChange,
  equipmentType,
  className
}) => {
  // Determine default mode based on equipment
  const getDefaultMode = (equipment?: string): 'per_side' | 'total' => {
    if (!equipment) return 'total';
    
    const lower = equipment.toLowerCase();
    if (lower.includes('dumbbell') || lower.includes('cable')) {
      return 'per_side';
    }
    return 'total';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">Weight entry:</span>
      <div className="flex bg-muted rounded-md p-1">
        <Button
          type="button"
          variant={mode === 'per_side' ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange('per_side')}
          className="text-xs px-3 h-7"
        >
          Per-side
        </Button>
        <Button
          type="button"
          variant={mode === 'total' ? "default" : "ghost"}
          size="sm"
          onClick={() => onModeChange('total')}
          className="text-xs px-3 h-7"
        >
          Total
        </Button>
      </div>
    </div>
  );
};

export default PerSideToggle;