import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { resolveAchievableLoad, formatLoadSuggestion } from '@/lib/equipment/resolveLoad';
import { useDebounce } from '@/hooks/useDebounce';

interface SmartWeightInputProps {
  value: number;
  onChange: (value: number) => void;
  exerciseId?: string;
  gymId?: string;
  unit?: 'kg' | 'lb';
  placeholder?: string;
  className?: string;
  onResolutionChange?: (resolved: any) => void;
}

export function SmartWeightInput({
  value,
  onChange,
  exerciseId,
  gymId,
  unit = 'kg',
  placeholder = "Weight",
  className,
  onResolutionChange
}: SmartWeightInputProps) {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isResolving, setIsResolving] = useState(false);
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    if (!exerciseId || !debouncedValue || debouncedValue <= 0) {
      setSuggestion('');
      return;
    }

    const resolveWeight = async () => {
      setIsResolving(true);
      try {
        const result = await resolveAchievableLoad(exerciseId, debouncedValue, gymId);
        
        if (Math.abs(result.residualKg) >= 0.25) {
          setSuggestion(formatLoadSuggestion(result));
        } else {
          setSuggestion('');
        }
        
        onResolutionChange?.(result);
      } catch (error) {
        console.error('Weight resolution failed:', error);
        setSuggestion('');
      } finally {
        setIsResolving(false);
      }
    };

    resolveWeight();
  }, [debouncedValue, exerciseId, gymId, onResolutionChange]);

  const handleBlur = async () => {
    // Pre-save validation - snap to achievable weight
    if (!exerciseId || !value || value <= 0) return;

    try {
      const result = await resolveAchievableLoad(exerciseId, value, gymId);
      
      if (Math.abs(result.residualKg) > 0.1) {
        // Auto-snap to achievable weight
        onChange(result.totalKg);
        setSuggestion('');
      }
    } catch (error) {
      console.error('Weight validation failed:', error);
    }
  };

  return (
    <div className="space-y-1">
      <Input
        type="number"
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={handleBlur}
        className={className}
        disabled={isResolving}
      />
      
      {suggestion && (
        <p className="text-xs text-muted-foreground">
          {suggestion}
        </p>
      )}
    </div>
  );
}