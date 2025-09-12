import React from 'react';
import { getBarMeta } from '@/lib/equipment/barMeta';
import { getBarWeightKg } from '@/lib/equipment/barWeight';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Minus } from 'lucide-react';
import { useTargetCalculation } from "@/features/health/fitness/hooks/useTargetCalculation";

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
  const { target: calculatedTarget } = useTargetCalculation({
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
  
  // Get bar weight from database (async) and fallback to meta for now
  const [barKg, setBarKg] = React.useState(20); // Default Olympic bar
  React.useEffect(() => {
    if (exercise?.equipment_ref) {
      getBarWeightKg({ equipment_ref_id: exercise.equipment_ref })
        .then(weight => setBarKg(weight))
        .catch(() => setBarKg(20)); // Fallback to 20kg
    }
  }, [exercise?.equipment_ref]);
  
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
          <>
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground">Per-side (kg)</Label>
            <div className="flex items-center gap-2">
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ 
                  ...value, 
                  perSideKg: Math.max(0, (perSide || 0) - 2.5),
                  weightKg: undefined
                })}
                className="w-8 h-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                inputMode="decimal"
                step="0.5"
                value={perSide ?? ''}
                onChange={e => onChange({ 
                  ...value, 
                  perSideKg: Number(e.target.value) || undefined,
                  weightKg: undefined
                })}
                className="w-28 text-center"
              />
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ 
                  ...value, 
                  perSideKg: (perSide || 0) + 2.5,
                  weightKg: undefined
                })}
                className="w-8 h-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
            <div className="text-xs text-muted-foreground pb-2 flex-shrink-0">
              {hasBar ? `${barKg}kg bar + 2×${formatKg(perSide || 0)}` : `2×${formatKg(perSide || 0)}`} = {formatKg(totalFromSide)} kg total
            </div>
          </>
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
                  weightKg: Math.max(0, (value.weightKg || 0) - 2.5),
                  perSideKg: undefined
                })}
                className="w-8 h-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                inputMode="decimal"
                step="0.5"
                value={value.weightKg ?? ''}
                onChange={e => onChange({ 
                  ...value, 
                  weightKg: Number(e.target.value) || undefined,
                  perSideKg: undefined
                })}
                className="w-32 text-center"
              />
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange({ 
                  ...value, 
                  weightKg: (value.weightKg || 0) + 2.5,
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
              className="w-20 text-center"
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
    </div>
  );
}