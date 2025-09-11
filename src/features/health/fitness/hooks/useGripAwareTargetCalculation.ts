import React from 'react';
import { useGripAwareLastSet } from './useGripAwareLastSet';
import { useExerciseEstimate } from '@/features/workouts/hooks/useExerciseEstimate';
import { parseFeelFromNotes, parseFeelFromRPE, suggestTarget } from '../lib/targetSuggestions';
import { enhancedSuggestTarget } from '@/lib/training/readinessTargeting';
import { getActiveWeightModel } from '@/lib/equipment/gymWeightModel';
import { useReadinessData } from '@/hooks/useReadinessData';

interface UseGripAwareTargetCalculationProps {
  userId?: string;
  exerciseId?: string;
  setIndex?: number;
  templateTargetReps?: number;
  templateTargetWeight?: number;
  gripIds?: string[] | null;
  onApplyTarget?: (weight: number, reps: number) => void;
}

export function useGripAwareTargetCalculation({
  userId,
  exerciseId,
  setIndex,
  templateTargetReps,
  templateTargetWeight,
  gripIds,
  onApplyTarget,
}: UseGripAwareTargetCalculationProps) {
  const { data: lastSet, isLoading: isLoadingLastSet, isUsingFallback } = useGripAwareLastSet({
    userId,
    exerciseId,
    setIndex,
    gripIds
  });
  
  const { data: estimate, isLoading: isLoadingEstimate } = useExerciseEstimate(exerciseId, 'rm10');
  const readiness = useReadinessData();
  
  // Load weight model for equipment-aware calculations
  const [weightModel, setWeightModel] = React.useState(null);
  
  React.useEffect(() => {
    if (userId) {
      getActiveWeightModel(userId).then(setWeightModel);
    }
  }, [userId]);

  console.log('🎯 useGripAwareTargetCalculation: Hook inputs:', {
    userId, exerciseId, setIndex, templateTargetReps, templateTargetWeight,
    gripIds, hasLastSet: !!lastSet, hasEstimate: !!estimate,
    isUsingFallback, estimateWeight: estimate?.estimated_weight,
    isLoadingLastSet, isLoadingEstimate
  });

  // Calculate target once with all logic consolidated
  const target = React.useMemo(() => {
    console.log('🎯 useGripAwareTargetCalculation: Computing target with:', {
      hasLastSet: !!lastSet,
      isUsingFallback,
      templateTargetWeight,
      estimateWeight: estimate?.estimated_weight,
      setIndex,
      gripIds
    });

    if (!lastSet) {
      // NO PREVIOUS SETS - use estimates FIRST TIME ONLY
      const effectiveWeight = estimate?.estimated_weight || templateTargetWeight || 0;
      const effectiveReps = templateTargetReps || 10;
      
      const target = {
        weight: effectiveWeight,
        reps: effectiveReps,
      };
      
      console.log('🎯 useGripAwareTargetCalculation: NO PREVIOUS SETS - using estimates (FIRST TIME ONLY):', { 
        estimateWeight: estimate?.estimated_weight,
        templateTargetWeight,
        templateTargetReps,
        effectiveWeight,
        effectiveReps,
        target 
      });
      return target;
    }

    // HAS PREVIOUS SETS - use progressive overload system with equipment awareness
    const lastFeel = parseFeelFromNotes(lastSet.notes) || parseFeelFromRPE(lastSet.rpe);
    
    let suggestion;
    
    // Use enhanced targeting if weight model and readiness are available
    if (weightModel && readiness?.score !== null && readiness?.score !== undefined) {
      suggestion = enhancedSuggestTarget({
        lastWeight: lastSet.weight,
        lastReps: lastSet.reps,
        feel: lastFeel,
        templateTargetReps,
        templateTargetWeight: undefined,
        stepKg: isUsingFallback ? 1.25 : 2.5,
        model: weightModel,
        readinessScore: readiness.score
      });
    } else {
      // Fallback to original system
      suggestion = suggestTarget({
        lastWeight: lastSet.weight,
        lastReps: lastSet.reps,
        feel: lastFeel,
        templateTargetReps,
        templateTargetWeight: undefined,
        stepKg: isUsingFallback ? 1.25 : 2.5
      });
    }
    
    console.log('🎯 useGripAwareTargetCalculation: HAS PREVIOUS SETS - using progressive overload:', { 
      lastSetWeight: lastSet.weight,
      lastSetReps: lastSet.reps,
      lastFeel,
      isUsingFallback,
      stepKg: isUsingFallback ? 1.25 : 2.5,
      suggestion 
    });
    return suggestion;
  }, [lastSet, templateTargetReps, templateTargetWeight, estimate?.estimated_weight, setIndex, isUsingFallback]);

  // Apply target to form - track by unique key to ensure reliability
  const hasAppliedRef = React.useRef<string>('');
  const gripKey = gripIds && gripIds.length > 0 ? gripIds.slice().sort().join(',') : 'no-grips';
  const currentKey = `${userId}-${exerciseId}-${setIndex}-${gripKey}-${target.weight}-${target.reps}`;
  
  React.useEffect(() => {
    // Always apply if we haven't applied this exact target combination
    if (onApplyTarget && hasAppliedRef.current !== currentKey && !isLoadingLastSet && !isLoadingEstimate) {
      console.log('🎯 useGripAwareTargetCalculation: Applying target (key changed):', { 
        target, 
        oldKey: hasAppliedRef.current, 
        newKey: currentKey,
        isUsingFallback
      });
      onApplyTarget(target.weight, target.reps);
      hasAppliedRef.current = currentKey;
    }
  }, [currentKey, onApplyTarget, isLoadingLastSet, isLoadingEstimate, target.weight, target.reps]);

  return {
    target,
    lastSet,
    isLoading: isLoadingLastSet || isLoadingEstimate,
    isUsingFallback
  };
}