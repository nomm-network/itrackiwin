import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface BilateralSetInputProps {
  weight: number | '';
  reps: number | '';
  onWeightChange: (value: number) => void;
  onRepsChange: (value: number) => void;
  className?: string;
  unit?: string;
}

const BilateralSetInput: React.FC<BilateralSetInputProps> = ({
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  className,
  unit = 'kg'
}) => {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <div>
        <Label htmlFor="weight" className="text-sm font-medium text-muted-foreground">
          Weight ({unit})
        </Label>
        <Input
          id="weight"
          type="number"
          placeholder="0"
          value={weight}
          onChange={(e) => onWeightChange(Number(e.target.value))}
          className="text-center"
        />
      </div>
      <div>
        <Label htmlFor="reps" className="text-sm font-medium text-muted-foreground">
          Reps
        </Label>
        <Input
          id="reps"
          type="number"
          placeholder="0"
          value={reps}
          onChange={(e) => onRepsChange(Number(e.target.value))}
          className="text-center"
        />
      </div>
    </div>
  );
};

export default BilateralSetInput;