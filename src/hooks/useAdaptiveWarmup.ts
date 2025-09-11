import React, { useState, useEffect } from 'react';
import { resolveAchievableLoad } from '@/lib/equipment/resolveLoad';
import { useWarmth } from '@/features/workouts/warmup/WarmthContext';

interface WarmupSet {
  percentage: number;
  weight: number;
  reps: number;
  restSeconds: number;
}

interface UseAdaptiveWarmupProps {
  workingWeight: number;
  exerciseId: string;
  exerciseMuscleData?: { primaryMuscleGroupId: string; secondaryMuscleGroupIds?: string[] };
  onMuscleCommit?: (hit: { primary: string; secondary?: string[] }) => void;
}

function getWarmupPercentages(count: 1 | 2 | 3): number[] {
  return count === 1 ? [70] : count === 2 ? [50, 75] : [40, 60, 80];
}

function nextWarmupCountFor(
  exercise: { primaryMuscleGroupId: string; secondaryMuscleGroupIds?: string[] },
  ctx: { primary: Set<string>; secondary: Set<string> }
): 1 | 2 | 3 {
  const pid = String(exercise.primaryMuscleGroupId);
  if (ctx.primary.has(pid)) return 1;
  if (ctx.secondary.has(pid)) return 2;
  return 3;
}

export function useAdaptiveWarmup({
  workingWeight,
  exerciseId,
  exerciseMuscleData,
  onMuscleCommit
}: UseAdaptiveWarmupProps) {
  const { warmth, commit } = useWarmth();
  const [warmupSets, setWarmupSets] = useState<WarmupSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!exerciseMuscleData || workingWeight <= 0) {
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
        const setCount = nextWarmupCountFor(exerciseMuscleData, warmth);
        const percentages = getWarmupPercentages(setCount);
        
        console.log('🔥 Adaptive warmup:', {
          exercise: exerciseId,
          primaryMuscle: exerciseMuscleData.primaryMuscleGroupId,
          setCount,
          percentages,
          contextState: {
            primary: Array.from(warmth.primary),
            secondary: Array.from(warmth.secondary)
          }
        });

        const warmupPromises = percentages.map(async (percentage, index) => {
          const targetWeight = workingWeight * (percentage / 100);
          
          try {
            const resolved = await resolveAchievableLoad(exerciseId, targetWeight);
            
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
          muscleWarmth: warmth.primary.has(String(exerciseMuscleData.primaryMuscleGroupId)) ? 'primary' :
                       warmth.secondary.has(String(exerciseMuscleData.primaryMuscleGroupId)) ? 'secondary' : 'cold',
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
  }, [workingWeight, exerciseId, JSON.stringify(exerciseMuscleData), warmth.bump]);

  // Call this after the WORKING sets are done for this exercise
  const commitMuscleUsage = React.useCallback(() => {
    if (!exerciseMuscleData) return;
    const payload = {
      primary: String(exerciseMuscleData.primaryMuscleGroupId),
      secondary: (exerciseMuscleData.secondaryMuscleGroupIds || []).map(String),
    };
    commit(payload);
    onMuscleCommit?.(payload);
  }, [exerciseMuscleData, commit, onMuscleCommit]);

  return {
    warmupSets,
    isLoading,
    warmupCount: warmupSets.length,
    commitMuscleUsage
  };
}