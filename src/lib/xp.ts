// XP calculations for various fitness activities
export function calculateXpForHabitCompletion(streak: number) {
  const base = 10;
  const multiplier = streak >= 14 ? 2 : streak >= 7 ? 1.5 : 1;
  return Math.round(base * multiplier);
}

export function calculateXpForWorkout(exerciseCount: number, duration: number = 0) {
  const baseXp = 25; // Base XP for completing a workout
  const exerciseXp = exerciseCount * 5; // 5 XP per exercise
  const durationXp = Math.floor(duration / 10); // 1 XP per 10 minutes
  
  return baseXp + exerciseXp + durationXp;
}

export function calculateXpForSet(reps: number = 0, weight: number = 0) {
  // Small XP reward for individual sets
  const repXp = Math.floor(reps / 2); // 1 XP per 2 reps
  const weightXp = Math.floor(weight / 10); // 1 XP per 10kg/lbs
  
  return Math.min(repXp + weightXp, 10); // Cap at 10 XP per set
}

export function calculateXpForPersonalRecord() {
  return 50; // Big bonus for PRs
}

export function calculateXpForStreak(streakLength: number) {
  if (streakLength <= 1) return 0;
  if (streakLength <= 7) return 10;
  if (streakLength <= 14) return 25;
  if (streakLength <= 30) return 50;
  return 100; // For 30+ day streaks
}

export function levelFromXp(xp: number) {
  // Quadratic leveling curve: level = sqrt(xp / 50) + 1
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function xpForLevel(level: number) {
  // Inverse of levelFromXp: xp = (level - 1)^2 * 50
  return Math.pow(level - 1, 2) * 50;
}

export function xpToNextLevel(currentXp: number) {
  const currentLevel = levelFromXp(currentXp);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  return nextLevelXp - currentXp;
}

export function getLevelProgress(currentXp: number) {
  const currentLevel = levelFromXp(currentXp);
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const progressXp = currentXp - currentLevelXp;
  const neededXp = nextLevelXp - currentLevelXp;
  
  return {
    level: currentLevel,
    current: progressXp,
    needed: neededXp,
    percentage: (progressXp / neededXp) * 100
  };
}
