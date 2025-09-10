import React from 'react';
import { useLastSet } from './useLastSet';
import { useExerciseEstimate } from '@/features/workouts/hooks/useExerciseEstimate';
import { useReadinessTargets } from '@/features/workouts/hooks/useReadinessTargets';
import { useReadinessData } from '@/hooks/useReadinessData';
import { parseFeelFromNotes, parseFeelFromRPE, suggestTarget } from '../lib/targetSuggestions';
import { scaleByReadiness } from '@/lib/training/readinessScaling';

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

    // Build baseline target first
    let baselineTarget;
    
    if (!lastSet) {
      // NO PREVIOUS SETS - use estimates
      const baseWeight = estimate?.estimated_weight || templateTargetWeight || 20;
      const baseReps = templateTargetReps || 10;
      
      baselineTarget = {
        weight: baseWeight,
        reps: baseReps,
      };
      
      console.log('🎯 useTargetCalculation: NO PREVIOUS SETS - using estimates:', { 
        baseWeight,
        baseReps,
        baselineTarget 
      });
    } else {
      // HAS PREVIOUS SETS - use progressive overload
      const lastFeel = parseFeelFromNotes(lastSet.notes) || parseFeelFromRPE(lastSet.rpe);
      
      const baseSuggestion = suggestTarget({
        lastWeight: lastSet.weight,
        lastReps: lastSet.reps,
        feel: lastFeel,
        templateTargetReps,
        templateTargetWeight: undefined,
        stepKg: 2.5
      });
      
      baselineTarget = {
        weight: baseSuggestion.weight,
        reps: baseSuggestion.reps
      };
      
      console.log('🎯 useTargetCalculation: HAS PREVIOUS SETS - progressive overload baseline:', { 
        lastSetWeight: lastSet.weight,
        lastSetReps: lastSet.reps,
        baselineTarget 
      });
    }

    // Apply readiness scaling
    if (readiness.score !== null && readiness.score !== undefined) {
      const { weightPct, repsDelta } = scaleByReadiness(readiness.score);
      
      // Progressive bias (only for readiness >= 25)
      const progressiveBias = readiness.score >= 25 ? 1.005 : 1.0;
      
      // Apply scaling
      const scaledWeight = baselineTarget.weight * weightPct * progressiveBias;
      const scaledReps = Math.max(1, baselineTarget.reps + repsDelta);
      
      // Round to 0.5kg increments
      const finalWeight = Math.round(scaledWeight * 2) / 2;
      
      // Safety net: don't increase reps on ultra-low readiness
      let finalReps = scaledReps;
      if (readiness.score < 25 && lastSet) {
        finalReps = Math.min(scaledReps, lastSet.reps);
      }
      
      const finalTarget = {
        weight: finalWeight,
        reps: finalReps
      };
      
      console.log('🎯 useTargetCalculation: Applied readiness scaling:', {
        readinessScore: readiness.score,
        weightPct,
        repsDelta,
        progressiveBias,
        scaledWeight,
        finalTarget
      });
      
      return finalTarget;
    }

    // Fallback to baseline target (no readiness data available)
    console.log('🎯 useTargetCalculation: No readiness data - using baseline target');
    return baselineTarget;
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