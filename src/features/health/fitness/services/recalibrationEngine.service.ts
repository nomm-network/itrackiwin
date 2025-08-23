export interface PerformanceMetrics {
  exerciseId: string;
  templateId: string;
  avgRir: number;
  achievedRepsVsRange: number; // Ratio of achieved vs target reps
  consecutiveOvershoots: number;
  consecutiveUndershoots: number;
  lastThreeSessionsRpe: number[];
  volumeProgress: number; // Weekly volume change %
}

export interface RecalibrationResult {
  templateId: string;
  exerciseId: string;
  action: 'increase_load' | 'increase_reps' | 'deload' | 'rebalance_volume' | 'no_change';
  oldValue: number;
  newValue: number;
  reason: string;
  confidence: number; // 0-1 scale
}

export interface RecalibrationSummary {
  userId: string;
  results: RecalibrationResult[];
  muscleVolumeChanges: Record<string, { old: number; new: number; reason: string }>;
  totalChanges: number;
  dryRun: boolean;
  timestamp: Date;
}

export class RecalibrationEngine {
  private static readonly OVERSHOOT_THRESHOLD = 3; // Consecutive sessions
  private static readonly UNDERSHOOT_THRESHOLD = 2;
  private static readonly MAX_VOLUME_CHANGE = 0.2; // ±20%
  private static readonly MIN_CONFIDENCE = 0.7;

  static async recalibrateUserPlans(
    userId: string, 
    dryRun: boolean = false
  ): Promise<RecalibrationSummary> {
    console.log(`Starting recalibration for user ${userId}, dry-run: ${dryRun}`);
    
    const results: RecalibrationResult[] = [];
    const muscleVolumeChanges: Record<string, { old: number; new: number; reason: string }> = {};

    try {
      // Import supabase client at runtime
      const supabaseModule = await import('@/integrations/supabase/client');
      const supabase = supabaseModule.supabase as any;

      // Get user's active templates
      const templatesResult = await supabase
        .from('workout_templates')
        .select('id, name')
        .eq('user_id', userId)
        .eq('is_active', true);
      
      const templates = templatesResult.data || [];
      
      if (templatesResult.error) {
        throw new Error(`Failed to fetch templates: ${templatesResult.error.message}`);
      }

      for (const template of templates) {
        console.log(`Processing template: ${template.name} (${template.id})`);
        
        // Get template exercises
        const exercisesResult = await supabase
          .from('template_exercises')
          .select('id, exercise_id, default_sets, target_reps, target_settings')
          .eq('template_id', template.id);
          
        const templateExercises = exercisesResult.data || [];

        for (const templateExercise of templateExercises) {
          if (templateExercise?.exercise_id) {
            const metrics = await this.calculatePerformanceMetrics(
              supabase,
              userId, 
              templateExercise.exercise_id, 
              template.id
            );

            if (metrics) {
              const result = await this.determineAdjustment(templateExercise, metrics);
              if (result) {
                results.push(result);
                
                if (!dryRun && result.confidence >= this.MIN_CONFIDENCE) {
                  await this.applyAdjustment(supabase, templateExercise.id, result);
                }
              }
            }
          }
        }
      }

      // Weekly volume rebalancing
      const volumeChanges = await this.rebalanceVolume(supabase, userId, dryRun);
      Object.assign(muscleVolumeChanges, volumeChanges);

      console.log(`Recalibration complete. ${results.length} adjustments identified`);
      
      return {
        userId,
        results,
        muscleVolumeChanges,
        totalChanges: results.length + Object.keys(volumeChanges).length,
        dryRun,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Recalibration error:', error);
      throw error;
    }
  }

  private static async calculatePerformanceMetrics(
    supabase: any,
    userId: string, 
    exerciseId: string, 
    templateId: string
  ): Promise<PerformanceMetrics | null> {
    // Get recent workout sets - simplified approach
    const setsResult = await supabase
      .from('workout_sets')
      .select('reps, weight, rpe, completed_at, workout_exercise_id')
      .eq('is_completed', true)
      .not('rpe', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(100);
    
    if (!setsResult.data || setsResult.data.length < 5) {
      return null;
    }

    // Get workout exercises for this exercise
    const exercisesResult = await supabase
      .from('workout_exercises')
      .select('id, exercise_id, workout_id')
      .eq('exercise_id', exerciseId);
    
    // Get user workouts
    const workoutsResult = await supabase
      .from('workouts')
      .select('id, user_id, started_at')
      .eq('user_id', userId);
    
    // Filter sets that belong to this user and exercise
    const userWorkoutIds = new Set(workoutsResult.data?.map((w: any) => w.id) || []);
    const exerciseWorkoutExerciseIds = new Set(
      exercisesResult.data
        ?.filter((we: any) => userWorkoutIds.has(we.workout_id))
        ?.map((we: any) => we.id) || []
    );
    
    const recentSets = setsResult.data.filter((set: any) => 
      exerciseWorkoutExerciseIds.has(set.workout_exercise_id)
    ).slice(0, 30);

    if (!recentSets || recentSets.length < 5) {
      return null;
    }

    // Group by session and calculate metrics
    const sessionGroups = this.groupBySession(recentSets);
    const lastThreeSessions = sessionGroups.slice(0, 3);
    
    const avgRir = this.calculateAverageRIR(lastThreeSessions);
    const achievedRepsVsRange = this.calculateRepsVsRange(lastThreeSessions);
    const consecutiveOvershoots = this.countConsecutiveOvershoots(sessionGroups);
    const consecutiveUndershoots = this.countConsecutiveUndershoots(sessionGroups);
    const lastThreeSessionsRpe = lastThreeSessions.map(session => 
      session.reduce((sum, set) => sum + (set.rpe || 0), 0) / session.length
    );

    return {
      exerciseId,
      templateId,
      avgRir,
      achievedRepsVsRange,
      consecutiveOvershoots,
      consecutiveUndershoots,
      lastThreeSessionsRpe,
      volumeProgress: this.calculateVolumeProgress(sessionGroups)
    };
  }

  private static groupBySession(sets: any[]): any[][] {
    const sessions: Record<string, any[]> = {};
    
    for (const set of sets) {
      const sessionKey = set.completed_at.split('T')[0];
      if (!sessions[sessionKey]) {
        sessions[sessionKey] = [];
      }
      sessions[sessionKey].push(set);
    }

    return Object.values(sessions).sort((a, b) => 
      new Date(b[0].completed_at).getTime() - new Date(a[0].completed_at).getTime()
    );
  }

  private static calculateAverageRIR(sessions: any[][]): number {
    const allRpe = sessions.flat().map(set => set.rpe).filter(Boolean);
    if (allRpe.length === 0) return 5;
    const avgRpe = allRpe.reduce((sum, rpe) => sum + rpe, 0) / allRpe.length;
    return Math.max(0, 10 - avgRpe);
  }

  private static calculateRepsVsRange(sessions: any[][]): number {
    const allReps = sessions.flat().map(set => set.reps);
    if (allReps.length === 0) return 1;
    const avgReps = allReps.reduce((sum, reps) => sum + reps, 0) / allReps.length;
    return avgReps / 8; // Assuming target of 8 reps
  }

  private static countConsecutiveOvershoots(sessions: any[][]): number {
    let count = 0;
    for (const session of sessions) {
      const avgRir = this.calculateAverageRIR([session]);
      if (avgRir >= 4) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private static countConsecutiveUndershoots(sessions: any[][]): number {
    let count = 0;
    for (const session of sessions) {
      const avgRir = this.calculateAverageRIR([session]);
      if (avgRir <= 1) {
        count++;
      } else {
        break;
      }
    }
    return count;
  }

  private static calculateVolumeProgress(sessions: any[][]): number {
    if (sessions.length < 2) return 0;
    
    const recentVolume = this.calculateSessionVolume(sessions[0]);
    const oldVolume = this.calculateSessionVolume(sessions[sessions.length - 1]);
    
    return oldVolume > 0 ? (recentVolume - oldVolume) / oldVolume : 0;
  }

  private static calculateSessionVolume(session: any[]): number {
    return session.reduce((total, set) => total + (set.weight * set.reps), 0);
  }

  private static async determineAdjustment(
    templateExercise: any, 
    metrics: PerformanceMetrics
  ): Promise<RecalibrationResult | null> {
    const { avgRir, consecutiveOvershoots, consecutiveUndershoots } = metrics;
    const currentWeight = templateExercise.target_settings?.weight || 60;
    
    if (consecutiveOvershoots >= this.OVERSHOOT_THRESHOLD) {
      const increasePercent = Math.min(0.05, 0.02 * consecutiveOvershoots);
      const newWeight = currentWeight * (1 + increasePercent);
      
      return {
        templateId: templateExercise.template_id,
        exerciseId: templateExercise.exercise_id,
        action: 'increase_load',
        oldValue: currentWeight,
        newValue: Math.round(newWeight * 4) / 4,
        reason: `${consecutiveOvershoots} consecutive easy sessions (avg RIR: ${avgRir.toFixed(1)})`,
        confidence: Math.min(0.9, 0.6 + (consecutiveOvershoots * 0.1))
      };
    }

    if (consecutiveUndershoots >= this.UNDERSHOOT_THRESHOLD) {
      const deloadPercent = 0.1;
      const newWeight = currentWeight * (1 - deloadPercent);
      
      return {
        templateId: templateExercise.template_id,
        exerciseId: templateExercise.exercise_id,
        action: 'deload',
        oldValue: currentWeight,
        newValue: Math.round(newWeight * 4) / 4,
        reason: `${consecutiveUndershoots} consecutive hard sessions (avg RIR: ${avgRir.toFixed(1)})`,
        confidence: 0.8
      };
    }

    return null;
  }

  private static async applyAdjustment(
    supabase: any,
    templateExerciseId: string, 
    result: RecalibrationResult
  ): Promise<void> {
    const updateData: any = {};
    
    if (result.action === 'increase_load' || result.action === 'deload') {
      updateData.target_settings = { weight: result.newValue };
    } else if (result.action === 'increase_reps') {
      updateData.target_reps = result.newValue;
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('template_exercises')
        .update(updateData)
        .eq('id', templateExerciseId);
    }
  }

  private static async rebalanceVolume(
    supabase: any,
    userId: string, 
    dryRun: boolean
  ): Promise<Record<string, { old: number; new: number; reason: string }>> {
    const checkinsResult = await supabase
      .from('readiness_checkins')
      .select('soreness, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    const recentCheckins = checkinsResult.data;
    const avgSoreness = recentCheckins?.length 
      ? recentCheckins.reduce((sum: number, c: any) => sum + (c.soreness || 3), 0) / recentCheckins.length
      : 3;

    const volumeChanges: Record<string, { old: number; new: number; reason: string }> = {};
    
    if (avgSoreness >= 4) {
      volumeChanges['all_muscles'] = {
        old: 100,
        new: 90,
        reason: `High average soreness (${avgSoreness.toFixed(1)}/5) - reducing volume by 10%`
      };
    } else if (avgSoreness <= 2) {
      volumeChanges['all_muscles'] = {
        old: 100,
        new: 110,
        reason: `Low average soreness (${avgSoreness.toFixed(1)}/5) - increasing volume by 10%`
      };
    }

    return volumeChanges;
  }
}

export { RecalibrationEngine as recalibrationEngine };