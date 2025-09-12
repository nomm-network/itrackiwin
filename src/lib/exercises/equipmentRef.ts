export type ExerciseLike = {
  id?: string;
  load_type?: string | null;
  equipment_id?: string | null;
  equipment_ref_id?: string | null;
  // optional nested
  exercise?: {
    id?: string;
    load_type?: string | null;
    equipment_id?: string | null;
    equipment_ref_id?: string | null;
  };
};

export function getEquipmentRefId(x: ExerciseLike | null | undefined) {
  if (!x) return null;
  // workout_exercises shape → nested exercise
  const nested = (x as any).exercise;
  return nested?.equipment_ref_id
      ?? nested?.equipment_id
      ?? (x as any).equipment_ref_id
      ?? (x as any).equipment_id
      ?? null;
}

export function getLoadType(x: ExerciseLike | null | undefined) {
  if (!x) return null;
  const nested = (x as any).exercise;
  return (nested?.load_type ?? (x as any).load_type ?? null) as string | null;
}