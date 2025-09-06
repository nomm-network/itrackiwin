import { useMemo } from 'react';
import { UnilateralCapability, UnilateralMode } from '@/types/unilateral';

interface UseUnilateralModeProps {
  exerciseCapability?: UnilateralCapability;
  workoutExerciseModeOverride?: UnilateralMode;
}

interface UseUnilateralModeReturn {
  isUnilateral: boolean;
  mode: UnilateralMode;
  canAlternate: boolean;
  inputMode: 'bilateral' | 'unilateral';
}

/**
 * Hook to determine the unilateral mode for an exercise based on its capability
 * and any workout-specific overrides
 */
export const useUnilateralMode = ({
  exerciseCapability = 'bilateral_only',
  workoutExerciseModeOverride = 'auto'
}: UseUnilateralModeProps): UseUnilateralModeReturn => {
  return useMemo(() => {
    let resolvedMode: UnilateralMode;

    // If there's an override, use it (unless it's 'auto')
    if (workoutExerciseModeOverride !== 'auto') {
      resolvedMode = workoutExerciseModeOverride;
    } else {
      // Auto-resolve based on exercise capability
      switch (exerciseCapability) {
        case 'bilateral_only':
          resolvedMode = 'bilateral';
          break;
        case 'unilateral_only':
          resolvedMode = 'unilateral_alternating';
          break;
        case 'either':
          // Default to alternating for 'either' exercises
          resolvedMode = 'unilateral_alternating';
          break;
        default:
          resolvedMode = 'bilateral';
      }
    }

    const isUnilateral = resolvedMode !== 'bilateral';
    const canAlternate = exerciseCapability === 'either' || exerciseCapability === 'unilateral_only';
    const inputMode = isUnilateral ? 'unilateral' : 'bilateral';

    return {
      isUnilateral,
      mode: resolvedMode,
      canAlternate,
      inputMode
    };
  }, [exerciseCapability, workoutExerciseModeOverride]);
};

/**
 * Helper function to determine if an exercise should show unilateral inputs
 */
export const shouldUseUnilateralInputs = (
  exerciseCapability?: UnilateralCapability,
  modeOverride?: UnilateralMode
): boolean => {
  const { isUnilateral } = useUnilateralMode({
    exerciseCapability,
    workoutExerciseModeOverride: modeOverride
  });
  return isUnilateral;
};

/**
 * Helper function to get the display name for a unilateral mode
 */
export const getUnilateralModeDisplayName = (mode: UnilateralMode): string => {
  switch (mode) {
    case 'bilateral':
      return 'Bilateral';
    case 'unilateral_alternating':
      return 'Alternating';
    case 'unilateral_same':
      return 'Same Side';
    case 'auto':
      return 'Auto';
    default:
      return 'Unknown';
  }
};