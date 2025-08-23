import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecalibrationRequest {
  userId?: string;
  dryRun?: boolean;
  batchMode?: boolean; // Process all users
}

// Embedded RecalibrationEngine (simplified for edge function)
class RecalibrationEngine {
  private static readonly OVERSHOOT_THRESHOLD = 3;
  private static readonly UNDERSHOOT_THRESHOLD = 2;
  private static readonly MIN_CONFIDENCE = 0.7;

  static async recalibrateUserPlans(
    supabase: any,
    userId: string, 
    dryRun: boolean = false
  ) {
    console.log(`Starting recalibration for user ${userId}, dry-run: ${dryRun}`);
    
    const results: any[] = [];
    const muscleVolumeChanges: Record<string, any> = {};

    // Get user's active templates
    const { data: templates, error: templatesError } = await supabase
      .from('workout_templates')
      .select('id, name')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (templatesError) {
      console.error('Failed to fetch templates:', templatesError);
      return { error: templatesError.message };
    }

    for (const template of templates || []) {
      console.log(`Processing template: ${template.name}`);
      
      // Get template exercises
      const { data: templateExercises } = await supabase
        .from('template_exercises')
        .select(`
          id,
          exercise_id,
          default_sets,
          target_reps,
          target_settings
        `)
        .eq('template_id', template.id);

      for (const templateExercise of templateExercises || []) {
        if (templateExercise?.exercise_id) {
          const metrics = await this.calculatePerformanceMetrics(
            supabase,
            userId, 
            templateExercise.exercise_id
          );

          if (metrics) {
            const result = await this.determineAdjustment(templateExercise, metrics);
            if (result) {
              results.push(result);
              
              if (!dryRun && result.confidence >= this.MIN_CONFIDENCE) {
                await this.applyAdjustment(supabase, templateExercise.id, result);
                console.log(`Applied adjustment: ${result.action} for exercise ${result.exerciseId}`);
              }
            }
          }
        }
      }
    }

    // Volume rebalancing
    const volumeChanges = await this.rebalanceVolume(supabase, userId, dryRun);
    Object.assign(muscleVolumeChanges, volumeChanges);

    const summary = {
      userId,
      results,
      muscleVolumeChanges,
      totalChanges: results.length + Object.keys(volumeChanges).length,
      dryRun,
      timestamp: new Date().toISOString()
    };

    console.log(`Recalibration complete. ${results.length} adjustments identified`);
    return summary;
  }

  private static async calculatePerformanceMetrics(
    supabase: any,
    userId: string, 
    exerciseId: string
  ) {
    // Get recent workout data
    const { data: recentSets } = await supabase
      .from('workout_sets')
      .select(`
        reps,
        weight,
        rpe,
        completed_at,
        workout_exercises!inner(
          workout_id,
          exercise_id,
          workouts!inner(user_id, started_at)
        )
      `)
      .eq('workout_exercises.exercise_id', exerciseId)
      .eq('workout_exercises.workouts.user_id', userId)
      .eq('is_completed', true)
      .not('rpe', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(30);

    if (!recentSets || recentSets.length < 5) {
      return null;
    }

    // Group by session
    const sessionGroups = this.groupBySession(recentSets);
    const avgRir = this.calculateAverageRIR(sessionGroups.slice(0, 3));
    const consecutiveOvershoots = this.countConsecutiveOvershoots(sessionGroups);
    const consecutiveUndershoots = this.countConsecutiveUndershoots(sessionGroups);

    return {
      exerciseId,
      avgRir,
      consecutiveOvershoots,
      consecutiveUndershoots
    };
  }

  private static groupBySession(sets: any[]): any[][] {
    const sessions: Record<string, any[]> = {};
    
    for (const set of sets) {
      const sessionKey = set.workout_exercises.workouts.started_at.split('T')[0];
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

  private static async determineAdjustment(templateExercise: any, metrics: any) {
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

  private static async applyAdjustment(supabase: any, templateExerciseId: string, result: any) {
    const updateData: any = {};
    
    if (result.action === 'increase_load' || result.action === 'deload') {
      updateData.target_settings = { weight: result.newValue };
    }

    if (Object.keys(updateData).length > 0) {
      await supabase
        .from('template_exercises')
        .update(updateData)
        .eq('id', templateExerciseId);
    }
  }

  private static async rebalanceVolume(supabase: any, userId: string, dryRun: boolean) {
    // Get recent soreness data
    const { data: recentCheckins } = await supabase
      .from('readiness_checkins')
      .select('soreness, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    const avgSoreness = recentCheckins?.length 
      ? recentCheckins.reduce((sum: number, c: any) => sum + (c.soreness || 3), 0) / recentCheckins.length
      : 3;

    const volumeChanges: Record<string, any> = {};
    
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

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, dryRun = true, batchMode = false }: RecalibrationRequest = 
      await req.json().catch(() => ({}));

    console.log('Recalibration request:', { userId, dryRun, batchMode });

    if (batchMode) {
      // Process all users with recent activity
      const { data: activeUsers } = await supabase
        .from('workouts')
        .select('user_id')
        .gte('started_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('ended_at', 'is', null);

      const uniqueUserIds = [...new Set(activeUsers?.map(w => w.user_id) || [])];
      console.log(`Processing ${uniqueUserIds.length} active users`);

      const batchResults = [];
      for (const uid of uniqueUserIds.slice(0, 10)) { // Limit batch size
        try {
          const result = await RecalibrationEngine.recalibrateUserPlans(supabase, uid, dryRun);
          batchResults.push(result);
        } catch (error) {
          console.error(`Error processing user ${uid}:`, error);
          batchResults.push({ userId: uid, error: error.message });
        }
      }

      return new Response(
        JSON.stringify({
          batchMode: true,
          dryRun,
          processedUsers: batchResults.length,
          results: batchResults,
          timestamp: new Date().toISOString()
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId is required for single-user mode' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const result = await RecalibrationEngine.recalibrateUserPlans(supabase, userId, dryRun);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Recalibration error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});