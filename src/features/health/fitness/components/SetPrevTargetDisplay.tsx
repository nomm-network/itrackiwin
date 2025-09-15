import React, { useEffect, useState } from 'react';
import { Feel, FEEL_OPTIONS } from '../lib/feelToRpe';
import { parseFeelFromNotes } from '../lib/targetSuggestions';
import { feelEmoji } from '@/features/workouts/utils/feel';
import { useTargetCalculation } from '../hooks/useTargetCalculation';
import { useSessionTiming } from '@/stores/sessionTiming';

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

function RestTimer() {
  const { restStartedAt } = useSessionTiming();
  const [tick, setTick] = useState(0);

  // Debug the timer state
  useEffect(() => {
    console.log('🕐 RestTimer - restStartedAt:', restStartedAt);
    console.log('🕐 RestTimer - Date.now():', Date.now());
    if (restStartedAt) {
      console.log('🕐 RestTimer - Elapsed seconds:', Math.floor((Date.now() - restStartedAt) / 1000));
    }
  }, [restStartedAt]);

  // Always tick every second to update the display
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const seconds = Math.floor(((restStartedAt ? Date.now() - restStartedAt : 0) / 1000));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Always show timer - either running or stopped
  const displayColor = restStartedAt ? "text-green-500" : "text-muted-foreground";
  
  return (
    <div className="bg-secondary/20 border border-border rounded-xl px-4 py-2 flex items-center justify-center min-w-[100px]">
      <span className={`text-xl font-mono font-bold ${displayColor}`}>
        {minutes}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
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
            <RestTimer />
          </div>
          <div className="mt-1 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span>🎯</span>
              <span>
                Target&nbsp;
                <strong>
                  {target.weight}kg × {target.reps}
                </strong>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}