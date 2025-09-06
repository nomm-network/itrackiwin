import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState, useEffect } from "react";
import { useBarTypes } from "@/hooks/useBarTypes";

interface SetRowProps {
  setNumber: number;
  onLogSet: (data: {
    weight: number;
    reps: number;
    barTypeId?: string;
    loadEntryMode?: 'total' | 'one_side';
    loadOneSideKg?: number;
    totalWeightKg?: number;
  }) => void;
  lastSet?: { 
    weight: number; 
    reps: number;
    bar_type_id?: string;
    load_entry_mode?: 'total' | 'one_side';
    load_one_side_kg?: number;
  };
  supportsBarSelection?: boolean;
}

export default function SetRow({ setNumber, onLogSet, lastSet, supportsBarSelection = false }: SetRowProps) {
  const { data: barTypes } = useBarTypes();
  
  const [weight, setWeight] = useState(lastSet?.weight || 0);
  const [reps, setReps] = useState(lastSet?.reps || 0);
  const [barTypeId, setBarTypeId] = useState<string | undefined>(lastSet?.bar_type_id);
  const [loadEntryMode, setLoadEntryMode] = useState<'total' | 'one_side'>(
    lastSet?.load_entry_mode || 'total'
  );
  const [oneSideWeight, setOneSideWeight] = useState(lastSet?.load_one_side_kg || 0);
  const [totalWeight, setTotalWeight] = useState(weight);

  const selectedBar = barTypes?.find(bar => bar.id === barTypeId);

  // Calculate total weight when one-side mode changes
  useEffect(() => {
    if (loadEntryMode === 'one_side' && selectedBar) {
      const calculated = selectedBar.default_weight + (oneSideWeight * 2);
      setTotalWeight(calculated);
      setWeight(calculated);
    } else if (loadEntryMode === 'total') {
      setTotalWeight(weight);
    }
  }, [loadEntryMode, oneSideWeight, selectedBar, weight]);

  const handleLogSet = () => {
    const logData = {
      weight: totalWeight,
      reps,
      barTypeId,
      loadEntryMode,
      loadOneSideKg: loadEntryMode === 'one_side' ? oneSideWeight : undefined,
      totalWeightKg: totalWeight
    };
    onLogSet(logData);
  };

  const handleWeightChange = (value: number) => {
    if (loadEntryMode === 'one_side') {
      setOneSideWeight(value);
    } else {
      setWeight(value);
      setTotalWeight(value);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 border rounded">
      {/* Main row with set number and inputs */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-8">{setNumber}</span>
        
        {/* Bar selection - only show if supports bars */}
        {supportsBarSelection && (
          <Select value={barTypeId} onValueChange={setBarTypeId}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Bar" />
            </SelectTrigger>
            <SelectContent>
              {barTypes?.map((bar) => (
                <SelectItem key={bar.id} value={bar.id}>
                  {bar.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Entry mode toggle - only show if bar is selected */}
        {supportsBarSelection && selectedBar && (
          <ToggleGroup
            type="single"
            value={loadEntryMode}
            onValueChange={(value) => value && setLoadEntryMode(value as 'total' | 'one_side')}
            className="h-8"
          >
            <ToggleGroupItem value="one_side" className="text-xs px-2">
              Per Side
            </ToggleGroupItem>
            <ToggleGroupItem value="total" className="text-xs px-2">
              Total
            </ToggleGroupItem>
          </ToggleGroup>
        )}

        <Input
          type="number"
          placeholder={loadEntryMode === 'one_side' ? "Per side" : "Weight"}
          value={loadEntryMode === 'one_side' ? (oneSideWeight || '') : (weight || '')}
          onChange={(e) => handleWeightChange(Number(e.target.value))}
          className="w-20"
        />
        <span className="text-xs">kg</span>
        
        <Input
          type="number"
          placeholder="Reps"
          value={reps || ''}
          onChange={(e) => setReps(Number(e.target.value))}
          className="w-16"
        />
        
        <Button size="sm" onClick={handleLogSet}>
          ✓
        </Button>
      </div>

      {/* Preview line for one-side mode */}
      {loadEntryMode === 'one_side' && selectedBar && oneSideWeight > 0 && (
        <div className="text-xs text-muted-foreground ml-8">
          = {totalWeight} kg total ({selectedBar.default_weight}kg bar + {oneSideWeight * 2}kg plates)
        </div>
      )}
    </div>
  );
}