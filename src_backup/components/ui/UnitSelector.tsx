import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';
import type { WeightUnit } from '@/lib/weightConversion';

interface UnitSelectorProps {
  value: WeightUnit;
  onChange: (unit: WeightUnit) => void;
  disabled?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

export const UnitSelector: React.FC<UnitSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  size = 'default',
  className
}) => {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(newValue) => newValue && onChange(newValue as WeightUnit)}
      disabled={disabled}
      className={className}
      size={size}
    >
      <ToggleGroupItem value="kg" aria-label="Kilograms">
        kg
      </ToggleGroupItem>
      <ToggleGroupItem value="lb" aria-label="Pounds">
        lb
      </ToggleGroupItem>
    </ToggleGroup>
  );
};