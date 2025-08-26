import React from 'react';
import { Feel, FEEL_OPTIONS } from '../lib/feelToRpe';
import { parseFeelFromNotes } from '../lib/targetSuggestions';
import { feelEmoji } from '@/features/workouts/utils/feel';
import { useTargetCalculation } from '../hooks/useTargetCalculation';

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
  const { target, lastSet: last, isLoading } = useTargetCalculation({
    userId,
    exerciseId,
    setIndex,
    templateTargetReps,
    templateTargetWeight,
    onApplyTarget
  });

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
                    {(last.weight ?? 0).toFixed(0)}kg × {last.reps ?? 0} {feelEmoji(parseFeelFromNotes(last.notes))}
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
                {target.weight}kg × {target.reps}
              </strong>
            </span>
          </div>
          
          {/* DEBUG INFO */}
          <div className="mt-2 p-2 bg-red-900/20 rounded text-xs">
            <div><strong>🔍 DEBUG DATA:</strong></div>
            <div>userId: {userId || 'NULL'}</div>
            <div>exerciseId: {exerciseId || 'NULL'}</div>
            <div>setIndex: {setIndex ?? 'NULL'}</div>
            <div>templateTargetReps: {templateTargetReps ?? 'NULL'}</div>
            <div>templateTargetWeight: {templateTargetWeight ?? 'NULL'}</div>
            <div>hasLastSet: {!!last ? 'YES' : 'NO'}</div>
            <div>lastSet: {last ? `${last.weight}kg × ${last.reps} on ${last.completed_at}` : 'NULL'}</div>
            <div>target: {target.weight}kg × {target.reps}</div>
            <div>isLoading: {isLoading ? 'YES' : 'NO'}</div>
          </div>
        </>
      )}
    </div>
  );
}