import React from 'react';
import { getBarMeta } from '@/lib/equipment/barMeta';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

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
  };
  value: SetValue;
  onChange: (value: SetValue) => void;
  className?: string;
}

function formatKg(kg: number): string {
  return kg % 1 === 0 ? kg.toString() : kg.toFixed(1);
}

export function SetEditor({
  exercise,
  value,
  onChange,
  className = ""
}: SetEditorProps) {
  const isDual = exercise?.load_type === 'dual_load';
  const { hasBar, barKg } = getBarMeta(exercise?.equipment_ref);

  const perSide = isDual
    ? (value.perSideKg ?? (value.weightKg ? Math.max(0, (value.weightKg - (hasBar ? barKg : 0)) / 2) : undefined))
    : undefined;

  const totalFromSide = isDual && perSide != null
    ? (hasBar ? barKg : 0) + perSide * 2
    : value.weightKg ?? 0;

  return (
    <div className={`flex items-end gap-3 ${className}`}>
      {isDual ? (
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
                entryMode: 'per_side', 
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
                entryMode: 'per_side', 
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
                entryMode: 'per_side', 
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
            {hasBar ? `bar ${barKg} kg + 2×side` : `2×side`}
          </div>
          <div className="text-sm font-medium pb-2 flex-shrink-0">
            = {formatKg(totalFromSide)} kg total
          </div>
        </>
      ) : (
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
          <div className="flex items-center gap-2">
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange({ 
                ...value, 
                entryMode: 'total', 
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
                entryMode: 'total', 
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
                entryMode: 'total', 
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
  );
}