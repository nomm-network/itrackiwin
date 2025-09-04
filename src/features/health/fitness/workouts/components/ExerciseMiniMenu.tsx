import { useState } from 'react';
import { WorkoutExerciseDTO } from '../api/useWorkout';

interface ExerciseMiniMenuProps {
  workoutExercise: WorkoutExerciseDTO;
}

export function ExerciseMiniMenu({ workoutExercise }: ExerciseMiniMenuProps) {
  const [showGrips, setShowGrips] = useState(false);
  const [showWarmup, setShowWarmup] = useState(false);

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Grips Icon */}
      <button
        onClick={() => setShowGrips(!showGrips)}
        className="p-2 text-gray-400 hover:text-emerald-300 transition-colors"
        title="Grips"
      >
        🖐️
      </button>

      {/* Warmup Icon */}
      <button
        onClick={() => setShowWarmup(!showWarmup)}
        className="p-2 text-gray-400 hover:text-emerald-300 transition-colors"
        title="Warmup"
      >
        🪄
      </button>

      {/* Grips Popover - Simple placeholder for now */}
      {showGrips && (
        <div className="absolute z-10 mt-8 bg-[#0f1f1b] border border-[#133a2f] rounded-lg p-3 shadow-lg">
          <div className="text-sm text-gray-300">Grip options coming soon</div>
        </div>
      )}
    </div>
  );
}