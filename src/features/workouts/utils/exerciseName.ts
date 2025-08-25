export function getExerciseDisplayName(ex: any): string {
  // Prefer translations > exercise name > fallback
  return (
    ex?.exercise?.translations?.en?.name ??
    ex?.translations?.en?.name ??
    ex?.exercise?.name ??
    ex?.name ??
    'Exercise'
  );
}