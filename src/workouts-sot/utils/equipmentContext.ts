export type ExerciseLike =
  | { exercise?: any; /* workout_exercises row shape */ }
  | { id?: string; equipment_id?: string; equipment_ref_id?: string; load_type?: string } // raw exercises row
  | any;

export function extractExercise(ex: ExerciseLike) {
  // supports both: workout_exercise.exercise and plain exercise
  return ex?.exercise ?? ex ?? null;
}

export function getEquipmentRefId(exLike: ExerciseLike): string | null {
  const ex = extractExercise(exLike);
  return ex?.equipment_ref_id ?? ex?.equipment_id ?? null;
}

export function getLoadType(exLike: ExerciseLike): string | null {
  const ex = extractExercise(exLike);
  return ex?.load_type ?? null;
}

export function getExerciseId(exLike: ExerciseLike): string | null {
  const ex = extractExercise(exLike);
  return ex?.id ?? null;
}