import { useMemo } from 'react';

export function useExerciseMuscleContext(exerciseId: string) {
  // TODO: wire real data
  const muscleData = useMemo(() => ({
    primaryMuscleGroupId: 'chest',
    secondaryMuscleGroupIds: ['shoulders', 'triceps'],
  }), [exerciseId]);

  // warmupContext is maintained at session level in the existing hook implementation;
  // provide minimal shape so useAdaptiveWarmup can work.
  const warmupContext = useMemo(() => ({
    primary: new Set<string>(),
    secondary: new Set<string>(),
  }), []);

  const commitMuscle = (d: typeof muscleData) => {
    // in real app, push to store so next exercise gets fewer warmups
    void d;
  };

  return { muscleData, warmupContext, commitMuscle };
}