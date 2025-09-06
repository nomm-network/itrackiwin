export const totalVolume = (sets: { weight?: number | null; reps?: number | null }[]) => {
  return sets.reduce((sum, s) => sum + (s.weight || 0) * (s.reps || 0), 0);
};
