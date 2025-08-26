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

  console.log('🎯 useTargetCalculation: Hook inputs:', {
    userId, exerciseId, setIndex, templateTargetReps, templateTargetWeight,
    hasLastSet: !!lastSet, hasEstimate: !!estimate,
    estimateWeight: estimate?.estimated_weight,
    isLoadingLastSet, isLoadingEstimate
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
      // NO PREVIOUS SETS - ONLY THEN use estimates from readiness dialog
      const effectiveWeight = estimate?.estimated_weight || templateTargetWeight || 0;
      
      const target = {
        weight: effectiveWeight,
        reps: templateTargetReps ?? 10,
      };
      
      console.log('🎯 useTargetCalculation: NO PREVIOUS SETS - using estimates (ONE TIME ONLY):', { 
        estimateWeight: estimate?.estimated_weight,
        templateTargetWeight,
        effectiveWeight,
        target 
      });
      return target;
    }

    // HAS PREVIOUS SETS - use progressive overload system, NEVER use estimates again

    // Has previous sets - use progressive overload system, IGNORE estimates completely
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