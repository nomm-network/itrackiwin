import React from 'react';
import { useLastSet } from './useLastSet';
import { useExerciseEstimate } from '@/features/workouts/hooks/useExerciseEstimate';
import { parseFeelFromNotes, parseFeelFromRPE, suggestTarget } from '../lib/targetSuggestions';

interface UseTargetCalculationProps {
  userId?: string;
  exerciseId?: string;
  setIndex?: number;
  templateTargetReps?: number;
  templateTargetWeight?: number;
  onApplyTarget?: (weight: number, reps: number) => void;
}

export function useTargetCalculation({
  userId,
  exerciseId,
  setIndex,
  templateTargetReps,
  templateTargetWeight,
  onApplyTarget,
}: UseTargetCalculationProps) {
  const { data: lastSet, isLoading: isLoadingLastSet } = useLastSet(userId, exerciseId, setIndex);
  const { data: estimate, isLoading: isLoadingEstimate } = useExerciseEstimate(exerciseId, 'rm10');

  // Calculate target once with all logic consolidated
  const target = React.useMemo(() => {
    console.log('🎯 useTargetCalculation: Computing target with:', {
      hasLastSet: !!lastSet,
      templateTargetWeight,
      estimateWeight: estimate?.estimated_weight,
      setIndex
    });

    if (!lastSet) {
      // No history - use estimate or template as fallback
      const effectiveWeight = (templateTargetWeight && templateTargetWeight > 0) 
        ? templateTargetWeight 
        : estimate?.estimated_weight || templateTargetWeight || 0;
      
      const target = {
        weight: effectiveWeight,
        reps: templateTargetReps ?? 10,
      };
      
      console.log('🎯 useTargetCalculation: No history, using fallback:', target);
      return target;
    }

    // Has history - use progressive system
    const lastFeel = parseFeelFromNotes(lastSet.notes) || parseFeelFromRPE(lastSet.rpe);
    
    const suggestion = suggestTarget({
      lastWeight: lastSet.weight,
      lastReps: lastSet.reps,
      feel: lastFeel,
      templateTargetReps,
      templateTargetWeight,
      stepKg: 2.5
    });
    
    console.log('🎯 useTargetCalculation: Using progressive system:', suggestion);
    return suggestion;
  }, [lastSet, templateTargetReps, templateTargetWeight, estimate?.estimated_weight, setIndex]);

  // Apply target to form - SINGLE call only when target changes
  const hasAppliedRef = React.useRef(false);
  const lastSetIndexRef = React.useRef(setIndex);
  
  // Reset when moving to next set
  if (lastSetIndexRef.current !== setIndex) {
    hasAppliedRef.current = false;
    lastSetIndexRef.current = setIndex;
  }
  
  React.useEffect(() => {
    if (onApplyTarget && !hasAppliedRef.current && !isLoadingLastSet && !isLoadingEstimate) {
      console.log('🎯 useTargetCalculation: SINGLE onApplyTarget call:', target);
      onApplyTarget(target.weight, target.reps);
      hasAppliedRef.current = true;
    }
  }, [target.weight, target.reps, onApplyTarget, setIndex, isLoadingLastSet, isLoadingEstimate]);

  return {
    target,
    lastSet,
    isLoading: isLoadingLastSet || isLoadingEstimate,
  };
}