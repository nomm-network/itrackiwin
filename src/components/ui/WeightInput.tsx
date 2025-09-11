import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDisplayUnit } from '@/hooks/useWorkoutUnit';
import { convertWeight, roundWeight, formatDualWeight, createWeightData, type WeightUnit, type WeightData } from '@/lib/weightConversion';
import { useUserProfile } from '@/hooks/useUserProfile';
import { fetchEffectivePlates } from '@/lib/equipment/api';
import { closestLoad, makeIncrementTable } from '@/lib/equipment/resolve';
import { useMyGym } from '@/features/health/fitness/hooks/useMyGym.hook';

interface WeightInputProps {
  value?: number;
  onChange: (weightData: WeightData) => void;
  workoutId?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  showDualDisplay?: boolean;
}

export const WeightInput: React.FC<WeightInputProps> = ({
  value,
  onChange,
  workoutId,
  className,
  placeholder = "0",
  disabled = false,
  showDualDisplay = true
}) => {
  const { data: userProfile } = useUserProfile();
  const { gym } = useMyGym();
  const displayUnit = useDisplayUnit(workoutId);
  const [inputValue, setInputValue] = useState<string>('');
  const [plateProfile, setPlateProfile] = useState<any>(null);
  
  const userDefaultUnit = userProfile?.default_unit || 'kg';
  const showDual = showDualDisplay && displayUnit !== userDefaultUnit;

  // Load equipment profile for weight validation
  useEffect(() => {
    const loadPlateProfile = async () => {
      if (gym?.id) {
        const profile = await fetchEffectivePlates(gym.id, displayUnit);
        setPlateProfile(profile);
      }
    };
    loadPlateProfile();
  }, [gym?.id, displayUnit]);

  // Initialize input value from prop
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numericValue = parseFloat(newValue);
    if (!isNaN(numericValue) && numericValue > 0) {
      // Snap to closest achievable weight if plate profile is available
      let adjustedWeight = numericValue;
      if (plateProfile) {
        adjustedWeight = closestLoad(numericValue, 'barbell', plateProfile);
      }
      
      const weightData = createWeightData(adjustedWeight, displayUnit);
      onChange(weightData);
      
      // Update input to show the snapped weight
      if (adjustedWeight !== numericValue) {
        setInputValue(adjustedWeight.toString());
      }
    }
  };

  const getDualDisplayText = () => {
    if (!showDual || !value) return null;
    
    // Convert current input to kg, then show dual format
    const weightKg = convertWeight(value, displayUnit, 'kg');
    return formatDualWeight(weightKg, userDefaultUnit, displayUnit);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor="weight" className="text-sm font-medium text-muted-foreground">
          Weight
        </Label>
        <Badge variant="outline" className="text-xs">
          {displayUnit}
        </Badge>
      </div>
      
      <Input
        id="weight"
        type="number"
        step={displayUnit === 'kg' ? '0.5' : '1'}
        min="0"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        disabled={disabled}
        className="text-center"
      />
      
      {showDual && getDualDisplayText() && (
        <div className="text-xs text-muted-foreground text-center">
          {getDualDisplayText()}
        </div>
      )}
    </div>
  );
};