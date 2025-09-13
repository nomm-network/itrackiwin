import React from 'react';
import { getBarMeta } from '@/lib/equipment/barMeta';
import { getBarWeightKg } from '@/lib/equipment/barWeight';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Minus } from 'lucide-react';
import { useTargetCalculation } from "@/features/health/fitness/hooks/useTargetCalculation";
import { getPlateStepInfo, getWeightStep } from '@/lib/equipment/steps';
import { getCurrentGymContext } from '@/lib/loadout/getProfile';

interface SetValue {
  weightKg?: number;
  perSideKg?: number;
  reps?: number;
  entryMode?: 'total' | 'per_side';
}

interface SetEditorProps {
  exercise?: {
    load_type?: string;
    equipment_ref?: string;
    id?: string;
  };
  value: SetValue;
  onChange: (value: SetValue) => void;
  className?: string;
  setIndex?: number;
  userId?: string;
  gymId?: string;
  templateTargetReps?: number;
  templateTargetWeight?: number;
}

function formatKg(kg: number): string {
  return kg % 1 === 0 ? kg.toString() : kg.toFixed(1);
}

export function SetEditor({
  exercise,
  value,
  onChange,
  className = "",
  setIndex = 0,
  userId,
  gymId,
  templateTargetReps,
  templateTargetWeight
}: SetEditorProps) {
  
  console.log('🎯 SetEditor: Component initialized with debug logging enabled:', {
    setIndex,
    exerciseId: exercise?.id,
    userId,
    value,
    templateTargetReps,
    templateTargetWeight,
    gymId,
    loadType: exercise?.load_type
  });

  // Use target calculation hook for smart weight/rep suggestions
  const { target: calculatedTarget, equipmentResolvedTarget, resolvedDetails } = useTargetCalculation({
    userId,
    exerciseId: exercise?.id,
    setIndex: setIndex,
    templateTargetReps,
    templateTargetWeight,
    onApplyTarget: (weight, reps) => {
      console.log('🎯 SetEditor: Target calculation callback triggered:', { weight, reps });
      onChange({
        ...value,
        weightKg: weight,
        reps: reps,
        entryMode: 'total'
      });
    }
  });
  
  console.log('🎯 SetEditor: Target calculation result:', {
    calculatedTarget,
    fallbackWeight: value.weightKg || 0,
    fallbackReps: value.reps || 0
  });
  const isDual = exercise?.load_type === 'dual_load';
  
  // Get bar weight and plate step info
  const [barKg, setBarKg] = React.useState(20); // Default Olympic bar
  const [plateStep, setPlateStep] = React.useState(1.25); // Default step
  
  React.useEffect(() => {
    const loadEquipmentData = async () => {
      try {
        // Get gym context and bar weight in parallel
        const [gymContext, barWeight] = await Promise.all([
          getCurrentGymContext(),
          exercise?.equipment_ref ? getBarWeightKg({ equipment_ref_id: exercise.equipment_ref }) : Promise.resolve(20)
        ]);
        
        setBarKg(barWeight);
        
        // Get plate step info for this gym
        const stepInfo = await getPlateStepInfo(gymContext.gymId);
        const step = getWeightStep(exercise?.load_type || 'dual_load', stepInfo);
        setPlateStep(step);
        
        console.log('🎯 SetEditor: Equipment data loaded:', {
          barWeight,
          gymId: gymContext.gymId,
          plateStep: step,
          loadType: exercise?.load_type,
          stepInfo
        });
      } catch (error) {
        console.error('Error loading equipment data:', error);
        setBarKg(20);
        setPlateStep(1.25);
      }
    };
    
    loadEquipmentData();
  }, [exercise?.equipment_ref, exercise?.load_type]);
  
  const hasBar = isDual && barKg > 0;

  console.log('🎯 SetEditor: dual_load detection:', {
    loadType: exercise?.load_type,
    isDual,
    equipmentRef: exercise?.equipment_ref,
    hasBar,
    barKg,
    currentValue: value,
    dualLoadUIShowing: isDual
  });

  const perSide = isDual
    ? (value.perSideKg ?? (value.weightKg ? Math.max(0, (value.weightKg - (hasBar ? barKg : 0)) / 2) : undefined))
    : undefined;

  const totalFromSide = isDual && perSide != null
    ? (hasBar ? barKg : 0) + perSide * 2
    : value.weightKg ?? 0;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {isDual && (
        <div className="flex items-center gap-3 p-2 bg-muted/20 rounded-lg">
          <span className={`text-sm ${value.entryMode === 'per_side' ? 'font-medium' : 'text-muted-foreground'}`}>
            Per-side
          </span>
          <Switch 
            checked={value.entryMode === 'total'}
            onCheckedChange={(checked) => onChange({ 
              ...value, 
              entryMode: checked ? 'total' : 'per_side'
            })}
          />
          <span className={`text-sm ${value.entryMode === 'total' ? 'font-medium' : 'text-muted-foreground'}`}>
            Total
          </span>
        </div>
      )}
      
      <div className="flex items-end gap-3">
        {isDual && value.entryMode === 'per_side' ? (
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Per-side (kg)</Label>
            <div className="flex items-center gap-2">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ 
                  ...value, 
                  perSideKg: Math.max(0, (perSide || 0) - plateStep),
                  weightKg: undefined
                })}
                className="w-8 h-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                inputMode="decimal"
                step={plateStep}
                min="0"
                value={perSide ?? ''}
                onChange={e => onChange({ 
                  ...value, 
                  perSideKg: Number(e.target.value) || undefined,
                  weightKg: undefined
                })}
                className="w-16 text-center"
              />
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ 
                  ...value, 
                  perSideKg: (perSide || 0) + plateStep,
                  weightKg: undefined
                })}
                className="w-8 h-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">
              {isDual ? 'Total Weight (kg)' : 'Weight (kg)'}
            </Label>
            <div className="flex items-center gap-2">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ 
                  ...value, 
                  weightKg: Math.max(0, (value.weightKg || 0) - (isDual ? plateStep * 2 : plateStep)),
                  perSideKg: undefined
                })}
                className="w-8 h-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                inputMode="decimal"
                step={isDual ? plateStep * 2 : plateStep}
                min="0"
                value={value.weightKg ?? ''}
                onChange={e => onChange({ 
                  ...value, 
                  weightKg: Number(e.target.value) || undefined,
                  perSideKg: undefined
                })}
                className="w-20 text-center"
              />
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ 
                  ...value, 
                  weightKg: (value.weightKg || 0) + (isDual ? plateStep * 2 : plateStep),
                  perSideKg: undefined
                })}
                className="w-8 h-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Reps</Label>
          <div className="flex items-center gap-2">
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange({ 
                ...value, 
                reps: Math.max(0, (value.reps || 0) - 1)
              })}
              className="w-8 h-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              inputMode="numeric"
              value={value.reps ?? ''}
              onChange={e => onChange({ 
                ...value, 
                reps: Number(e.target.value) || undefined 
              })}
              className="w-14 text-center"
            />
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange({ 
                ...value, 
                reps: (value.reps || 0) + 1
              })}
              className="w-8 h-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {isDual && value.entryMode === 'per_side' && (
        <div className="text-sm text-muted-foreground">
          {hasBar ? `${barKg}kg bar + 2×${formatKg(perSide || 0)}` : `2×${formatKg(perSide || 0)}`} = {formatKg(totalFromSide)} kg total
        </div>
      )}

      {resolvedDetails && resolvedDetails.snappedFrom && (
        <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
          Snapped {resolvedDetails.snappedFrom}kg → {resolvedDetails.totalKg}kg based on gym plates
          {resolvedDetails.barWeight ? ` (bar ${resolvedDetails.barWeight}kg)` : ''}
        </div>
      )}
    </div>
  );
}