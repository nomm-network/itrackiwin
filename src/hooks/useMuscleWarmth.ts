import { useState, useEffect } from 'react';
import { globalMuscleWarmthTracker, MuscleWarmthState } from '@/lib/training/muscleWarmthTracker';

export function useMuscleWarmth() {
  const [warmthState, setWarmthState] = useState<MuscleWarmthState>(
    globalMuscleWarmthTracker.getState()
  );

  useEffect(() => {
    const unsubscribe = globalMuscleWarmthTracker.subscribe(setWarmthState);
    return () => {
      unsubscribe();
    };
  }, []);

  const recordSet = (exerciseInfo: {
    primaryMuscleId?: string;
    secondaryMuscleIds?: string[];
    isMainLift?: boolean;
  }) => {
    globalMuscleWarmthTracker.recordSet(exerciseInfo);
  };

  const getWarmth = (muscleGroupId: string) => {
    return globalMuscleWarmthTracker.getWarmth(muscleGroupId);
  };

  const calculateWarmupNeeds = (exerciseInfo: {
    primaryMuscleId?: string;
    secondaryMuscleIds?: string[];
  }) => {
    return globalMuscleWarmthTracker.calculateWarmupNeeds(exerciseInfo);
  };

  const resetWarmth = () => {
    globalMuscleWarmthTracker.reset();
  };

  return {
    warmthState,
    recordSet,
    getWarmth,
    calculateWarmupNeeds,
    resetWarmth
  };
}