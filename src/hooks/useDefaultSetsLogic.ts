import { useMemo } from 'react';

export interface DefaultSetsReps {
  sets: number;
  reps: number;
  notes?: string;
}

export interface UserTrainingProfile {
  focus?: 'general' | 'hypertrophy' | 'strength' | 'endurance' | 'weight_loss';
  experience?: 'new' | 'regular' | 'experienced';
}

export const useDefaultSetsLogic = (userProfile: UserTrainingProfile): DefaultSetsReps => {
  return useMemo(() => {
    const { focus = 'general', experience = 'regular' } = userProfile;

    // Default Sets & Reps Decision Table
    const decisionsTable: Record<string, Record<string, DefaultSetsReps>> = {
      general: {
        new: { sets: 2, reps: 12, notes: 'Keep volume low, focus on movement quality' },
        regular: { sets: 3, reps: 10, notes: 'Balanced hypertrophy/endurance mix' },
        experienced: { sets: 3, reps: 8, notes: 'Can add intensity or supersets' }
      },
      hypertrophy: {
        new: { sets: 2, reps: 12, notes: 'Intro to muscle building' },
        regular: { sets: 3, reps: 10, notes: 'Standard hypertrophy' },
        experienced: { sets: 4, reps: 8, notes: 'Higher volume, progressive overload' }
      },
      strength: {
        new: { sets: 2, reps: 8, notes: 'Learn technique, don\'t overload' },
        regular: { sets: 3, reps: 6, notes: '3×5 or 4×6 typical' },
        experienced: { sets: 5, reps: 5, notes: '5×5, 4×4, intensity focus' }
      },
      endurance: {
        new: { sets: 2, reps: 15, notes: 'Very light loads, more reps' },
        regular: { sets: 3, reps: 16, notes: 'Higher rep ranges, 30–60 sec rest' },
        experienced: { sets: 3, reps: 18, notes: 'Circuit/superset style' }
      },
      weight_loss: {
        new: { sets: 2, reps: 12, notes: 'Short rests, can mix with cardio' },
        regular: { sets: 3, reps: 12, notes: 'Short rests, can mix with cardio' },
        experienced: { sets: 3, reps: 15, notes: 'Short rests, can mix with cardio' }
      }
    };

    return decisionsTable[focus]?.[experience] || { sets: 3, reps: 10, notes: 'Standard workout' };
  }, [userProfile]);
};

// Helper function to get user profile from fitness data
export const getUserTrainingProfile = (fitnessProfile: any): UserTrainingProfile => {
  // Map experience levels to our simplified categories
  const experienceMapping: Record<string, 'new' | 'regular' | 'experienced'> = {
    'beginner': 'new',
    'novice': 'new', 
    'intermediate': 'regular',
    'advanced': 'experienced',
    'expert': 'experienced'
  };

  // Map goals to our training focus categories  
  const focusMapping: Record<string, 'general' | 'hypertrophy' | 'strength' | 'endurance' | 'weight_loss'> = {
    'muscle_gain': 'hypertrophy',
    'strength': 'strength',
    'weight_loss': 'weight_loss',
    'endurance': 'endurance',
    'general_fitness': 'general',
    'conditioning': 'weight_loss'
  };

  return {
    experience: experienceMapping[fitnessProfile?.experience_level] || 'regular',
    focus: focusMapping[fitnessProfile?.primary_goal] || 'general'
  };
};