// Readiness calculation using new formula (0-100)
export type ReadinessInput = {
  energy: number;           // 0..10
  sleepQuality: number;     // 0..10
  sleepHours: number;       // actual hours
  soreness: number;         // 0..10  (LOWER is better)
  stress: number;           // 0..10  (LOWER is better)
  mood: number;             // 0..10
  energizers: boolean;      // true = +10 bonus
  illness: boolean;         // true = -20 penalty
  alcohol: boolean;         // true = -10 penalty
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Map sleep hours to 0-100 scale (matches DB function)
const mapSleepHours = (hours: number): number => {
  if (hours >= 9) return 100;
  if (hours >= 8) return 100;
  if (hours === 7) return 80;
  if (hours === 6) return 60;
  if (hours === 5) return 40;
  if (hours < 5) return 20;
  return 60; // default
};

export function computeReadinessScore(i: ReadinessInput): number {
  console.log('🔥 computeReadinessScore INPUT (v2):', i);
  
  // Convert to 0-100 scales
  const energyScore = Math.max(0, Math.min(100, (i.energy || 0) * 10));
  const sleepQualityScore = Math.max(0, Math.min(100, (i.sleepQuality || 0) * 10));
  const sleepHoursScore = mapSleepHours(i.sleepHours || 0);
  const sorenessScore = Math.max(0, Math.min(100, 110 - (i.soreness || 10) * 10)); // invert: 1 best → 100
  const stressScore = Math.max(0, Math.min(100, 110 - (i.stress || 10) * 10)); // invert: 1 best → 100
  const moodScore = Math.max(0, Math.min(100, (i.mood || 0) * 10));

  // Sleep bundle: 50/50 quality & hours
  const sleepBundle = (sleepQualityScore * 0.5 + sleepHoursScore * 0.5);

  // New weights: Energy 15%, Sleep bundle 20%, Soreness 15%, Stress 15%, Mood 25%
  const baseScore = 
      energyScore * 0.15 +
      sleepBundle * 0.20 +
      sorenessScore * 0.15 +
      stressScore * 0.15 +
      moodScore * 0.25;

  console.log('Score components:', {
    energy: energyScore * 0.15,
    sleepBundle: sleepBundle * 0.20,
    soreness: sorenessScore * 0.15,
    stress: stressScore * 0.15,
    mood: moodScore * 0.25,
    baseScore
  });

  // Apply bonuses and penalties
  let finalScore = baseScore;
  
  // Energizers bonus: +10
  if (i.energizers) {
    finalScore += 10;
    console.log('Energizers bonus: +10');
  }
  
  // Illness penalty: -20
  if (i.illness) {
    finalScore -= 20;
    console.log('Illness penalty: -20');
  }
  
  // Alcohol penalty: -10
  if (i.alcohol) {
    finalScore -= 10;
    console.log('Alcohol penalty: -10');
  }

  const result = Math.round(clamp(finalScore, 0, 100));
  console.log('🎯 FINAL SCORE (v2):', result);
  return result;
}

// Helper function to get score color based on value
export function getReadinessScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

// Helper function to get score description
export function getReadinessScoreDescription(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}