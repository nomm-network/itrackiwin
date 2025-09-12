import React from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface DebugItem {
  exerciseId: string;
  name: string;
  loadType: string;
  barWeight: number;
  perSide: boolean;
  inputKg: number;
  desiredTotalKg: number;
  resolved?: {
    totalKg: number;
    implement: string;
    source: string;
    residualKg: number;
  };
  profiles?: {
    plateProfile?: string;
    stackProfile?: string;
  };
  gymId?: string;
}

interface WorkoutExerciseDebugProps {
  enabled?: boolean;
  debugItems: DebugItem[];
}

export default function WorkoutExerciseDebug({ enabled = false, debugItems }: WorkoutExerciseDebugProps) {
  if (!enabled || !debugItems?.length) return null;

  return (
    <div className="mt-4">
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronDown className="h-4 w-4" />
          Debug
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="rounded-lg border bg-card p-3 text-xs font-mono space-y-3">
            {debugItems.map((item, i) => (
              <div key={i} className="space-y-1 p-2 rounded border bg-muted/50">
                <div className="font-semibold">{item.name}</div>
                <div>Exercise ID: {item.exerciseId}</div>
                <div>Load Type: {item.loadType}</div>
                <div>Bar Weight: {item.barWeight} kg</div>
                <div>Per-side Mode: {item.perSide ? 'true' : 'false'}</div>
                <div>Input: {item.inputKg} kg</div>
                <div>Desired Total: {item.desiredTotalKg} kg</div>
                {item.resolved && (
                  <div className="border-t pt-1 mt-1">
                    <div>Resolved Total: {item.resolved.totalKg} kg</div>
                    <div>Implement: {item.resolved.implement}</div>
                    <div>Source: {item.resolved.source}</div>
                    <div>Residual: {item.resolved.residualKg} kg</div>
                  </div>
                )}
                {item.profiles && (
                  <div className="border-t pt-1 mt-1">
                    {item.profiles.plateProfile && <div>Plate Profile: {item.profiles.plateProfile}</div>}
                    {item.profiles.stackProfile && <div>Stack Profile: {item.profiles.stackProfile}</div>}
                  </div>
                )}
                {item.gymId && <div>Gym ID: {item.gymId}</div>}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}