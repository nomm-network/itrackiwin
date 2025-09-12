import React, {useMemo} from 'react';
import WarmupDrawer from './WarmupDrawer';
import WorkoutSetRow from './WorkoutSetRow';
import {useExerciseMuscleContext} from '../hooks/useExerciseMuscleContext';
// Mock for now - these hooks need to be implemented
const useAdaptiveWarmup = () => ({
  warmupSets: [
    { percentage: 50, weight: 30, reps: 8, restSeconds: 60 },
    { percentage: 75, weight: 45, reps: 5, restSeconds: 90 }
  ],
  warmupCount: 2,
  commitMuscleUsage: () => {}
});

const useTargetCalculation = ({ exerciseId, lastWeightKg, lastReps }: any) => ({
  target: { weight: lastWeightKg, reps: lastReps },
  resolvedTarget: { weight: lastWeightKg, reps: lastReps }
});

export default function ExerciseBlock({
  index,
  exercise,
  onDebug,
}: {
  index: number;
  exercise: {
    id: string;
    name: string;
    loadType: 'single_total' | 'dual_load' | 'stack';
    barType?: 'barbell' | 'ezbar';
    workingWeightKg?: number;
    targetReps?: number;
  };
  onDebug: (s: string) => void;
}) {
  const { muscleData, warmupContext, commitMuscle } = useExerciseMuscleContext(exercise.id);
  const { target, resolvedTarget } = useTargetCalculation({
    exerciseId: exercise.id,
    lastWeightKg: exercise.workingWeightKg ?? 0,
    lastReps: exercise.targetReps ?? 8,
  });

  const { warmupSets, warmupCount, commitMuscleUsage } = useAdaptiveWarmup();

  const sets = useMemo(() => ([
    { index: 1, target: resolvedTarget },
    { index: 2, target: resolvedTarget },
    { index: 3, target: resolvedTarget },
  ]), [resolvedTarget]);

  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-lg font-medium">{index}. {exercise.name}</div>
        <WarmupDrawer
          warmupSets={warmupSets}
          warmupCount={warmupCount}
          onStart={() => onDebug(`Warmup opened for ${exercise.name}`)}
          onComplete={() => {
            commitMuscleUsage();
            onDebug(`Warmup completed for ${exercise.name}`);
          }}
        />
      </div>

      <div className="space-y-3">
        {sets.map(s => (
          <WorkoutSetRow
            key={s.index}
            setIndex={s.index}
            loadType={exercise.loadType}
            barType={exercise.barType}
            target={s.target}
            onDebug={onDebug}
          />
        ))}
      </div>
    </section>
  );
}