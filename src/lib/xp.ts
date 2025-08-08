export function calculateXpForHabitCompletion(streak: number) {
  const base = 10;
  const multiplier = streak >= 14 ? 2 : streak >= 7 ? 1.5 : 1;
  return Math.round(base * multiplier);
}

export function levelFromXp(xp: number) {
  // Simple quadratic leveling curve
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}
