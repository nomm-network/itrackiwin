import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useLoadoutResolver } from "@/hooks/useLoadoutResolver";
import { openLoadoutModal } from "./LoadoutModal";
import type { LoadType } from "@/lib/loadout/resolveLoadout";

interface EnhancedSetRowProps {
  setNumber: number;
  weight: number;
  reps: number;
  onWeightChange: (weight: number) => void;
  onRepsChange: (reps: number) => void;
  onLogSet: () => void;
  equipmentId?: string;
  loadType?: LoadType;
  userUnit?: 'kg' | 'lb';
}

export default function EnhancedSetRow({
  setNumber,
  weight,
  reps,
  onWeightChange,
  onRepsChange,
  onLogSet,
  equipmentId,
  loadType = 'dual_load',
  userUnit = 'kg'
}: EnhancedSetRowProps) {
  const { resolveWeight } = useLoadoutResolver({ equipmentId, loadType });
  const [loadoutSnap, setLoadoutSnap] = useState<any>(null);

  // Resolve loadout when weight changes
  useEffect(() => {
    if (weight > 0) {
      resolveWeight(weight).then(result => {
        setLoadoutSnap(result);
        // Optionally auto-snap the weight to achievable value
        if (result && result.targetDisplay !== weight) {
          // Uncomment to auto-snap: onWeightChange(result.targetDisplay);
        }
      });
    }
  }, [weight, resolveWeight]);

  return (
    <div className="flex flex-col gap-2 p-3 border rounded">
      {/* Main row */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-8">{setNumber}</span>
        
        <Input
          type="number"
          placeholder="Weight"
          value={weight || ''}
          onChange={(e) => onWeightChange(Number(e.target.value))}
          className="w-20"
        />
        <span className="text-xs">{userUnit}</span>
        
        <Input
          type="number"
          placeholder="Reps"
          value={reps || ''}
          onChange={(e) => onRepsChange(Number(e.target.value))}
          className="w-16"
        />
        
        <Button size="sm" onClick={onLogSet}>
          ✓
        </Button>
      </div>

      {/* Load breakdown */}
      {loadType !== 'bodyweight' && loadoutSnap && (
        <div className="flex items-center gap-2 ml-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openLoadoutModal(loadoutSnap, loadType, `Set ${setNumber} Load`)}
          >
            {loadType === 'stack' ? 'Stack' : 'Plates'}
          </Button>

          {loadoutSnap.matchQuality !== 'exact' && (
            <Badge variant="outline" className="text-xs">
              {loadoutSnap.matchQuality === 'nearestUp' ? '↑' : '↓'} Snapped
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}