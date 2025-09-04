import React from 'react';
import { useLastSet } from './useLastSet';
import { useExerciseEstimate } from '../workouts/hooks/useExerciseEstimate';
import { parseFeelFromNotes, parseFeelFromRPE, suggestTarget } from '../lib/targetSuggestions';

interface UseTargetCalculationProps {
  userId?: string;
  exerciseId?: string;
  setIndex?: number;
  templateTargetReps?: number;
  templateTargetWeight?: number;
  gripKey?: string | null;
  onApplyTarget?: (weight: number, reps: number) => void;
}

export function useTargetCalculation({
  userId,
  exerciseId,
  setIndex,
  templateTargetReps,
  templateTargetWeight,
  gripKey,
  onApplyTarget,
}: UseTargetCalculationProps) {
  const { data: lastSet, isLoading: isLoadingLastSet } = useLastSet(userId, exerciseId, setIndex, gripKey);
  const { data: estimate, isLoading: isLoadingEstimate } = useExerciseEstimate(exerciseId, 'rm10');

  console.log('🎯 useTargetCalculation: Hook inputs:', {
    userId, exerciseId, setIndex, templateTargetReps, templateTargetWeight,
    hasLastSet: !!lastSet, hasEstimate: !!estimate,
    estimateWeight: estimate?.estimated_weight,
    isLoadingLastSet, isLoadingEstimate,
    estimate: estimate // Full estimate object for debugging
  });

  // Calculate target once with all logic consolidated
  const target = React.useMemo(() => {
    console.log('🎯 useTargetCalculation: Computing target with:', {
      hasLastSet: !!lastSet,
      templateTargetWeight,
      estimateWeight: estimate?.estimated_weight,
      setIndex
    });

    if (!lastSet) {
      // NO PREVIOUS SETS - use estimates FIRST TIME ONLY
      const effectiveWeight = estimate?.estimated_weight || templateTargetWeight || 0;
      const effectiveReps = templateTargetReps || 10;
      
      const target = {
        weight: effectiveWeight,
        reps: effectiveReps,
      };
      
      console.log('🎯 useTargetCalculation: NO PREVIOUS SETS - using estimates (FIRST TIME ONLY):', { 
        estimateWeight: estimate?.estimated_weight,
        templateTargetWeight,
        templateTargetReps,
        effectiveWeight,
        effectiveReps,
        target 
      });
      return target;
    }

    // HAS PREVIOUS SETS - use progressive overload system, NEVER use estimates again
    const lastFeel = parseFeelFromNotes(lastSet.notes) || parseFeelFromRPE(lastSet.rpe);
    
    const suggestion = suggestTarget({
      lastWeight: lastSet.weight,
      lastReps: lastSet.reps,
      feel: lastFeel,
      templateTargetReps,
      templateTargetWeight: undefined, // Don't use template weight when we have history
      stepKg: 2.5
    });
    
    console.log('🎯 useTargetCalculation: HAS PREVIOUS SETS - using progressive overload (IGNORING estimates):', { 
      lastSetWeight: lastSet.weight,
      lastSetReps: lastSet.reps,
      lastFeel,
      suggestion 
    });
    return suggestion;
  }, [lastSet, templateTargetReps, templateTargetWeight, estimate?.estimated_weight, setIndex]);

  // Apply target to form - track by unique key to ensure reliability
  const hasAppliedRef = React.useRef<string>('');
  const currentKey = `${userId}-${exerciseId}-${setIndex}-${target.weight}-${target.reps}`;
  
  React.useEffect(() => {
    // Always apply if we haven't applied this exact target combination
    if (onApplyTarget && hasAppliedRef.current !== currentKey && !isLoadingLastSet && !isLoadingEstimate) {
      console.log('🎯 useTargetCalculation: Applying target (key changed):', { 
        target, 
        oldKey: hasAppliedRef.current, 
        newKey: currentKey 
      });
      onApplyTarget(target.weight, target.reps);
      hasAppliedRef.current = currentKey;
    }
  }, [currentKey, onApplyTarget, isLoadingLastSet, isLoadingEstimate, target.weight, target.reps]);

  return {
    target,
    lastSet,
    isLoading: isLoadingLastSet || isLoadingEstimate,
  };
}