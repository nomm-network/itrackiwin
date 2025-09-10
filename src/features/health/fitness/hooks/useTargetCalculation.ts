import React from 'react';
import { useLastSet } from './useLastSet';
import { useExerciseEstimate } from '@/features/workouts/hooks/useExerciseEstimate';
import { useReadinessTargets } from '@/features/workouts/hooks/useReadinessTargets';
import { useReadinessData } from '@/hooks/useReadinessData';
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
  const { getSmartTarget } = useReadinessTargets();
  const readiness = useReadinessData();

  console.log('🎯 useTargetCalculation: Hook inputs:', {
    userId, exerciseId, setIndex, templateTargetReps, templateTargetWeight,
    hasLastSet: !!lastSet, hasEstimate: !!estimate,
    estimateWeight: estimate?.estimated_weight,
    isLoadingLastSet, isLoadingEstimate,
    estimate: estimate // Full estimate object for debugging
  });

  // Calculate target with readiness adaptation for smarter progression
  const target = React.useMemo(() => {
    console.log('🎯 useTargetCalculation: Computing target with readiness adaptation:', {
      hasLastSet: !!lastSet,
      templateTargetWeight,
      estimateWeight: estimate?.estimated_weight,
      readinessScore: readiness.score,
      setIndex
    });

    // Use smart target calculation with readiness adaptation when available
    if (userId && exerciseId && readiness.score !== null && readiness.score !== undefined) {
      // Note: getSmartTarget is async, so we'll use a different approach here
      // For now, we'll enhance the existing logic with simple readiness modification
      
      if (!lastSet) {
        // NO PREVIOUS SETS - use estimates with readiness adjustment
        const baseWeight = estimate?.estimated_weight || templateTargetWeight || 20;
        const baseReps = templateTargetReps || 10;
        
        // Simple readiness adjustment for new exercises
        const readinessMultiplier = Math.max(0.8, Math.min(1.2, readiness.score / 75));
        const adjustedWeight = Math.round((baseWeight * readinessMultiplier) * 2) / 2; // Round to 0.5kg
        
        const target = {
          weight: adjustedWeight,
          reps: baseReps,
        };
        
        console.log('🎯 useTargetCalculation: NO PREVIOUS SETS - using estimates with readiness adjustment:', { 
          baseWeight,
          readinessScore: readiness.score,
          readinessMultiplier,
          adjustedWeight,
          target 
        });
        return target;
      }

      // HAS PREVIOUS SETS - use progressive overload with readiness enhancement
      const lastFeel = parseFeelFromNotes(lastSet.notes) || parseFeelFromRPE(lastSet.rpe);
      
      const baseSuggestion = suggestTarget({
        lastWeight: lastSet.weight,
        lastReps: lastSet.reps,
        feel: lastFeel,
        templateTargetReps,
        templateTargetWeight: undefined,
        stepKg: 2.5
      });
      
      // Apply readiness-based modification to progression
      const readinessBonus = (readiness.score - 65) * 0.002; // ±2% per 10 points from neutral (65)
      const adjustedWeight = Math.round((baseSuggestion.weight * (1 + readinessBonus)) * 2) / 2;
      
      const enhancedTarget = {
        weight: Math.max(lastSet.weight, adjustedWeight), // Never go below last weight
        reps: baseSuggestion.reps
      };
      
      console.log('🎯 useTargetCalculation: HAS PREVIOUS SETS - progressive overload with readiness:', { 
        lastSetWeight: lastSet.weight,
        baseSuggestionWeight: baseSuggestion.weight,
        readinessScore: readiness.score,
        readinessBonus,
        adjustedWeight,
        enhancedTarget 
      });
      return enhancedTarget;
    }

    // Fallback to original logic when no readiness data
    if (!lastSet) {
      const effectiveWeight = estimate?.estimated_weight || templateTargetWeight || 20;
      const effectiveReps = templateTargetReps || 10;
      return { weight: effectiveWeight, reps: effectiveReps };
    }

    const lastFeel = parseFeelFromNotes(lastSet.notes) || parseFeelFromRPE(lastSet.rpe);
    return suggestTarget({
      lastWeight: lastSet.weight,
      lastReps: lastSet.reps,
      feel: lastFeel,
      templateTargetReps,
      templateTargetWeight: undefined,
      stepKg: 2.5
    });
  }, [lastSet, templateTargetReps, templateTargetWeight, estimate?.estimated_weight, setIndex, readiness.score, userId, exerciseId]);

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