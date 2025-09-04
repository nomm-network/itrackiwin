import { WorkoutExercise } from '../api/useWorkout';
import { ExerciseMiniMenu } from './ExerciseMiniMenu';
import { WarmupPanel } from './WarmupPanel';
import { WorkoutSetsBlock } from './WorkoutSetsBlock';

interface WorkoutExerciseCardProps {
  workoutExercise: WorkoutExercise;
}

export function WorkoutExerciseCard({ workoutExercise }: WorkoutExerciseCardProps) {
  const completedSets = workoutExercise.workout_sets.filter(
    s => s.set_kind !== 'warmup' && s.is_completed
  ).length;
  
  const totalSets = workoutExercise.target_reps ? 3 : 3; // Default to 3 sets

  return (
    <div className="bg-[#0d1a17] border border-[#133a2f] rounded-xl shadow-inner overflow-hidden">
      {/* Header */}
      <div className="bg-[#0f1f1b] p-4 border-b border-[#133a2f]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-medium text-white">
              {workoutExercise.exercise.display_name || '—'}
            </h3>
          </div>
          <div className="rounded-full bg-emerald-600/25 text-emerald-300 px-3 py-1 text-sm">
            {completedSets}/{totalSets} sets
          </div>
        </div>
        
        {/* Mini Menu */}
        <ExerciseMiniMenu workoutExercise={workoutExercise} />
      </div>

      {/* Warmup Panel */}
      <WarmupPanel 
        topKg={workoutExercise.target_weight_kg || 60}
        steps={workoutExercise.attribute_values_json?.warmup || []}
        exerciseName={workoutExercise.exercise.display_name || 'Exercise'}
        workoutExerciseId={workoutExercise.id}
      />

      {/* Sets Block */}
      <WorkoutSetsBlock 
        workoutExerciseId={workoutExercise.id}
        targetReps={workoutExercise.target_reps}
        targetWeightKg={workoutExercise.target_weight_kg}
        unit={workoutExercise.weight_unit || 'kg'}
        workoutSets={workoutExercise.workout_sets}
      />
    </div>
  );
}