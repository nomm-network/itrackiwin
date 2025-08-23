import { supabase } from '@/integrations/supabase/client';
import { ExperienceLevelConfig } from '../hooks/useExperienceLevelConfigs.hook';

export interface WarmupSet {
  setIndex: number;
  weight: number;
  reps: number;
  restSeconds: number;
  intensity: number; // 0-1 scale
}

export interface WarmupPlan {
  exerciseId: string;
  workingWeight: number;
  workingReps: number;
  sets: WarmupSet[];
  totalDuration: number;
  adaptations: string[];
}

export interface WarmupFeedback {
  quality: 'not_enough' | 'excellent' | 'too_much';
  notes?: string;
  fatigue?: number; // 1-5 scale
}

export interface UserWarmupPreferences {
  userId: string;
  exerciseId: string;
  lastFeedback?: WarmupFeedback;
  successStreak: number;
  preferredSetCount?: number;
  preferredIntensityAdjustment?: number; // -0.2 to +0.2
  adaptationHistory: Array<{
    date: string;
    feedback: WarmupFeedback;
    setCount: number;
    maxIntensity: number;
  }>;
}

export class WarmupPolicyEngine {
  private static readonly BASE_WORKING_PERCENTAGE = 0.65; // Base intensity for working sets
  private static readonly INTENSITY_PROGRESSION = [0.4, 0.55, 0.7, 0.85]; // Standard progression
  private static readonly REP_PROGRESSION = [12, 10, 8, 6]; // Decreasing reps
  
  static async generateWarmupPlan(
    userId: string,
    exerciseId: string,
    workingWeight: number,
    workingReps: number = 8,
    experienceLevel?: string
  ): Promise<WarmupPlan> {
    // Get user's experience level config
    const experienceConfig = await this.getExperienceLevelConfig(experienceLevel);
    
    // Get user's warmup preferences and feedback history
    const userPrefs = await this.getUserWarmupPreferences(userId, exerciseId);
    
    // Calculate adaptive warmup based on experience and feedback
    const baseSetCount = this.calculateSetCount(experienceConfig, userPrefs);
    const intensityAdjustment = userPrefs?.preferredIntensityAdjustment || 0;
    
    const sets: WarmupSet[] = [];
    const totalSets = Math.min(baseSetCount, 6); // Cap at 6 sets max
    
    for (let i = 0; i < totalSets; i++) {
      const progressionRatio = (i + 1) / totalSets;
      const baseIntensity = this.INTENSITY_PROGRESSION[Math.min(i, this.INTENSITY_PROGRESSION.length - 1)];
      const adjustedIntensity = Math.max(0.3, Math.min(0.9, baseIntensity + intensityAdjustment));
      
      const weight = Math.round(workingWeight * adjustedIntensity * 2.5) / 2.5; // Round to 2.5kg
      const reps = this.calculateWarmupReps(adjustedIntensity, workingReps);
      const restSeconds = this.calculateWarmupRest(i, totalSets, experienceConfig);
      
      sets.push({
        setIndex: i + 1,
        weight,
        reps,
        restSeconds,
        intensity: adjustedIntensity
      });
    }
    
    const adaptations = this.generateAdaptationReasons(userPrefs, experienceConfig);
    const totalDuration = sets.reduce((sum, set) => sum + set.restSeconds, 0) + (sets.length * 30); // 30s per set execution
    
    return {
      exerciseId,
      workingWeight,
      workingReps,
      sets,
      totalDuration,
      adaptations
    };
  }
  
  static async updateWarmupFeedback(
    userId: string,
    exerciseId: string,
    feedback: WarmupFeedback,
    warmupPlan: WarmupPlan
  ): Promise<void> {
    const currentPrefs = await this.getUserWarmupPreferences(userId, exerciseId);
    
    // Calculate new preferences based on feedback
    const adaptations = this.calculateAdaptations(feedback, warmupPlan, currentPrefs);
    
    // Update success streak
    const newSuccessStreak = feedback.quality === 'excellent' 
      ? (currentPrefs?.successStreak || 0) + 1
      : 0;
    
    // Store updated preferences
    const updatedPrefs: UserWarmupPreferences = {
      userId,
      exerciseId,
      lastFeedback: feedback,
      successStreak: newSuccessStreak,
      preferredSetCount: adaptations.setCount,
      preferredIntensityAdjustment: adaptations.intensityAdjustment,
      adaptationHistory: [
        ...(currentPrefs?.adaptationHistory || []).slice(-9), // Keep last 10
        {
          date: new Date().toISOString(),
          feedback,
          setCount: warmupPlan.sets.length,
          maxIntensity: Math.max(...warmupPlan.sets.map(s => s.intensity))
        }
      ]
    };
    
    await this.saveWarmupPreferences(updatedPrefs);
  }
  
  private static async getExperienceLevelConfig(experienceLevel?: string): Promise<ExperienceLevelConfig | null> {
    if (!experienceLevel) return null;
    
    // Type guard for experience level
    const validLevels = ['new', 'returning', 'intermediate', 'advanced', 'very_experienced'] as const;
    if (!validLevels.includes(experienceLevel as any)) return null;
    
    const { data, error } = await supabase
      .from('experience_level_configs')
      .select('*')
      .eq('experience_level', experienceLevel as any)
      .single();
    
    if (error) {
      console.warn('Failed to fetch experience config:', error);
      return null;
    }
    
    return data;
  }
  
  private static async getUserWarmupPreferences(
    userId: string, 
    exerciseId: string
  ): Promise<UserWarmupPreferences | null> {
    const { data, error } = await supabase
      .from('user_exercise_warmups')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return {
      userId,
      exerciseId,
      lastFeedback: data.last_feedback ? (data.last_feedback as unknown as WarmupFeedback) : undefined,
      successStreak: data.success_streak || 0,
      preferredSetCount: (data as any).preferred_set_count,
      preferredIntensityAdjustment: (data as any).preferred_intensity_adjustment,
      adaptationHistory: (data as any).adaptation_history || []
    };
  }
  
  private static calculateSetCount(
    experienceConfig: ExperienceLevelConfig | null,
    userPrefs: UserWarmupPreferences | null
  ): number {
    // Start with experience level base
    const baseMin = experienceConfig?.warmup_set_count_min || 2;
    const baseMax = experienceConfig?.warmup_set_count_max || 4;
    let targetSets = Math.round((baseMin + baseMax) / 2);
    
    // Apply user preferences
    if (userPrefs?.preferredSetCount) {
      targetSets = userPrefs.preferredSetCount;
    }
    
    // Adapt based on recent feedback
    if (userPrefs?.lastFeedback) {
      switch (userPrefs.lastFeedback.quality) {
        case 'not_enough':
          targetSets += 1;
          break;
        case 'too_much':
          targetSets -= 1;
          break;
        case 'excellent':
          // Keep current if successful streak
          if (userPrefs.successStreak >= 3) {
            // Good streak, maintain current approach
          }
          break;
      }
    }
    
    return Math.max(baseMin, Math.min(baseMax, targetSets));
  }
  
  private static calculateWarmupReps(intensity: number, workingReps: number): number {
    // Inverse relationship: lower intensity = more reps
    const baseReps = 15 - Math.round(intensity * 10);
    return Math.max(5, Math.min(baseReps, workingReps + 4));
  }
  
  private static calculateWarmupRest(
    setIndex: number, 
    totalSets: number, 
    experienceConfig: ExperienceLevelConfig | null
  ): number {
    // Progressive rest: shorter for early sets, longer as intensity increases
    const baseRest = 45 + (setIndex * 15); // 45s, 60s, 75s, etc.
    
    // Experience level adjustment
    const experienceMultiplier = experienceConfig?.allow_high_complexity ? 1.2 : 1.0;
    
    return Math.round(baseRest * experienceMultiplier);
  }
  
  private static calculateAdaptations(
    feedback: WarmupFeedback,
    warmupPlan: WarmupPlan,
    currentPrefs: UserWarmupPreferences | null
  ): { setCount?: number; intensityAdjustment?: number } {
    const currentSetCount = warmupPlan.sets.length;
    const currentMaxIntensity = Math.max(...warmupPlan.sets.map(s => s.intensity));
    const currentIntensityAdj = currentPrefs?.preferredIntensityAdjustment || 0;
    
    switch (feedback.quality) {
      case 'not_enough':
        return {
          setCount: Math.min(6, currentSetCount + 1),
          intensityAdjustment: Math.min(0.2, currentIntensityAdj + 0.05)
        };
        
      case 'too_much':
        return {
          setCount: Math.max(2, currentSetCount - 1),
          intensityAdjustment: Math.max(-0.2, currentIntensityAdj - 0.05)
        };
        
      case 'excellent':
        // Maintain current settings if excellent
        return {
          setCount: currentSetCount,
          intensityAdjustment: currentIntensityAdj
        };
        
      default:
        return {};
    }
  }
  
  private static generateAdaptationReasons(
    userPrefs: UserWarmupPreferences | null,
    experienceConfig: ExperienceLevelConfig | null
  ): string[] {
    const reasons: string[] = [];
    
    if (experienceConfig) {
      reasons.push(`Adapted for ${experienceConfig.experience_level} experience level`);
    }
    
    if (userPrefs?.successStreak && userPrefs.successStreak >= 3) {
      reasons.push(`Maintaining successful warmup pattern (${userPrefs.successStreak} streak)`);
    }
    
    if (userPrefs?.lastFeedback) {
      switch (userPrefs.lastFeedback.quality) {
        case 'not_enough':
          reasons.push('Increased volume based on previous feedback');
          break;
        case 'too_much':
          reasons.push('Reduced volume based on previous feedback');
          break;
      }
    }
    
    if (userPrefs?.preferredIntensityAdjustment) {
      const direction = userPrefs.preferredIntensityAdjustment > 0 ? 'higher' : 'lower';
      reasons.push(`Adjusted intensity ${direction} based on your preferences`);
    }
    
    return reasons;
  }
  
  private static async saveWarmupPreferences(prefs: UserWarmupPreferences): Promise<void> {
    const { error } = await supabase
      .from('user_exercise_warmups')
      .upsert({
        user_id: prefs.userId,
        exercise_id: prefs.exerciseId,
        last_feedback: prefs.lastFeedback?.quality as any,
        success_streak: prefs.successStreak,
        preferred_set_count: prefs.preferredSetCount,
        preferred_intensity_adjustment: prefs.preferredIntensityAdjustment,
        adaptation_history: prefs.adaptationHistory,
        updated_at: new Date().toISOString(),
        plan_text: '', // Required field
        source: 'auto' // Required field
      } as any, {
        onConflict: 'user_id,exercise_id'
      });
    
    if (error) {
      console.error('Failed to save warmup preferences:', error);
      throw error;
    }
  }
}

export { WarmupPolicyEngine as warmupPolicyEngine };
