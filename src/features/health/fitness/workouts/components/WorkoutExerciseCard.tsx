import React from 'react';
import type { WorkoutExercise } from '../api/useWorkout';
import WarmupPanel from './WarmupPanel';
import { WorkoutSetsBlock } from './WorkoutSetsBlock';

export default function WorkoutExerciseCard({ we }: { we: WorkoutExercise }) {
  // Add defensive checks
  if (!we || !we.exercise) {
    return (
      <div className="rounded-xl border border-red-900/30 bg-[#1a0d0d] p-4">
        <div className="text-red-400">Exercise data missing</div>
      </div>
    );
  }

  const name = we.exercise.display_name || we.exercise.slug;

  const warmupSteps: {kg:number; reps:number; rest_s:number}[] =
    we?.attribute_values_json?.warmup ?? [];

  // pill: completed/total normal sets
  const totalNormal = we.workout_sets?.filter(s => s.set_kind !== 'warmup').length || 3;
  const doneNormal  = we.workout_sets?.filter(s => s.set_kind !== 'warmup' && s.is_completed).length || 0;

  return (
    <div className="rounded-xl border border-emerald-900/30 bg-[#0d1a17] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-emerald-200">{name}</div>
        <div className="rounded-full bg-emerald-900/40 px-2 py-0.5 text-xs text-emerald-300">
          {doneNormal}/{totalNormal}
        </div>
      </div>

      <WarmupPanel
        topWeightKg={we.target_weight_kg ?? null}
        warmupSteps={Array.isArray(warmupSteps) ? warmupSteps : []}
        compact
      />

      <WorkoutSetsBlock 
        workoutExerciseId={we.id}
        targetReps={we.target_reps}
        targetWeightKg={we.target_weight_kg}
        unit={we.weight_unit || 'kg'}
        workoutSets={we.workout_sets}
      />
    </div>
  );
}