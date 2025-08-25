import React from 'react';
import { Feel, FEEL_OPTIONS } from '../lib/feelToRpe';
import { parseFeelFromNotes, parseFeelFromRPE, suggestTarget } from '../lib/targetSuggestions';
import { useLastSet } from '../hooks/useLastSet';

interface SetPrevTargetDisplayProps {
  userId?: string;
  exerciseId?: string;
  setIndex?: number;
  templateTargetReps?: number;
  templateTargetWeight?: number;
  onApplyTarget?: (w: number, r: number) => void;
}

function FeelBadge({ feel }: { feel?: Feel }) {
  if (!feel) return null;
  
  const feelOption = FEEL_OPTIONS.find(opt => opt.value === feel);
  if (!feelOption) return null;

  return (
    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs bg-muted">
      <span className="mr-1">{feelOption.emoji}</span>
      <span>{feel}</span>
    </span>
  );
}

export function SetPrevTargetDisplay({
  userId,
  exerciseId,
  setIndex,
  templateTargetReps,
  templateTargetWeight,
  onApplyTarget,
}: SetPrevTargetDisplayProps) {
  const { data: last, isLoading } = useLastSet(userId, exerciseId, setIndex);

  // Calculate intelligent target using the progressive system
  const target = React.useMemo(() => {
    if (!last) {
      return {
        weight: templateTargetWeight ?? 0,
        reps: templateTargetReps ?? 10,
      };
    }
    
    // Parse feel from previous set
    const lastFeel = parseFeelFromNotes(last.notes) || parseFeelFromRPE(last.rpe);
    
    // Use the progressive target suggestion system
    const suggestion = suggestTarget({
      lastWeight: last.weight,
      lastReps: last.reps,
      feel: lastFeel,
      templateTargetReps,
      templateTargetWeight,
      stepKg: 2.5
    });
    
    return suggestion;
  }, [last, templateTargetReps, templateTargetWeight]);

  // Auto-apply target values when they change
  React.useEffect(() => {
    if (onApplyTarget && target.weight > 0) {
      onApplyTarget(target.weight, target.reps);
    }
  }, [target.weight, target.reps, onApplyTarget]);

  return (
    <div className="mb-3 rounded-lg border p-3 bg-muted/30">
      {isLoading ? (
        <div>Loading…</div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>📜</span>
              {!last ? (
                <span>No previous data</span>
              ) : (
                <span>
                  Prev&nbsp;
                  <strong>
                    {(last.weight ?? 0).toFixed(0)}kg × {last.reps ?? 0}
                  </strong>
                </span>
              )}
            </div>
            {last && (
              <span className="text-muted-foreground text-xs">
                {new Date(last.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span>🎯</span>
            <span>
              Target&nbsp;
              <strong>
                {target.weight.toFixed(0)}kg × {target.reps}
              </strong>
            </span>
          </div>
        </>
      )}
    </div>
  );
}