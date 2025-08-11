export const epley1RM = (weight: number, reps: number) => {
  if (!weight || !reps || reps <= 0) return 0;
  return Number((weight * (1 + reps / 30)).toFixed(2));
};
