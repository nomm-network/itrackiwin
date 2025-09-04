import { useQuery } from '@tanstack/react-query';
import { getWorkoutExercises, getSmartTargetForExercise } from '../api/workouts.api';

export function WarmupPanel({ workoutId }: { workoutId: string }) {
  // We show warmup for the *first* exercise in the workout
  const exQ = useQuery({
    queryKey: ['workout-exercises', workoutId, 'first'],
    queryFn: async () => {
      const all = await getWorkoutExercises(workoutId);
      return all[0] ?? null;
    },
  });

  const warmupQ = useQuery({
    queryKey: ['warmup', workoutId, exQ.data?.exercise_id],
    enabled: !!exQ.data?.exercise_id,
    queryFn: async () =>
      getSmartTargetForExercise(workoutId, exQ.data!.exercise_id),
  });

  if (!exQ.data) return null;

  const warm = warmupQ.data;
  const top = warm?.target_weight_kg;

  return (
    <section className="rounded-xl border p-4 bg-card">
      <div className="font-semibold mb-2">Warm-up</div>
      <div className="text-sm text-muted-foreground mb-3">
        Strategy: ramped • Top: {top ? `${top}kg` : '—'}
      </div>
      <ul className="text-sm space-y-1">
        {(warm?.warmup ?? []).map((w: any, i: number) => (
          <li key={i} className="flex justify-between">
            <span>– {w.weight_kg}kg × {w.reps} reps</span>
            <span className="text-muted-foreground">{w.rest_s ?? ''}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}