import React from 'react';
import { useLastSet } from './useLastSet';
import { useExerciseEstimate } from '@/features/workouts/hooks/useExerciseEstimate';
import { useReadinessTargets } from '@/features/workouts/hooks/useReadinessTargets';
import { useReadinessData } from '@/hooks/useReadinessData';
import { parseFeelFromNotes, parseFeelFromRPE, suggestTarget } from '../lib/targetSuggestions';
import { scaleByReadiness } from '@/lib/training/readinessScaling';
import { resolveAchievableLoad } from '@/lib/equipment/resolveLoad';
import { getCurrentGymContext } from '@/lib/loadout/getProfile';

interface UseTargetCalculationProps {
  userId?: string;
  exerciseId?: string;
  setIndex?: number;
  templateTargetReps?: number;
  templateTargetRepsMin?: number;
  templateTargetRepsMax?: number;
  templateTargetWeight?: number;
  gripKey?: string | null;
  loadType?: 'dual_load' | 'single_load' | 'stack';
  onApplyTarget?: (weight: number, reps: number) => void;
}

export function useTargetCalculation({
  userId,
  exerciseId,
  setIndex,
  templateTargetReps,
  templateTargetRepsMin,
  templateTargetRepsMax,
  templateTargetWeight,
  gripKey,
  loadType = 'dual_load',
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

  // Calculate target with readiness adaptation AND equipment constraints
  const target = React.useMemo(() => {
    console.log('🎯 DEBUG: useTargetCalculation - Starting target calculation with inputs:', {
      userId,
      exerciseId,
      setIndex,
      hasLastSet: !!lastSet,
      lastSetData: lastSet,
      templateTargetWeight,
      templateTargetReps,
      estimateWeight: estimate?.estimated_weight,
      fullEstimate: estimate,
      readinessScore: readiness.score,
      readinessData: readiness,
      loadType,
      gripKey
    });

    // Build baseline target first
    let baselineTarget;
    
    if (!lastSet) {
      console.log('🎯 DEBUG: useTargetCalculation - NO PREVIOUS SETS - Building from estimates/templates');
      
      // NO PREVIOUS SETS - use estimates
      const baseWeight = estimate?.estimated_weight || templateTargetWeight || 20;
      // Use the midpoint of the rep range if available, otherwise fallback to single target or 10
      const baseReps = templateTargetRepsMin && templateTargetRepsMax 
        ? Math.round((templateTargetRepsMin + templateTargetRepsMax) / 2)
        : (templateTargetReps || 10);
      
      baselineTarget = {
        weight: baseWeight,
        reps: baseReps,
      };
      
      console.log('🎯 DEBUG: useTargetCalculation - Baseline target from estimates:', { 
        estimateWeight: estimate?.estimated_weight,
        templateWeight: templateTargetWeight,
        templateReps: templateTargetReps,
        fallbackWeight: 20,
        fallbackReps: 10,
        finalBaseWeight: baseWeight,
        finalBaseReps: baseReps,
        baselineTarget 
      });
    } else {
      console.log('🎯 DEBUG: useTargetCalculation - HAS PREVIOUS SETS - Building progressive overload');
      
      // HAS PREVIOUS SETS - use progressive overload
      const lastFeel = parseFeelFromNotes(lastSet.notes) || parseFeelFromRPE(lastSet.rpe);
      
      console.log('🎯 DEBUG: useTargetCalculation - Parsed feel from last set:', {
        notes: lastSet.notes,
        rpe: lastSet.rpe,
        parsedFeel: lastFeel
      });
      
      // Calculate target reps for this session
      const targetRepsForSession = templateTargetRepsMin && templateTargetRepsMax
        ? Math.round((templateTargetRepsMin + templateTargetRepsMax) / 2)
        : templateTargetReps;
      
      const baseSuggestion = suggestTarget({
        lastWeight: lastSet.weight,
        lastReps: lastSet.reps,
        feel: lastFeel,
        templateTargetReps: targetRepsForSession,
        templateTargetRepsMin,
        templateTargetRepsMax,
        templateTargetWeight: undefined,
        stepKg: 2.5
      });
      
      console.log('🎯 DEBUG: useTargetCalculation - suggestTarget result:', {
        input: {
          lastWeight: lastSet.weight,
          lastReps: lastSet.reps,
          feel: lastFeel,
          templateTargetReps,
          stepKg: 2.5
        },
        output: baseSuggestion
      });
      
      baselineTarget = {
        weight: baseSuggestion.weight,
        reps: baseSuggestion.reps
      };
      
      console.log('🎯 DEBUG: useTargetCalculation - Progressive overload baseline created:', { 
        lastSetWeight: lastSet.weight,
        lastSetReps: lastSet.reps,
        lastSetNotes: lastSet.notes,
        lastSetRPE: lastSet.rpe,
        parsedFeel: lastFeel,
        baselineTarget 
      });
    }

    // Apply readiness scaling
    if (readiness.score !== null && readiness.score !== undefined) {
      console.log('🎯 DEBUG: useTargetCalculation - Applying readiness scaling');
      
      const { weightPct, repsDelta } = scaleByReadiness(readiness.score);
      
      console.log('🎯 DEBUG: useTargetCalculation - Readiness scaling factors:', {
        readinessScore: readiness.score,
        weightPct,
        repsDelta
      });
      
      // Progressive bias (only for readiness >= 25)
      const progressiveBias = readiness.score >= 25 ? 1.005 : 1.0;
      
      console.log('🎯 DEBUG: useTargetCalculation - Progressive bias calculation:', {
        readinessScore: readiness.score,
        isHighReadiness: readiness.score >= 25,
        progressiveBias
      });
      
      // Apply scaling
      const scaledWeight = baselineTarget.weight * weightPct * progressiveBias;
      let scaledReps = Math.max(1, baselineTarget.reps + repsDelta);
      
      console.log('🎯 DEBUG: useTargetCalculation - After scaling application:', {
        baselineWeight: baselineTarget.weight,
        baselineReps: baselineTarget.reps,
        scaledWeight,
        scaledReps,
        calculations: {
          weightCalc: `${baselineTarget.weight} × ${weightPct} × ${progressiveBias} = ${scaledWeight}`,
          repsCalc: `max(1, ${baselineTarget.reps} + ${repsDelta}) = ${scaledReps}`
        }
      });
      
      // CRITICAL: Clamp reps to the defined range
      if (templateTargetRepsMin && templateTargetRepsMax) {
        scaledReps = Math.max(templateTargetRepsMin, Math.min(templateTargetRepsMax, scaledReps));
        console.log('🎯 DEBUG: useTargetCalculation - Clamped reps to range:', {
          originalScaledReps: Math.max(1, baselineTarget.reps + repsDelta),
          min: templateTargetRepsMin,
          max: templateTargetRepsMax,
          clampedReps: scaledReps
        });
      }
      
      // Round to 0.5kg increments
      const finalWeight = Math.round(scaledWeight * 2) / 2;
      
      console.log('🎯 DEBUG: useTargetCalculation - Weight rounding:', {
        scaledWeight,
        finalWeight,
        roundingCalc: `Math.round(${scaledWeight} × 2) / 2 = ${finalWeight}`
      });
      
      // Safety net: don't increase reps on ultra-low readiness
      let finalReps = scaledReps;
      if (readiness.score < 25 && lastSet) {
        finalReps = Math.min(scaledReps, lastSet.reps);
        // Still respect the range even with low readiness
        if (templateTargetRepsMin && templateTargetRepsMax) {
          finalReps = Math.max(templateTargetRepsMin, Math.min(templateTargetRepsMax, finalReps));
        }
        console.log('🎯 DEBUG: useTargetCalculation - Low readiness safety net applied:', {
          readinessScore: readiness.score,
          isLowReadiness: readiness.score < 25,
          hasLastSet: !!lastSet,
          scaledReps,
          lastSetReps: lastSet.reps,
          finalReps
        });
      }
      
      const finalTarget = {
        weight: finalWeight,
        reps: finalReps
      };
      
      console.log('🎯 DEBUG: useTargetCalculation - Final target after readiness scaling:', {
        baselineTarget,
        readinessScore: readiness.score,
        scalingFactors: { weightPct, repsDelta, progressiveBias },
        intermediateValues: { scaledWeight, scaledReps },
        finalTarget
      });
      
      return finalTarget;
    }

    // Fallback to baseline target (no readiness data available)
    console.log('🎯 DEBUG: useTargetCalculation - No readiness data available, using baseline target:', {
      readinessScore: readiness.score,
      baselineTarget
    });
    return baselineTarget;
  }, [lastSet, templateTargetReps, templateTargetWeight, estimate?.estimated_weight, setIndex, readiness.score, userId, exerciseId, loadType]);

  // Equipment-aware target resolution with smart snapping
  const [equipmentResolvedTarget, setEquipmentResolvedTarget] = React.useState(target);
  const [resolvedDetails, setResolvedDetails] = React.useState<any>(null);
  
  React.useEffect(() => {
    console.log('🎯 DEBUG: useTargetCalculation - Equipment resolution effect triggered:', {
      hasTarget: !!target,
      targetWeight: target?.weight,
      targetReps: target?.reps,
      exerciseId,
      shouldResolve: target.weight > 0 && exerciseId
    });
    
    const resolveWithEquipment = async () => {
      try {
        console.log('🎯 DEBUG: useTargetCalculation - Starting equipment resolution');
        
        if (exerciseId && target.weight) {
          // Get gym context for proper equipment resolution
          console.log('🎯 DEBUG: useTargetCalculation - Getting gym context');
          const { gymId } = await getCurrentGymContext();
          
          console.log('🎯 DEBUG: useTargetCalculation - Gym context retrieved:', { gymId });
          
          console.log('🎯 DEBUG: useTargetCalculation - Calling resolveAchievableLoad:', {
            exerciseId,
            targetWeight: target.weight,
            gymId,
            snapStrategy: 'down'
          });
          
          const resolved = await resolveAchievableLoad(exerciseId, target.weight, gymId, { snapStrategy: 'nearest' });
          
          console.log('🎯 DEBUG: useTargetCalculation - Equipment resolution completed:', {
            original: target.weight,
            resolved: resolved.totalKg,
            implement: resolved.implement,
            source: resolved.source,
            residualKg: resolved.residualKg,
            achievable: resolved.achievable,
            details: resolved.details,
            gymId
          });
          
          const equipmentTarget = {
            weight: resolved.totalKg,
            reps: target.reps
          };
          
          console.log('🎯 DEBUG: useTargetCalculation - Setting equipment-resolved target:', equipmentTarget);
          
          setEquipmentResolvedTarget(equipmentTarget);
          setResolvedDetails({
            ...resolved.details,
            snappedFrom: Math.abs(resolved.residualKg) >= 0.25 ? target.weight : null,
            totalKg: resolved.totalKg,
            residualKg: resolved.residualKg
          });
        }
      } catch (error) {
        console.error('🎯 DEBUG: useTargetCalculation - Equipment resolution failed:', error);
        console.log('🎯 DEBUG: useTargetCalculation - Falling back to original target:', target);
        setEquipmentResolvedTarget(target);
      }
    };

    if (target.weight > 0 && exerciseId) {
      console.log('🎯 DEBUG: useTargetCalculation - Conditions met, starting equipment resolution');
      resolveWithEquipment();
    } else {
      console.log('🎯 DEBUG: useTargetCalculation - Conditions not met, using original target:', {
        targetWeight: target.weight,
        exerciseId,
        reason: target.weight <= 0 ? 'zero/negative weight' : 'no exercise ID'
      });
      setEquipmentResolvedTarget(target);
    }
  }, [target.weight, target.reps, exerciseId]);

  // Apply target to form - track by unique key to ensure reliability
  const hasAppliedRef = React.useRef<string>('');
  const currentKey = `${userId}-${exerciseId}-${setIndex}-${equipmentResolvedTarget.weight}-${equipmentResolvedTarget.reps}`;
  
  React.useEffect(() => {
    console.log('🎯 DEBUG: useTargetCalculation - Target application effect triggered:', {
      hasOnApplyTarget: !!onApplyTarget,
      currentKey,
      previousKey: hasAppliedRef.current,
      isKeyDifferent: hasAppliedRef.current !== currentKey,
      isLoadingLastSet,
      isLoadingEstimate,
      equipmentResolvedTarget,
      shouldApply: onApplyTarget && hasAppliedRef.current !== currentKey && !isLoadingLastSet && !isLoadingEstimate
    });
    
    // Always apply if we haven't applied this exact target combination
    if (onApplyTarget && hasAppliedRef.current !== currentKey && !isLoadingLastSet && !isLoadingEstimate) {
      console.log('🎯 DEBUG: useTargetCalculation - Applying equipment-resolved target to form:', { 
        target: equipmentResolvedTarget, 
        oldKey: hasAppliedRef.current, 
        newKey: currentKey,
        weight: equipmentResolvedTarget.weight,
        reps: equipmentResolvedTarget.reps
      });
      
      onApplyTarget(equipmentResolvedTarget.weight, equipmentResolvedTarget.reps);
      hasAppliedRef.current = currentKey;
      
      console.log('🎯 DEBUG: useTargetCalculation - Target application completed, key updated to:', currentKey);
    } else {
      console.log('🎯 DEBUG: useTargetCalculation - Target application skipped:', {
        reason: !onApplyTarget ? 'no callback' :
                hasAppliedRef.current === currentKey ? 'already applied' :
                isLoadingLastSet ? 'loading last set' :
                isLoadingEstimate ? 'loading estimate' : 'unknown'
      });
    }
  }, [currentKey, onApplyTarget, isLoadingLastSet, isLoadingEstimate, equipmentResolvedTarget.weight, equipmentResolvedTarget.reps]);

  return {
    target: equipmentResolvedTarget,
    equipmentResolvedTarget,
    resolvedDetails,
    lastSet,
    isLoading: isLoadingLastSet || isLoadingEstimate,
  };
}