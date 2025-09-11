import { useState, useEffect } from 'react';
import { resolveWeightForExercise } from '@/lib/loading/equipmentResolver';

export interface WarmupSet {
  percentage: number;
  weight: number;
  reps: number;
  restSeconds: number;
}

export function useEquipmentAwareWarmup(
  workingWeight: number,
  exerciseId?: string,
  loadType: 'dual_load' | 'single_load' | 'stack' = 'dual_load',
  userId?: string,
  muscleWarmth: number = 0 // 0 = cold, 1 = warm, 2 = hot
) {
  const [warmupSets, setWarmupSets] = useState<WarmupSet[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const generateWarmup = async () => {
      if (workingWeight <= 0) {
        setWarmupSets([]);
        return;
      }

      setIsLoading(true);
      
      try {
        // Determine number of warmup sets based on muscle warmth
        let warmupCount: number;
        let percentages: number[];
        
        if (muscleWarmth >= 2) {
          // Hot: minimal warmup
          warmupCount = 1;
          percentages = [0.70];
        } else if (muscleWarmth >= 1) {
          // Warm: moderate warmup
          warmupCount = 2;
          percentages = [0.55, 0.75];
        } else {
          // Cold: full warmup
          warmupCount = 3;
          percentages = [0.40, 0.60, 0.80];
        }

        const sets: WarmupSet[] = [];
        
        for (let i = 0; i < warmupCount; i++) {
          const targetWeight = workingWeight * percentages[i];
          
          // Resolve weight to achievable load with gym equipment
          const resolved = await resolveWeightForExercise(
            targetWeight,
            'kg',
            exerciseId,
            loadType,
            userId
          );
          
          sets.push({
            percentage: percentages[i],
            weight: resolved.weight,
            reps: Math.max(15 - i * 3, 5), // 15, 12, 9 reps (min 5)
            restSeconds: 45 + i * 15 // 45, 60, 75 seconds
          });
        }
        
        setWarmupSets(sets);
      } catch (error) {
        console.error('Error generating equipment-aware warmup:', error);
        // Fallback to simple percentage-based warmup
        const fallbackSets: WarmupSet[] = [
          { percentage: 0.40, weight: workingWeight * 0.4, reps: 12, restSeconds: 45 },
          { percentage: 0.60, weight: workingWeight * 0.6, reps: 9, restSeconds: 60 },
          { percentage: 0.80, weight: workingWeight * 0.8, reps: 6, restSeconds: 75 }
        ];
        setWarmupSets(fallbackSets);
      } finally {
        setIsLoading(false);
      }
    };

    generateWarmup();
  }, [workingWeight, exerciseId, loadType, userId, muscleWarmth]);

  return {
    warmupSets,
    isLoading,
    warmupCount: warmupSets.length
  };
}