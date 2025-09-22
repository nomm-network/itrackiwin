// ============================================================================
// READINESS SCORING ENGINE - Pure functions for workout readiness
// Rule: Business logic lives here for reuse across web/mobile/edge functions
// ============================================================================

export interface ReadinessInput {
  energy: number; // 1-5 scale
  sleepQuality: number; // 1-5 scale  
  sleepHours: number; // actual hours
  soreness: number; // 1-5 scale (1 = very sore, 5 = no soreness)
  stress: number; // 1-5 scale (1 = very stressed, 5 = no stress)
  illness: boolean;
  alcohol: boolean;
  energisers_taken: boolean; // Creatine/PreWorkout
  supplements?: string[];
  notes?: string;
}

export interface ReadinessOutput {
  score: number; // 0-100 overall readiness score
  recommendation: 'proceed' | 'light_session' | 'rest_day';
  factors: ReadinessFactor[];
  adjustments: WorkoutAdjustment[];
}

export interface ReadinessFactor {
  category: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface WorkoutAdjustment {
  type: 'intensity' | 'volume' | 'exercise_selection';
  adjustment: number; // percentage adjustment (0.8 = 20% reduction)
  reason: string;
}

// ============================================================================
// CORE READINESS COMPUTATION  
// ============================================================================

export function computeReadiness(input: ReadinessInput): ReadinessOutput {
  const factors: ReadinessFactor[] = [];
  let baseScore = 50; // Start at neutral
  
  // Energy assessment (weight: 25%)
  const energyImpact = ((input.energy - 3) / 2) * 25;
  baseScore += energyImpact;
  factors.push({
    category: 'energy',
    impact: input.energy >= 3 ? 'positive' : 'negative',
    weight: 0.25,
    description: getEnergyDescription(input.energy)
  });
  
  // Sleep assessment (weight: 30%)
  const sleepScore = computeSleepScore(input.sleepQuality, input.sleepHours);
  const sleepImpact = (sleepScore - 3) / 2 * 30;
  baseScore += sleepImpact;
  factors.push({
    category: 'sleep',
    impact: sleepScore >= 3 ? 'positive' : 'negative',
    weight: 0.30,
    description: getSleepDescription(sleepScore)
  });
  
  // Recovery assessment (weight: 20%)
  const recoveryImpact = ((input.soreness - 3) / 2) * 20;
  baseScore += recoveryImpact;
  factors.push({
    category: 'recovery',
    impact: input.soreness >= 3 ? 'positive' : 'negative',
    weight: 0.20,
    description: getRecoveryDescription(input.soreness)
  });
  
  // Stress assessment (weight: 15%)
  const stressImpact = ((input.stress - 3) / 2) * 15;
  baseScore += stressImpact;
  factors.push({
    category: 'stress',
    impact: input.stress >= 3 ? 'positive' : 'negative',
    weight: 0.15,
    description: getStressDescription(input.stress)
  });
  
  // Binary factors (weight: 10% total)
  if (input.illness) {
    baseScore -= 20;
    factors.push({
      category: 'illness',
      impact: 'negative',
      weight: 0.05,
      description: 'Currently feeling unwell'
    });
  }
  
  if (input.alcohol) {
    baseScore -= 10;
    factors.push({
      category: 'alcohol',
      impact: 'negative',
      weight: 0.05,
      description: 'Alcohol consumption affects recovery'
    });
  }
  
  // Clamp score to 0-100
  const finalScore = Math.max(0, Math.min(100, baseScore));
  
  return {
    score: Math.round(finalScore),
    recommendation: getRecommendation(finalScore),
    factors,
    adjustments: computeAdjustments(input, finalScore)
  };
}

// ============================================================================
// SLEEP SCORING
// ============================================================================

function computeSleepScore(quality: number, hours: number): number {
  // Optimal sleep: 7-9 hours with good quality
  let score = quality; // Start with quality rating
  
  // Adjust based on duration
  if (hours >= 7 && hours <= 9) {
    // Optimal range - no adjustment
  } else if (hours >= 6 && hours <= 10) {
    // Acceptable range - small penalty
    score = Math.max(1, score - 0.5);
  } else {
    // Outside healthy range - bigger penalty
    score = Math.max(1, score - 1.5);
  }
  
  return Math.round(score);
}

// ============================================================================
// RECOMMENDATIONS
// ============================================================================

function getRecommendation(score: number): 'proceed' | 'light_session' | 'rest_day' {
  if (score >= 70) return 'proceed';
  if (score >= 40) return 'light_session';
  return 'rest_day';
}

function computeAdjustments(input: ReadinessInput, score: number): WorkoutAdjustment[] {
  const adjustments: WorkoutAdjustment[] = [];
  
  // Low energy - reduce intensity
  if (input.energy <= 2) {
    adjustments.push({
      type: 'intensity',
      adjustment: 0.8,
      reason: 'Low energy - reduce working weights by 20%'
    });
  }
  
  // Poor sleep - reduce volume
  const sleepScore = computeSleepScore(input.sleepQuality, input.sleepHours);
  if (sleepScore <= 2) {
    adjustments.push({
      type: 'volume',
      adjustment: 0.7,
      reason: 'Poor sleep - reduce set count by 30%'
    });
  }
  
  // High soreness - exercise selection
  if (input.soreness <= 2) {
    adjustments.push({
      type: 'exercise_selection',
      adjustment: 1.0,
      reason: 'High soreness - focus on mobility and lighter movements'
    });
  }
  
  // Overall low score - comprehensive reduction
  if (score < 40) {
    adjustments.push({
      type: 'intensity',
      adjustment: 0.6,
      reason: 'Low readiness - significant intensity reduction recommended'
    });
  }
  
  return adjustments;
}

// ============================================================================
// DESCRIPTION HELPERS
// ============================================================================

function getEnergyDescription(energy: number): string {
  const descriptions = [
    '',
    'Very low energy - feeling drained',
    'Low energy - not feeling great',
    'Moderate energy - feeling okay',
    'Good energy - feeling ready',
    'High energy - feeling fantastic'
  ];
  return descriptions[energy] || 'Unknown energy level';
}

function getSleepDescription(sleepScore: number): string {
  if (sleepScore >= 4) return 'Well rested - great sleep quality and duration';
  if (sleepScore >= 3) return 'Adequately rested - decent sleep';
  if (sleepScore >= 2) return 'Somewhat tired - sleep could be better';
  return 'Poorly rested - inadequate sleep';
}

function getRecoveryDescription(soreness: number): string {
  const descriptions = [
    '',
    'Very sore - significant muscle fatigue',
    'Quite sore - noticeable muscle fatigue',
    'Mild soreness - typical post-workout feeling',
    'Minimal soreness - feeling fresh',
    'No soreness - fully recovered'
  ];
  return descriptions[soreness] || 'Unknown recovery state';
}

function getStressDescription(stress: number): string {
  const descriptions = [
    '',
    'Very stressed - high life/work pressure',
    'Quite stressed - elevated stress levels',
    'Moderate stress - manageable pressure',
    'Low stress - feeling relaxed',
    'No stress - feeling calm and centered'
  ];
  return descriptions[stress] || 'Unknown stress level';
}

// ============================================================================
// READINESS VALIDATION
// ============================================================================

export function validateReadinessInput(input: Partial<ReadinessInput>): string[] {
  const errors: string[] = [];
  
  const requiredFields = ['energy', 'sleepQuality', 'sleepHours', 'soreness', 'stress'];
  for (const field of requiredFields) {
    if (!(field in input) || input[field as keyof ReadinessInput] === undefined) {
      errors.push(`${field} is required`);
    }
  }
  
  // Validate ranges
  const scaleFields = ['energy', 'sleepQuality', 'soreness', 'stress'];
  for (const field of scaleFields) {
    const value = input[field as keyof ReadinessInput] as number;
    if (value !== undefined && (value < 1 || value > 5)) {
      errors.push(`${field} must be between 1 and 5`);
    }
  }
  
  if (input.sleepHours !== undefined && (input.sleepHours < 0 || input.sleepHours > 24)) {
    errors.push('sleepHours must be between 0 and 24');
  }
  
  return errors;
}