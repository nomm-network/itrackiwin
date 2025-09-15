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
  currentSetNumber?: number; // Add this to determine if we should show timer
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
    <div className="bg-secondary/20 border border-border rounded-xl px-6 py-3 flex items-center justify-center min-w-[120px]">
      <span className={`text-2xl font-mono font-bold ${displayColor}`}>
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
  currentSetNumber = 1,
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
        <div className="flex items-stretch gap-3">
          {/* Left side: Previous and Target info */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 text-sm">
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
            <div className="flex items-center gap-2 text-sm">
              <span>🎯</span>
              <span>
                Target&nbsp;
                <strong>
                  {target.weight}kg × {target.reps}
                </strong>
              </span>
            </div>
          </div>
          
          {/* Right side: ONE timer spanning both rows - only show if not Set 1 */}
          {currentSetNumber > 1 && (
            <div className="flex items-center">
              <RestTimer />
            </div>
          )}
        </div>
      )}
    </div>
  );
}