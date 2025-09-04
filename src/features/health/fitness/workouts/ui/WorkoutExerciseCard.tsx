import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logSet } from '../api/workouts.api';
import { toast } from 'sonner';

export function WorkoutExerciseCard({
  workout,
  exercise,
}: {
  workout: any;
  exercise: any;
}) {
  const qc = useQueryClient();

  const m = useMutation({
    mutationFn: (form: { weight_kg: number; reps: number; set_index: number }) =>
      logSet({
        workout_exercise_id: exercise.id,
        set_index: form.set_index,
        weight_kg: form.weight_kg,
        reps: form.reps,
      }),
    onSuccess: () => {
      toast.success('Set saved');
      qc.invalidateQueries({ queryKey: ['workout-exercises', workout.id] });
      qc.invalidateQueries({ queryKey: ['warmup', workout.id, exercise.exercise_id] });
    },
    onError: (e: any) => {
      toast.error(`SET SAVE FAILED: ${e.message ?? e}`);
    },
  });

  const nextIndex = (exercise.logged_sets_count ?? 0) + 1; // or compute from sets list

  return (
    <section className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          {exercise.exercises?.display_name ?? 'Exercise'}
        </div>
        <div className="text-sm text-muted-foreground">
          Target: {exercise.target_weight_kg ?? '—'}kg × {exercise.target_reps ?? '—'}
        </div>
      </div>

      <form
        className="mt-4 grid grid-cols-3 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const weight_kg = Number(fd.get('weight'));
          const reps = Number(fd.get('reps'));
          m.mutate({ weight_kg, reps, set_index: nextIndex });
        }}
      >
        <input name="weight" inputMode="decimal" placeholder="kg" className="input" required />
        <input name="reps" inputMode="numeric" placeholder="reps" className="input" required />
        <button className="btn btn-primary" disabled={m.isPending}>
          {m.isPending ? 'Saving…' : `Save Set ${nextIndex}`}
        </button>
      </form>
    </section>
  );
}