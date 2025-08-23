import { useCallback } from 'react';

export const useAutoScroll = () => {
  const scrollToElement = useCallback((elementId: string, options?: ScrollIntoViewOptions) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        ...options
      });
    }
  }, []);

  const scrollToExercise = useCallback((exerciseId: string) => {
    // Add a small delay to allow DOM updates
    setTimeout(() => {
      scrollToElement(`exercise-${exerciseId}`, {
        behavior: 'smooth',
        block: 'start'
      });
    }, 150);
  }, [scrollToElement]);

  const scrollToNextExercise = useCallback((currentExerciseId: string, exercises: Array<{ id: string; order_index: number }>) => {
    const currentIndex = exercises.findIndex(ex => ex.id === currentExerciseId);
    const nextExercise = exercises[currentIndex + 1];
    
    if (nextExercise) {
      scrollToExercise(nextExercise.id);
    }
  }, [scrollToExercise]);

  return {
    scrollToElement,
    scrollToExercise,
    scrollToNextExercise
  };
};