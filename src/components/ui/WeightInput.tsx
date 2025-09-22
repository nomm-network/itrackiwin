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
import { resolveWeightForExercise, getAvailableWeights } from '@/lib/loading/equipmentResolver';

interface WeightInputProps {
  value?: number;
  onChange: (weightData: WeightData) => void;
  workoutId?: string;
  exerciseId?: string;
  loadType?: 'dual_load' | 'single_load' | 'stack';
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  showDualDisplay?: boolean;
  showEquipmentHints?: boolean;
}

export const WeightInput: React.FC<WeightInputProps> = ({
  value,
  onChange,
  workoutId,
  exerciseId,
  loadType = 'dual_load',
  className,
  placeholder = "0",
  disabled = false,
  showDualDisplay = true,
  showEquipmentHints = false
}) => {
  const { data: userProfile } = useUserProfile();
  const [equipmentHint, setEquipmentHint] = React.useState<string>('');
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

  // Initialize input value from prop and generate equipment hints
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value.toString());
      
      // Generate equipment hint if enabled
      if (showEquipmentHints && value > 0 && exerciseId) {
        resolveWeightForExercise(value, displayUnit, exerciseId, loadType, userProfile?.id)
          .then(resolved => {
            if (resolved.breakdown?.perSide && resolved.breakdown.perSide.length > 0) {
              const plateString = resolved.breakdown.perSide.join(' + ');
              setEquipmentHint(`${resolved.breakdown.bar}${displayUnit} bar + ${plateString}${displayUnit} per side`);
            } else if (loadType === 'single_load') {
              setEquipmentHint(`${resolved.weight}${resolved.unit} dumbbell`);
            } else if (loadType === 'stack') {
              setEquipmentHint(`Stack: ${resolved.weight}${resolved.unit}`);
            }
          })
          .catch(() => setEquipmentHint(''));
      } else {
        setEquipmentHint('');
      }
    }
  }, [value, showEquipmentHints, exerciseId, loadType, userProfile?.id, displayUnit]);

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
      
      {showEquipmentHints && equipmentHint && (
        <div className="text-xs text-muted-foreground text-center bg-muted/50 px-2 py-1 rounded">
          {equipmentHint}
        </div>
      )}
    </div>
  );
};