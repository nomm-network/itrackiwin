# AI Coach System Documentation

## Overview
The AI Coach system provides intelligent workout guidance, progressive overload recommendations, and personalized training adjustments based on user performance and readiness.

## Core Components

### 1. Readiness Assessment System

#### Readiness Score Calculation
```sql
-- Function: compute_readiness_for_user(user_id)
-- Returns: Numeric score 0-100 representing training readiness
```

**Factors Considered:**
- **Sleep Quality**: Sleep duration and quality scores
- **Stress Levels**: Self-reported stress indicators  
- **Recovery Status**: Time since last workout
- **Menstrual Cycle**: Cycle phase for female users
- **Training Load**: Recent training volume and intensity
- **Subjective Wellness**: User-reported wellness scores

**Scoring Algorithm:**
```javascript
// Base readiness calculation
const baseReadiness = 65; // Neutral starting point

// Sleep factor (0-20 points)
const sleepScore = (sleepHours >= 7) ? 
  Math.min(20, (sleepHours - 4) * 5) : 
  Math.max(0, sleepHours * 3);

// Recovery factor (0-15 points)  
const timeSinceLastWorkout = getHoursSinceLastWorkout();
const recoveryScore = Math.min(15, timeSinceLastWorkout / 4);

// Stress factor (-10 to +10 points)
const stressScore = 10 - (stressLevel * 2);

// Cycle factor for female users (-5 to +5 points)
const cycleScore = calculateCycleAdjustment(cyclePhase);

// Final readiness
const readiness = baseReadiness + sleepScore + recoveryScore + stressScore + cycleScore;
return Math.max(0, Math.min(100, readiness));
```

#### Readiness Multiplier Conversion
```sql
-- Function: readiness_multiplier(readiness_score)
-- Returns: Weight adjustment multiplier (0.85 - 1.15)
```

**Multiplier Mapping:**
- **90-100**: 1.10-1.15 (increase weight 10-15%)
- **80-89**: 1.05-1.09 (increase weight 5-9%)  
- **70-79**: 1.00-1.04 (maintain or slight increase)
- **60-69**: 0.95-0.99 (slight decrease)
- **50-59**: 0.90-0.94 (moderate decrease)
- **Below 50**: 0.85-0.89 (significant decrease)

### 2. Progressive Overload System

#### Base Load Selection
```sql
-- Function: pick_base_load(user_id, exercise_id)
-- Returns: Recommended starting weight based on history
```

**Selection Criteria:**
1. **Recent Performance**: Last 3 successful sets within 60 days
2. **Volume Considerations**: Average weight at target rep range
3. **Equipment Availability**: Gym-specific weight increments
4. **Exercise Complexity**: Adjustment for exercise difficulty

**Algorithm:**
```javascript
// Get recent performance data
const recentSets = getRecentSets(userId, exerciseId, 60); // 60 days

if (recentSets.length === 0) {
  // New exercise - use conservative starting weight
  return getExerciseStartingWeight(exerciseId);
}

// Calculate performance trend
const weights = recentSets.map(set => set.weight);
const avgWeight = weights.reduce((a, b) => a + b) / weights.length;

// Adjust for rep range differences
const targetReps = getTargetReps();
const lastReps = recentSets[0].reps;
const repAdjustment = calculateRepAdjustment(lastReps, targetReps);

return avgWeight * repAdjustment;
```

#### Weight Progression Logic
```sql
-- Function: fn_suggest_sets(exercise_id, progression_type, target_reps)
-- Returns: Recommended sets, reps, and weights
```

**Progression Types:**

1. **Linear Progression**
   ```javascript
   // Add fixed increment each session
   const increment = getMinimumIncrement(equipmentType);
   const newWeight = lastWeight + increment;
   ```

2. **Percentage-Based Progression**
   ```javascript
   // Use percentage of estimated 1RM
   const oneRM = calculateEstimated1RM(userId, exerciseId);
   const intensity = getIntensityForReps(targetReps);
   const newWeight = oneRM * intensity;
   ```

3. **Pyramid Progression**
   ```javascript
   // Progressive sets building to top set
   const topWeight = calculateTopSetWeight();
   const sets = [
     { weight: topWeight * 0.75, reps: targetReps + 2 },
     { weight: topWeight * 0.85, reps: targetReps + 1 },
     { weight: topWeight, reps: targetReps },
     { weight: topWeight * 0.90, reps: targetReps }
   ];
   ```

### 3. Stagnation Detection

#### Detection Algorithm
```sql
-- Function: fn_detect_stagnation(exercise_id, lookback_sessions)
-- Returns: Stagnation analysis with recommendations
```

**Detection Criteria:**
- **Plateau**: Same weight for 3+ consecutive sessions
- **Declining Performance**: Weight decrease over time
- **Low Variance**: Minimal weight progression over period
- **Failed Sets**: Increased frequency of incomplete sets

**Analysis Output:**
```json
{
  "stagnation_detected": true,
  "trend_direction": "plateau",
  "sessions_analyzed": 5,
  "avg_weight": 100.0,
  "weight_variance": 12.5,
  "recent_weights": [100, 100, 97.5, 100, 100],
  "recommendations": [
    "Consider a deload week (reduce weight by 10-20%)",
    "Try a different rep range",
    "Add pause reps or tempo work"
  ]
}
```

#### Deload Recommendations
```javascript
// Automatic deload triggers
const shouldDeload = 
  stagnationDetected || 
  (readinessScore < 60 && consecutiveLowDays >= 3) ||
  (rpeAverage > 9 && sessions >= 4);

if (shouldDeload) {
  const deloadWeight = currentWeight * 0.85; // 15% reduction
  const deloadSets = Math.max(2, targetSets - 1); // Reduce volume
  return { weight: deloadWeight, sets: deloadSets };
}
```

### 4. Warmup Generation

#### Warmup Protocol
```sql
-- Function: fn_suggest_warmup(exercise_id, working_weight, working_reps)
-- Returns: Progressive warmup sets
```

**Warmup Structure:**
```javascript
const workingWeight = getWorkingWeight();
const warmupSets = [
  {
    weight: workingWeight * 0.40,
    reps: 12,
    purpose: "activation",
    rest: 45
  },
  {
    weight: workingWeight * 0.60, 
    reps: 8,
    purpose: "preparation",
    rest: 60
  },
  {
    weight: workingWeight * 0.80,
    reps: 4,
    purpose: "potentiation", 
    rest: 90
  }
];
```

**Movement-Specific Adjustments:**
- **Compound Movements**: More extensive warmup (4-5 sets)
- **Isolation Exercises**: Minimal warmup (2-3 sets)
- **Heavy Singles**: Extended warmup with opener sets
- **High-Rep Training**: Focus on activation vs potentiation

### 5. Rest Period Optimization

#### Rest Calculation
```sql
-- Function: fn_suggest_rest_seconds(workout_set_id, effort_level)
-- Returns: Optimal rest period in seconds
```

**Rest Periods by Set Type:**
```javascript
const restPeriods = {
  warmup: 30,
  normal: 180,      // 3 minutes
  top_set: 240,     // 4 minutes
  drop: 120,        // 2 minutes
  amrap: 300,       // 5 minutes
  superset: 90      // 1.5 minutes between exercises
};

// Effort level adjustments
const effortMultipliers = {
  easy: 0.7,
  moderate: 1.0,
  hard: 1.3,
  max: 1.5
};

const restSeconds = restPeriods[setType] * effortMultipliers[effortLevel];
```

**Adaptive Rest Recommendations:**
```javascript
// Consider heart rate recovery (if available)
if (heartRateData.available) {
  const recoveryRate = calculateHRRecovery();
  if (recoveryRate < 0.8) {
    return restSeconds * 1.2; // Extend rest by 20%
  }
}

// Consider performance trends
const lastSetRPE = getLastSetRPE();
if (lastSetRPE >= 9) {
  return restSeconds * 1.15; // Extend rest for high RPE
}
```

### 6. Performance Tracking & Analytics

#### 1RM Estimation
```javascript
// Epley Formula Implementation
function calculateEpley1RM(weight, reps) {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

// Brzycki Formula (alternative)
function calculateBrzycki1RM(weight, reps) {
  if (reps === 1) return weight;
  return weight / (1.0278 - (0.0278 * reps));
}

// Volume calculation
function calculateTotalVolume(sets) {
  return sets.reduce((total, set) => {
    return total + (set.weight * set.reps);
  }, 0);
}
```

#### Training Load Monitoring
```javascript
// RPE-based load calculation
function calculateTrainingLoad(volume, avgRPE) {
  return volume * avgRPE;
}

// Weekly load tracking
function calculateWeeklyLoad(workouts) {
  return workouts.reduce((total, workout) => {
    const workoutLoad = workout.exercises.reduce((exerciseTotal, exercise) => {
      const volume = calculateTotalVolume(exercise.sets);
      const avgRPE = exercise.sets.reduce((sum, set) => sum + set.rpe, 0) / exercise.sets.length;
      return exerciseTotal + calculateTrainingLoad(volume, avgRPE);
    }, 0);
    return total + workoutLoad;
  }, 0);
}
```

### 7. Coaching Decision Trees

#### Exercise Selection Logic
```javascript
function selectExerciseVariant(primaryExercise, constraints) {
  const availableEquipment = getGymEquipment(constraints.gymId);
  const userLimitations = getUserLimitations(constraints.userId);
  
  // Equipment availability check
  if (!availableEquipment.includes(primaryExercise.equipment)) {
    const alternatives = getExerciseAlternatives(primaryExercise.id);
    return alternatives.filter(alt => 
      availableEquipment.includes(alt.equipment) &&
      !userLimitations.includes(alt.contraindication)
    )[0];
  }
  
  return primaryExercise;
}
```

#### Load Adjustment Logic
```javascript
function adjustWorkoutLoad(baseWorkout, readinessScore) {
  const adjustmentFactor = readiness_multiplier(readinessScore);
  
  return baseWorkout.exercises.map(exercise => ({
    ...exercise,
    target_weight_kg: exercise.target_weight_kg * adjustmentFactor,
    target_sets: readinessScore < 50 ? 
      Math.max(1, exercise.target_sets - 1) : 
      exercise.target_sets
  }));
}
```

### 8. Integration Points

#### Workout Flow Integration
```javascript
// Called when starting workout
async function initializeWorkout(templateId, userId) {
  // 1. Assess readiness
  const readinessScore = await compute_readiness_for_user(userId);
  
  // 2. Start workout with readiness adjustment  
  const workoutId = await start_workout(templateId);
  
  // 3. Generate exercise-specific recommendations
  const exercises = await getWorkoutExercises(workoutId);
  
  for (const exercise of exercises) {
    // Base load calculation
    const baseWeight = await pick_base_load(userId, exercise.exercise_id);
    
    // Readiness adjustment
    const multiplier = readiness_multiplier(readinessScore);
    const adjustedWeight = baseWeight * multiplier;
    
    // Warmup generation
    const warmup = await fn_suggest_warmup(
      exercise.exercise_id, 
      adjustedWeight, 
      exercise.target_reps
    );
    
    // Update exercise with AI recommendations
    await updateWorkoutExercise(exercise.id, {
      target_weight_kg: adjustedWeight,
      attribute_values_json: {
        ...exercise.attribute_values_json,
        ai_recommendations: {
          base_weight: baseWeight,
          readiness_score: readinessScore,
          readiness_multiplier: multiplier,
          warmup: warmup.warmup_sets
        }
      }
    });
  }
  
  return workoutId;
}
```

#### Real-time Adjustments
```javascript
// Called after each completed set
async function processCompletedSet(setId, performance) {
  const set = await getWorkoutSet(setId);
  const exercise = await getWorkoutExercise(set.workout_exercise_id);
  
  // Analyze performance vs expectation
  const expectedRPE = 7; // Target RPE
  const actualRPE = performance.rpe;
  
  if (actualRPE > expectedRPE + 1) {
    // Performance worse than expected - reduce subsequent sets
    const nextSets = await getUncompletedSets(set.workout_exercise_id);
    
    for (const nextSet of nextSets) {
      const currentWeight = nextSet.target_weight || exercise.target_weight_kg;
      const adjustedWeight = currentWeight * 0.95; // 5% reduction
      
      await updateWorkoutSet(nextSet.id, {
        target_weight: adjustedWeight,
        ai_note: "Weight reduced due to high RPE in previous set"
      });
    }
  }
  
  // Suggest rest period
  const restSeconds = await fn_suggest_rest_seconds(setId, mapRPEToEffort(actualRPE));
  
  return {
    suggested_rest: restSeconds,
    performance_feedback: generatePerformanceFeedback(actualRPE, expectedRPE)
  };
}
```

### 9. Machine Learning Components

#### Pattern Recognition
```javascript
// Identify user training patterns
function analyzeTrainingPatterns(userId, timeframe = 90) {
  const workouts = getWorkoutHistory(userId, timeframe);
  
  const patterns = {
    preferredDays: calculatePreferredTrainingDays(workouts),
    sessionDuration: calculateAverageSessionDuration(workouts),
    volumePreference: calculateVolumePreference(workouts),
    intensityTolerance: calculateIntensityTolerance(workouts),
    recoverySensitivity: calculateRecoverySensitivity(workouts)
  };
  
  return patterns;
}
```

#### Personalization Engine
```javascript
// Adapt recommendations based on user response
function personalizeRecommendations(userId, exerciseId) {
  const userPatterns = analyzeTrainingPatterns(userId);
  const exerciseHistory = getExerciseHistory(userId, exerciseId);
  
  // Adjust progression rate based on response patterns
  const progressionRate = calculateOptimalProgressionRate(exerciseHistory);
  
  // Adjust volume based on recovery patterns  
  const volumeAdjustment = calculateVolumeAdjustment(userPatterns);
  
  return {
    progression_rate: progressionRate,
    volume_adjustment: volumeAdjustment,
    preferred_rep_ranges: userPatterns.volumePreference,
    optimal_frequency: userPatterns.recoverySensitivity
  };
}
```

### 10. Monitoring & Analytics

#### Coach Performance Metrics
```javascript
// Track AI coach effectiveness
function calculateCoachMetrics(timeframe = 30) {
  return {
    user_adherence_rate: calculateAdherenceRate(timeframe),
    progression_success_rate: calculateProgressionSuccess(timeframe), 
    injury_prevention_score: calculateInjuryPrevention(timeframe),
    user_satisfaction_score: calculateSatisfactionScore(timeframe),
    recommendation_accuracy: calculateRecommendationAccuracy(timeframe)
  };
}
```

#### Logging & Debugging
```sql
-- Coach logs table structure
CREATE TABLE coach_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  step TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  outputs JSONB NOT NULL DEFAULT '{}',
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  execution_time_ms INTEGER,
  session_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 11. A/B Testing Framework

#### Experiment Configuration
```javascript
// Define coaching experiments
const experiments = {
  progression_algorithm: {
    control: 'linear_progression',
    variants: ['percentage_based', 'autoregulation'],
    allocation: 0.33 // 33% each variant
  },
  
  warmup_protocol: {
    control: 'standard_3_set',
    variants: ['extended_5_set', 'movement_specific'],
    allocation: 0.50 // 50% each variant
  }
};

// User assignment
function assignUserToExperiment(userId, experimentName) {
  const userHash = hash(userId + experimentName);
  const allocation = experiments[experimentName].allocation;
  
  if (userHash < allocation) {
    return experiments[experimentName].control;
  } else if (userHash < allocation * 2) {
    return experiments[experimentName].variants[0];
  } else {
    return experiments[experimentName].variants[1];
  }
}
```

---

*Last Updated: 2025-01-06*
*AI Coach Version: 2.0*