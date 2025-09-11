import React, { useState, useEffect } from 'react';
import { resolveAchievableLoad } from '@/lib/equipment/resolveLoad';
import { 
  createWarmupContext, 
  nextWarmupCountFor, 
  getWarmupPercentages,
  type WarmupContext,
  type ExerciseMuscleData 
} from '@/lib/warmup/adaptiveWarmupContext';

interface WarmupSet {
  percentage: number;
  weight: number;
  reps: number;
  restSeconds: number;
}

interface UseAdaptiveWarmupProps {
  workingWeight: number;
  exerciseId?: string;
  exerciseMuscleData?: ExerciseMuscleData;
  warmupContext?: WarmupContext;
  onMuscleCommit?: (muscleData: ExerciseMuscleData) => void;
}

export function useAdaptiveWarmup({
  workingWeight,
  exerciseId,
  exerciseMuscleData,
  warmupContext,
  onMuscleCommit
}: UseAdaptiveWarmupProps) {
  const [warmupSets, setWarmupSets] = useState<WarmupSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!exerciseMuscleData || !warmupContext || workingWeight <= 0) {
      // Fallback to standard 3-set warmup
      setWarmupSets([
        { percentage: 40, weight: workingWeight * 0.4, reps: 12, restSeconds: 45 },
        { percentage: 60, weight: workingWeight * 0.6, reps: 9, restSeconds: 60 },
        { percentage: 80, weight: workingWeight * 0.8, reps: 6, restSeconds: 75 }
      ]);
      return;
    }

    const generateAdaptiveWarmup = async () => {
      setIsLoading(true);
      
      try {
        // Determine warmup count based on muscle usage
        const setCount = nextWarmupCountFor(exerciseMuscleData, warmupContext);
        const percentages = getWarmupPercentages(setCount);
        
        console.log('🔥 Adaptive warmup:', {
          exercise: exerciseId,
          primaryMuscle: exerciseMuscleData.primaryMuscleGroupId,
          setCount,
          percentages,
          contextState: {
            primary: Array.from(warmupContext.primary),
            secondary: Array.from(warmupContext.secondary)
          }
        });

        const warmupPromises = percentages.map(async (percentage, index) => {
          const targetWeight = workingWeight * (percentage / 100);
          
          try {
            const resolved = await resolveAchievableLoad(
              exerciseId || '',
              targetWeight
            );
            
            return {
              percentage,
              weight: resolved.totalKg,
              reps: Math.max(5, 15 - index * 3), // 15, 12, 9 reps
              restSeconds: 45 + index * 15 // 45, 60, 75 seconds
            };
          } catch (error) {
            console.error('Warmup weight resolution failed:', error);
            return {
              percentage,
              weight: targetWeight,
              reps: Math.max(5, 15 - index * 3),
              restSeconds: 45 + index * 15
            };
          }
        });

        const resolvedSets = await Promise.all(warmupPromises);
        setWarmupSets(resolvedSets);
        
        // Log telemetry
        console.log('🎯 Adaptive warmup generated:', {
          exerciseId,
          setCount,
          muscleWarmth: warmupContext.primary.has(exerciseMuscleData.primaryMuscleGroupId) ? 'primary' :
                       warmupContext.secondary.has(exerciseMuscleData.primaryMuscleGroupId) ? 'secondary' : 'cold',
          sets: resolvedSets.map(s => ({ percentage: s.percentage, weight: s.weight, reps: s.reps }))
        });
        
      } catch (error) {
        console.error('Error generating adaptive warmup:', error);
        // Fallback
        setWarmupSets([
          { percentage: 40, weight: workingWeight * 0.4, reps: 12, restSeconds: 45 },
          { percentage: 60, weight: workingWeight * 0.6, reps: 9, restSeconds: 60 },
          { percentage: 80, weight: workingWeight * 0.8, reps: 6, restSeconds: 75 }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    generateAdaptiveWarmup();
  }, [workingWeight, exerciseId, exerciseMuscleData, warmupContext]);

  // Helper to commit muscle usage (call after completing working sets)
  const commitMuscleUsage = React.useCallback(() => {
    if (exerciseMuscleData && onMuscleCommit) {
      onMuscleCommit(exerciseMuscleData);
    }
  }, [exerciseMuscleData, onMuscleCommit]);

  return {
    warmupSets,
    isLoading,
    warmupCount: warmupSets.length,
    commitMuscleUsage
  };
}