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