// Single source of truth for readiness calculation (0-100)
export type ReadinessInput = {
  energy: number;           // 0..10
  sleepQuality: number;     // 0..10
  sleepHours: number;       // 0..12 (we'll map to 0..10)
  soreness: number;         // 0..10  (LOWER is better)
  stress: number;           // 0..10  (LOWER is better)
  preworkout: boolean;      // true = small boost
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Map hours → 0..10 (8h ≈ 10, 7h ≈ 8.5, 6h ≈ 7, <5 sharp drop)
const sleepHoursTo10 = (h: number) => {
  const x = clamp(h, 0, 12);
  if (x >= 8) return 10;
  if (x >= 7) return 8.5;
  if (x >= 6) return 7;
  if (x >= 5) return 5;
  return Math.max(0, (x / 5) * 5); // 0..5
};

export function computeReadinessScore(i: ReadinessInput): number {
  console.log('🔥 computeReadinessScore INPUT:', i);
  
  // convert to 0..10 scales
  const sleepH10 = sleepHoursTo10(i.sleepHours);
  console.log('sleepH10:', sleepH10);

  // invert negatives (lower is better → higher score)
  const invSoreness = 10 - clamp(i.soreness, 0, 10);
  const invStress   = 10 - clamp(i.stress,   0, 10);
  console.log('inverted values - soreness:', invSoreness, 'stress:', invStress);

  // weights sum = 1.00
  const w = {
    energy: 0.30,
    sleepQ: 0.25,
    sleepH: 0.15,
    soreness: 0.15,
    stress: 0.10,
    pre: 0.05, // applied as a capped bonus later
  };

  const base10 =
      w.energy  * clamp(i.energy, 0, 10) +
      w.sleepQ  * clamp(i.sleepQuality, 0, 10) +
      w.sleepH  * sleepH10 +
      w.soreness* invSoreness +
      w.stress  * invStress;

  console.log('base10 calculation:', base10);
  console.log('individual components:', {
    energy: w.energy * clamp(i.energy, 0, 10),
    sleepQ: w.sleepQ * clamp(i.sleepQuality, 0, 10),
    sleepH: w.sleepH * sleepH10,
    soreness: w.soreness * invSoreness,
    stress: w.stress * invStress
  });

  // convert to 0..100
  let score = Math.round(base10 * 10);
  console.log('score after x10:', score);

  // preworkout/creatine small bonus (max +5)
  if (i.preworkout) {
    const bonus = Math.round(10 * w.pre);
    console.log('preworkout bonus:', bonus);
    score = Math.min(100, score + bonus);
  }

  const finalScore = clamp(score, 0, 100);
  console.log('🎯 FINAL SCORE:', finalScore);
  return finalScore;
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