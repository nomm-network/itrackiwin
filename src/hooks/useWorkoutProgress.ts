import { useState, useCallback } from 'react';

interface UseWorkoutProgressProps {
  exercises: Array<{
    id: string;
    order_index: number;
    target_sets?: number;
  }>;
  setsByExercise: Record<string, Array<{ is_completed?: boolean }>>;
}

export const useWorkoutProgress = ({ exercises, setsByExercise }: UseWorkoutProgressProps) => {
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);

  // Calculate completion status for each exercise
  const getExerciseProgress = useCallback((exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const sets = setsByExercise[exerciseId] || [];
    const targetSets = exercise?.target_sets || 3;
    const completedSets = sets.filter(set => set.is_completed).length;
    
    return {
      completed: completedSets,
      target: targetSets,
      isComplete: completedSets >= targetSets,
      percentage: Math.min((completedSets / targetSets) * 100, 100)
    };
  }, [exercises, setsByExercise]);

  // Get next exercise in sequence
  const getNextExercise = useCallback((currentExerciseId: string) => {
    const currentIndex = exercises.findIndex(ex => ex.id === currentExerciseId);
    if (currentIndex === -1 || currentIndex === exercises.length - 1) {
      return null; // Last exercise or not found
    }
    
    return exercises[currentIndex + 1];
  }, [exercises]);

  // Auto-advance to next exercise
  const moveToNextExercise = useCallback((currentExerciseId: string) => {
    const nextExercise = getNextExercise(currentExerciseId);
    if (nextExercise) {
      setActiveExerciseId(nextExercise.id);
      return nextExercise;
    }
    return null;
  }, [getNextExercise]);

  // Check if workout is complete (all exercises completed)
  const isWorkoutComplete = useCallback(() => {
    return exercises.every(exercise => {
      const progress = getExerciseProgress(exercise.id);
      return progress.isComplete;
    });
  }, [exercises, getExerciseProgress]);

  // Get overall workout progress
  const getWorkoutProgress = useCallback(() => {
    const totalTargetSets = exercises.reduce((sum, ex) => sum + (ex.target_sets || 3), 0);
    const totalCompletedSets = exercises.reduce((sum, ex) => {
      const progress = getExerciseProgress(ex.id);
      return sum + progress.completed;
    }, 0);

    return {
      completedSets: totalCompletedSets,
      totalSets: totalTargetSets,
      percentage: totalTargetSets > 0 ? (totalCompletedSets / totalTargetSets) * 100 : 0,
      isComplete: isWorkoutComplete()
    };
  }, [exercises, getExerciseProgress, isWorkoutComplete]);

  return {
    activeExerciseId,
    setActiveExerciseId,
    getExerciseProgress,
    getNextExercise,
    moveToNextExercise,
    isWorkoutComplete,
    getWorkoutProgress
  };
};