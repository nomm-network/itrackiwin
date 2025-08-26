import React from 'react';
import { Feel, FEEL_OPTIONS } from '../lib/feelToRpe';
import { parseFeelFromNotes, parseFeelFromRPE, suggestTarget } from '../lib/targetSuggestions';
import { useLastSet } from '../hooks/useLastSet';
import { useExerciseEstimate } from '@/features/workouts/hooks/useExerciseEstimate';

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
  console.log('🔍 SetPrevTargetDisplay called with props:', {
    userId,
    exerciseId,
    setIndex,
    templateTargetReps,
    templateTargetWeight,
    userIdExists: !!userId,
    exerciseIdExists: !!exerciseId,
    setIndexIsNumber: typeof setIndex === 'number',
    setIndexIsFinite: Number.isFinite(setIndex)
  });

  const { data: last, isLoading } = useLastSet(userId, exerciseId, setIndex);
  const { data: estimate } = useExerciseEstimate(exerciseId, 'rm10');

  // Calculate intelligent target using the progressive system
  const target = React.useMemo(() => {
    console.log('🔍 SetPrevTargetDisplay: Target calculation inputs:', {
      templateTargetWeight,
      templateTargetWeightType: typeof templateTargetWeight,
      estimateWeight: estimate?.estimated_weight,
      estimateUnit: estimate?.unit,
      fullEstimate: estimate,
      hasLast: !!last,
      lastData: last
    });
    
    if (!last) {
      // Use estimate as fallback only when no previous data exists
      // Prioritize estimate over templateTargetWeight if templateTargetWeight is 0 or undefined
      const effectiveTargetWeight = (templateTargetWeight && templateTargetWeight > 0) 
        ? templateTargetWeight 
        : estimate?.estimated_weight || templateTargetWeight || 0;
      console.log('🎯 No previous data - using estimate/template:', effectiveTargetWeight);
      return {
        weight: effectiveTargetWeight,
        reps: templateTargetReps ?? 10,
      };
    }
    
    // Parse feel from previous set
    const lastFeel = parseFeelFromNotes(last.notes) || parseFeelFromRPE(last.rpe);
    console.log('🔍 Previous set data found:', { weight: last.weight, reps: last.reps, feel: lastFeel });
    
    // Use the progressive target suggestion system - each set should use template weight as baseline
    const suggestion = suggestTarget({
      lastWeight: last.weight,
      lastReps: last.reps,
      feel: lastFeel,
      templateTargetReps,
      templateTargetWeight: templateTargetWeight, // Use template weight as baseline, not last performed weight
      stepKg: 2.5
    });
    
    console.log('🎯 Progressive target calculated:', suggestion);
    return suggestion;
  }, [last, templateTargetReps, templateTargetWeight, estimate?.estimated_weight]);

  // Auto-apply target values when they change - reset when setIndex changes
  const hasAppliedRef = React.useRef(false);
  const lastSetIndexRef = React.useRef(setIndex);
  
  // Reset hasApplied when setIndex changes (moving to next set)
  if (lastSetIndexRef.current !== setIndex) {
    hasAppliedRef.current = false;
    lastSetIndexRef.current = setIndex;
  }
  
  React.useEffect(() => {
    if (onApplyTarget && !hasAppliedRef.current) {
      console.log('🎯 Applying target values to form:', { weight: target.weight, reps: target.reps, setIndex });
      onApplyTarget(target.weight, target.reps);
      hasAppliedRef.current = true;
    }
  }, [target.weight, target.reps, onApplyTarget, setIndex]);

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
                    {(last.weight ?? 0).toFixed(0)}kg × {last.reps ?? 0}{parseFeelFromNotes(last.notes) || parseFeelFromRPE(last.rpe) || ''}
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
        </>
      )}
    </div>
  );
}