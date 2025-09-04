import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Copy, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SideInputProps {
  label: string;
  weight: number | '';
  reps: number | '';
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  className?: string;
}

const SideInput: React.FC<SideInputProps> = ({
  label,
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  className
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${label.toLowerCase()}-weight`} className="sr-only">Weight</Label>
          <Input
            id={`${label.toLowerCase()}-weight`}
            type="number"
            placeholder="kg"
            value={weight}
            onChange={(e) => onWeightChange(Number(e.target.value))}
            className="text-center"
          />
        </div>
        <div>
          <Label htmlFor={`${label.toLowerCase()}-reps`} className="sr-only">Reps</Label>
          <Input
            id={`${label.toLowerCase()}-reps`}
            type="number"
            placeholder="reps"
            value={reps}
            onChange={(e) => onRepsChange(Number(e.target.value))}
            className="text-center"
          />
        </div>
      </div>
    </div>
  );
};

interface UnilateralSetInputProps {
  leftWeight: number | '';
  leftReps: number | '';
  rightWeight: number | '';
  rightReps: number | '';
  onLeftWeightChange: (value: number) => void;
  onLeftRepsChange: (value: number) => void;
  onRightWeightChange: (value: number) => void;
  onRightRepsChange: (value: number) => void;
  isAlternating?: boolean;
  onToggleAlternating?: () => void;
  className?: string;
}

const UnilateralSetInput: React.FC<UnilateralSetInputProps> = ({
  leftWeight,
  leftReps,
  rightWeight,
  rightReps,
  onLeftWeightChange,
  onLeftRepsChange,
  onRightWeightChange,
  onRightRepsChange,
  isAlternating = false,
  onToggleAlternating,
  className
}) => {
  const copyLeftToRight = () => {
    if (typeof leftWeight === 'number') onRightWeightChange(leftWeight);
    if (typeof leftReps === 'number') onRightRepsChange(leftReps);
  };

  const copyRightToLeft = () => {
    if (typeof rightWeight === 'number') onLeftWeightChange(rightWeight);
    if (typeof rightReps === 'number') onLeftRepsChange(rightReps);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">Per Side</span>
        {isAlternating && (
          <div className="flex items-center gap-1 text-xs text-primary">
            <ArrowLeftRight className="w-3 h-3" />
            Alternating
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <SideInput
          label="Left"
          weight={leftWeight}
          reps={leftReps}
          onWeightChange={onLeftWeightChange}
          onRepsChange={onLeftRepsChange}
        />
        
        <SideInput
          label="Right"
          weight={rightWeight}
          reps={rightReps}
          onWeightChange={onRightWeightChange}
          onRepsChange={onRightRepsChange}
        />
      </div>

      <div className="flex gap-2 justify-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={copyLeftToRight}
          className="text-xs"
          disabled={!leftWeight && !leftReps}
        >
          <Copy className="w-3 h-3 mr-1" />
          L→R
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={copyRightToLeft}
          className="text-xs"
          disabled={!rightWeight && !rightReps}
        >
          <Copy className="w-3 h-3 mr-1" />
          R→L
        </Button>
      </div>
    </div>
  );
};

export default UnilateralSetInput;