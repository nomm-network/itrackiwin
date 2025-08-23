import { SexType } from '../hooks/useFitnessProfile.hook';

export interface VolumeBiasConfig {
  upperBody: number;      // Multiplier for upper body volume (1.0 = baseline)
  lowerBody: number;      // Multiplier for lower body volume
  glutes: number;         // Specific glute emphasis multiplier
  chest: number;          // Specific chest emphasis multiplier
  shoulders: number;      // Shoulder volume multiplier
  arms: number;           // Arm volume multiplier
  back: number;           // Back volume multiplier
  legs: number;           // General leg volume multiplier
}

export interface ProgressionBiasConfig {
  strength: number;       // Strength progression rate multiplier
  hypertrophy: number;    // Hypertrophy volume multiplier
  endurance: number;      // Endurance emphasis multiplier
  recovery: number;       // Recovery time multiplier
}

export interface SexBasedTrainingConfig {
  volumeBias: VolumeBiasConfig;
  progressionBias: ProgressionBiasConfig;
  defaultRest: {
    compound: number;     // Rest for compound movements (seconds)
    isolation: number;    // Rest for isolation movements (seconds)
  };
  repRanges: {
    strength: [number, number];
    hypertrophy: [number, number]; 
    endurance: [number, number];
  };
}

// Research-based defaults
const SEX_TRAINING_CONFIGS: Record<SexType, SexBasedTrainingConfig> = {
  male: {
    volumeBias: {
      upperBody: 1.1,     // +10% upper body volume
      lowerBody: 0.9,     // -10% lower body volume  
      glutes: 0.8,        // -20% glute focus
      chest: 1.2,         // +20% chest emphasis
      shoulders: 1.1,     // +10% shoulder volume
      arms: 1.15,         // +15% arm volume
      back: 1.1,          // +10% back volume
      legs: 0.9           // -10% leg volume
    },
    progressionBias: {
      strength: 1.1,      // +10% strength focus
      hypertrophy: 1.0,   // Baseline hypertrophy
      endurance: 0.9,     // -10% endurance
      recovery: 0.9       // -10% recovery time (faster recovery)
    },
    defaultRest: {
      compound: 180,      // 3 minutes
      isolation: 90       // 1.5 minutes
    },
    repRanges: {
      strength: [3, 6],
      hypertrophy: [6, 12],
      endurance: [12, 20]
    }
  },
  female: {
    volumeBias: {
      upperBody: 0.9,     // -10% upper body volume
      lowerBody: 1.2,     // +20% lower body volume
      glutes: 1.4,        // +40% glute emphasis
      chest: 0.8,         // -20% chest volume
      shoulders: 1.0,     // Baseline shoulders
      arms: 0.9,          // -10% arm volume  
      back: 1.0,          // Baseline back
      legs: 1.2           // +20% leg volume
    },
    progressionBias: {
      strength: 0.9,      // -10% strength focus
      hypertrophy: 1.1,   // +10% hypertrophy
      endurance: 1.1,     // +10% endurance
      recovery: 1.1       // +10% recovery time
    },
    defaultRest: {
      compound: 150,      // 2.5 minutes
      isolation: 75       // 1.25 minutes
    },
    repRanges: {
      strength: [4, 8],
      hypertrophy: [8, 15],
      endurance: [15, 25]
    }
  },
  other: {
    // Balanced approach - no specific biases
    volumeBias: {
      upperBody: 1.0,
      lowerBody: 1.0,
      glutes: 1.0,
      chest: 1.0,
      shoulders: 1.0,
      arms: 1.0,
      back: 1.0,
      legs: 1.0
    },
    progressionBias: {
      strength: 1.0,
      hypertrophy: 1.0,
      endurance: 1.0,
      recovery: 1.0
    },
    defaultRest: {
      compound: 165,      // 2.75 minutes (average)
      isolation: 82       // ~1.3 minutes (average)
    },
    repRanges: {
      strength: [3, 8],
      hypertrophy: [6, 15],
      endurance: [12, 25]
    }
  },
  prefer_not_to_say: {
    // Same as 'other' - neutral approach
    volumeBias: {
      upperBody: 1.0,
      lowerBody: 1.0,
      glutes: 1.0,
      chest: 1.0,
      shoulders: 1.0,
      arms: 1.0,
      back: 1.0,
      legs: 1.0
    },
    progressionBias: {
      strength: 1.0,
      hypertrophy: 1.0,
      endurance: 1.0,
      recovery: 1.0
    },
    defaultRest: {
      compound: 165,
      isolation: 82
    },
    repRanges: {
      strength: [3, 8],
      hypertrophy: [6, 15],
      endurance: [12, 25]
    }
  }
};

export const getSexBasedTrainingConfig = (sex?: SexType): SexBasedTrainingConfig => {
  return SEX_TRAINING_CONFIGS[sex || 'other'];
};

export const applyVolumeBias = (baseVolume: number, muscleGroup: keyof VolumeBiasConfig, sex?: SexType): number => {
  const config = getSexBasedTrainingConfig(sex);
  return Math.round(baseVolume * config.volumeBias[muscleGroup]);
};

export const applyProgressionBias = (baseProgression: number, type: keyof ProgressionBiasConfig, sex?: SexType): number => {
  const config = getSexBasedTrainingConfig(sex);
  return baseProgression * config.progressionBias[type];
};

export const getRestTime = (exerciseType: 'compound' | 'isolation', sex?: SexType): number => {
  const config = getSexBasedTrainingConfig(sex);
  return config.defaultRest[exerciseType];
};

export const getRepRange = (goal: 'strength' | 'hypertrophy' | 'endurance', sex?: SexType): [number, number] => {
  const config = getSexBasedTrainingConfig(sex);
  return config.repRanges[goal];
};