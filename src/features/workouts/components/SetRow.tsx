import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useBarTypes } from "@/hooks/useBarTypes";
import { getEffectivePlateProfile, getCurrentGymContext } from "@/lib/loadout/getProfile";
import { resolveLoadout, type LoadType, type ResolveResult } from "@/lib/loadout/resolveLoadout";
import { openLoadoutModal } from "./LoadoutModal";
import { SmartWeightInput } from "./SmartWeightInput";
import { ImplementChooser } from "./ImplementChooser";
import { useTargetCalculation } from "@/features/health/fitness/hooks/useTargetCalculation";

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
  exerciseId?: string;
  equipmentId?: string;
  loadType?: LoadType;
  suggestedWeight?: number;
  gymId?: string;
  supportedImplements?: ('barbell' | 'dumbbell' | 'machine')[];
  userId?: string;
  templateTargetReps?: number;
  templateTargetWeight?: number;
}

export default function SetRow({ 
  setNumber, 
  onLogSet, 
  lastSet, 
  supportsBarSelection = false,
  exerciseId,
  equipmentId,
  loadType = 'dual_load',
  suggestedWeight,
  gymId,
  supportedImplements = ['barbell'],
  userId,
  templateTargetReps,
  templateTargetWeight
}: SetRowProps) {
  const { data: barTypes } = useBarTypes();
  
  console.log('🎯 SetRow: Component initialized with debug logging enabled:', {
    setNumber,
    exerciseId,
    userId,
    lastSet,
    suggestedWeight,
    templateTargetReps,
    templateTargetWeight,
    gymId
  });

  // Use target calculation hook for smart weight/rep suggestions
  const { target: calculatedTarget } = useTargetCalculation({
    userId,
    exerciseId,
    setIndex: setNumber - 1, // Convert to 0-based index
    templateTargetReps,
    templateTargetWeight,
    onApplyTarget: (weight, reps) => {
      console.log('🎯 SetRow: Target calculation callback triggered:', { weight, reps });
      setWeight(weight);
      setReps(reps);
      setTotalWeight(weight);
    }
  });
  
  console.log('🎯 SetRow: Target calculation result:', {
    calculatedTarget,
    fallbackWeight: lastSet?.weight || suggestedWeight || 0,
    fallbackReps: lastSet?.reps || 0
  });
  
  const [weight, setWeight] = useState(lastSet?.weight || suggestedWeight || calculatedTarget?.weight || 0);
  const [reps, setReps] = useState(lastSet?.reps || calculatedTarget?.reps || 0);
  const [barTypeId, setBarTypeId] = useState<string | undefined>(lastSet?.bar_type_id);
  const [loadEntryMode, setLoadEntryMode] = useState<'total' | 'one_side'>(
    lastSet?.load_entry_mode || 'total'
  );
  const [oneSideWeight, setOneSideWeight] = useState(lastSet?.load_one_side_kg || 0);
  const [totalWeight, setTotalWeight] = useState(weight);
  const [loadoutSnap, setLoadoutSnap] = useState<ResolveResult | null>(null);
  const [selectedImplement, setSelectedImplement] = useState<string>(supportedImplements[0] || 'barbell');

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

  // Resolve loadout when weight or context changes
  useEffect(() => {
    let alive = true;
    
    (async () => {
      try {
        const { gymId, userUnit } = await getCurrentGymContext();
        const profile = await getEffectivePlateProfile(gymId, equipmentId);
        
        if (!profile || !alive) return;
        
        const result = resolveLoadout({
          desired: totalWeight,
          userUnit,
          loadType,
          profile
        });
        
        if (alive) {
          setLoadoutSnap(result);
        }
      } catch (error) {
        console.error('Error resolving loadout:', error);
      }
    })();
    
    return () => { alive = false; };
  }, [totalWeight, equipmentId, loadType]);

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

        <SmartWeightInput
          value={loadEntryMode === 'one_side' ? (oneSideWeight || 0) : (weight || 0)}
          onChange={handleWeightChange}
          exerciseId={exerciseId}
          gymId={gymId}
          placeholder={loadEntryMode === 'one_side' ? "Per side" : "Weight"}
          className="w-20"
          onResolutionChange={(resolved) => {
            // Could store resolution details for loadout modal
          }}
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

        {/* Implement chooser */}
        <ImplementChooser
          exerciseId={exerciseId || ''}
          supportedImplements={supportedImplements}
          selectedImplement={selectedImplement}
          onImplementChange={setSelectedImplement}
        />

      </div>

      {/* Load breakdown button */}
      {loadType !== 'bodyweight' && loadoutSnap && (
        <div className="flex items-center gap-2 ml-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openLoadoutModal(loadoutSnap, loadType, `Set ${setNumber} Load`)}
          >
            {loadType === 'stack' ? 'Stack' : 'Plates'}
          </Button>

          {/* Weight adjustment feedback */}
          {loadoutSnap.matchQuality !== 'exact' && (
            <Badge variant="outline" className="text-xs">
              {loadoutSnap.matchQuality === 'nearestUp' ? '↑' : '↓'} Snapped
            </Badge>
          )}
        </div>
      )}

      {/* Preview line for one-side mode */}
      {loadEntryMode === 'one_side' && selectedBar && oneSideWeight > 0 && (
        <div className="text-xs text-muted-foreground ml-8">
          = {totalWeight} kg total ({selectedBar.default_weight}kg bar + {oneSideWeight * 2}kg plates)
        </div>
      )}
    </div>
  );
}