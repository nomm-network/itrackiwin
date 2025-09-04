import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TouchOptimizedSetInput from "../workouts/ui/components/TouchOptimizedSetInput";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EntryStyle, LoadingMode } from "../lib/weightLoading";

interface WeightEntryProps {
  entryStyle: EntryStyle;
  onEntryStyleChange: (style: EntryStyle) => void;
  totalWeight?: number;
  perSideWeight?: number;
  barWeight?: number;
  onTotalWeightChange: (weight: number) => void;
  onPerSideWeightChange: (weight: number) => void;
  onBarWeightChange: (weight: number) => void;
  loadingMode?: LoadingMode;
  defaultBarWeight?: number;
  className?: string;
}

export function WeightEntry({
  entryStyle,
  onEntryStyleChange,
  totalWeight,
  perSideWeight,
  barWeight,
  onTotalWeightChange,
  onPerSideWeightChange,
  onBarWeightChange,
  loadingMode = 'plates_per_side',
  defaultBarWeight = 20,
  className
}: WeightEntryProps) {
  // Initialize bar weight with default if not set
  useEffect(() => {
    if (entryStyle === 'per_side' && !barWeight && defaultBarWeight) {
      onBarWeightChange(defaultBarWeight);
    }
  }, [entryStyle, barWeight, defaultBarWeight, onBarWeightChange]);

  const shouldShowPerSideMode = loadingMode === 'plates_per_side';
  const calculatedTotal = entryStyle === 'per_side' 
    ? (perSideWeight || 0) * 2 + (barWeight || 0)
    : totalWeight || 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Entry Style Toggle - only show for plate-loaded equipment */}
      {shouldShowPerSideMode && (
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            type="button"
            variant={entryStyle === 'total' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onEntryStyleChange('total')}
            className="flex-1"
          >
            Total
          </Button>
          <Button
            type="button"
            variant={entryStyle === 'per_side' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onEntryStyleChange('per_side')}
            className="flex-1"
          >
            Per side
          </Button>
        </div>
      )}

      {/* Weight Inputs */}
      {entryStyle === 'total' ? (
        <TouchOptimizedSetInput
          label="Weight"
          value={totalWeight || null}
          onChange={(value) => onTotalWeightChange(value || 0)}
          suffix="kg"
          step={2.5}
          min={0}
          max={500}
        />
      ) : (
        <div className="space-y-2">
          <TouchOptimizedSetInput
            label="Per side"
            value={perSideWeight || null}
            onChange={(value) => onPerSideWeightChange(value || 0)}
            suffix="kg"
            step={1.25}
            min={0}
            max={250}
          />
          <TouchOptimizedSetInput
            label="Bar"
            value={barWeight || null}
            onChange={(value) => onBarWeightChange(value || 0)}
            suffix="kg"
            step={2.5}
            min={0}
            max={50}
          />
          
          {/* Calculated Total Display */}
          <div className="flex items-center justify-between text-sm bg-accent/50 rounded-lg px-3 py-2">
            <span className="opacity-70">Total weight:</span>
            <Badge variant="secondary" className="tabular-nums font-medium">
              {calculatedTotal.toFixed(1)}kg
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}