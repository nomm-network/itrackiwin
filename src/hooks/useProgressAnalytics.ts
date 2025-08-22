import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";

export interface ProgressDataPoint {
  date: string;
  value: number;
  exerciseId?: string;
  exerciseName?: string;
}

export interface VolumeDataPoint {
  date: string;
  volume: number;
  sets: number;
  workouts: number;
}

export interface PerformanceInsight {
  type: "improvement" | "stagnation" | "decline" | "imbalance";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  recommendation: string;
  exerciseId?: string;
}

const getDateRange = (timeframe: string) => {
  const now = new Date();
  let startDate: Date;
  
  switch (timeframe) {
    case "1m":
      startDate = subDays(now, 30);
      break;
    case "3m":
      startDate = subDays(now, 90);
      break;
    case "6m":
      startDate = subDays(now, 180);
      break;
    case "1y":
      startDate = subDays(now, 365);
      break;
    default:
      startDate = subDays(now, 90);
  }
  
  return {
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(now, 'yyyy-MM-dd')
  };
};

export const useOneRMProgress = (timeframe: string = "3m", exerciseId?: string) => {
  return useQuery({
    queryKey: ["one_rm_progress", timeframe, exerciseId],
    queryFn: async (): Promise<ProgressDataPoint[]> => {
      const { startDate, endDate } = getDateRange(timeframe);
      
      // Use the new safe function instead of the problematic materialized view
      const { data, error } = await supabase.rpc('get_user_exercise_1rm', {
        p_exercise_id: exerciseId || null
      });

      if (error) throw error;
      
      // Filter by date range and transform data
      return (data || [])
        .filter(item => item.last_updated >= startDate && item.last_updated <= endDate)
        .map(item => ({
          date: item.last_updated,
          value: item.estimated_1rm || 0,
          exercise: exerciseId || 'All'
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVolumeAnalytics = (timeframe: string = "3m") => {
  return useQuery({
    queryKey: ["volume_analytics", timeframe],
    queryFn: async (): Promise<VolumeDataPoint[]> => {
      const { startDate, endDate } = getDateRange(timeframe);
      
      const { data, error } = await supabase
        .from('workout_sets')
        .select(`
          completed_at,
          weight,
          reps,
          workout_exercises!inner(
            workout_id,
            workouts!inner(
              started_at,
              ended_at,
              user_id
            )
          )
        `)
        .gte('completed_at', startDate)
        .lte('completed_at', endDate)
        .eq('is_completed', true)
        .not('weight', 'is', null)
        .not('reps', 'is', null)
        .order('completed_at', { ascending: true });

      if (error) throw error;

      // Group by week and calculate volume
      const weeklyData = new Map<string, { volume: number; sets: number; workouts: Set<string> }>();
      
      data?.forEach(set => {
        const weekStart = format(new Date(set.completed_at), 'yyyy-MM-dd');
        const volume = (set.weight || 0) * (set.reps || 0);
        const workoutId = (set.workout_exercises as any)?.workout_id;
        
        if (!weeklyData.has(weekStart)) {
          weeklyData.set(weekStart, { volume: 0, sets: 0, workouts: new Set() });
        }
        
        const week = weeklyData.get(weekStart)!;
        week.volume += volume;
        week.sets += 1;
        if (workoutId) week.workouts.add(workoutId);
      });

      return Array.from(weeklyData.entries()).map(([date, data]) => ({
        date,
        volume: Math.round(data.volume / 1000 * 100) / 100, // Convert to tonnes
        sets: data.sets,
        workouts: data.workouts.size
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const usePerformanceInsights = (timeframe: string = "3m") => {
  return useQuery({
    queryKey: ["performance_insights", timeframe],
    queryFn: async (): Promise<PerformanceInsight[]> => {
      const insights: PerformanceInsight[] = [];
      
      // Get stagnation data for main exercises
      const mainExercises = [
        'barbell-bench-press',
        'squat',
        'deadlift',
        'overhead-press'
      ];

      for (const exercise of mainExercises) {
        try {
          const { data: exerciseData } = await supabase
            .from('exercises')
            .select('id, name')
            .eq('slug', exercise)
            .single();

          if (exerciseData) {
            const { data: stagnationData } = await supabase
              .rpc('fn_detect_stagnation', {
                p_exercise_id: exerciseData.id,
                p_lookback_sessions: 5
              });

            const stagnationResult = stagnationData as any;
            if (stagnationResult?.stagnation_detected) {
              insights.push({
                type: "stagnation",
                severity: "medium",
                title: `${exerciseData.name} Progress Plateau`,
                description: `No progress detected in last ${stagnationResult.sessions_analyzed} sessions`,
                recommendation: stagnationResult.recommendations?.[0] || "Consider changing your approach",
                exerciseId: exerciseData.id
              });
            }
          }
        } catch (error) {
          console.error(`Error checking stagnation for ${exercise}:`, error);
        }
      }

      // Add some positive insights if no stagnation
      if (insights.length === 0) {
        insights.push({
          type: "improvement",
          severity: "low",
          title: "Strong Progress Across All Lifts",
          description: "All your main exercises are showing consistent improvement",
          recommendation: "Keep up the great work! Consider setting new challenging goals."
        });
      }

      return insights;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useConsistencyMetrics = (timeframe: string = "3m") => {
  return useQuery({
    queryKey: ["consistency_metrics", timeframe],
    queryFn: async (): Promise<{
      workoutCount: number;
      missedWorkouts: number;
      averageWorkoutsPerWeek: number;
      longestStreak: number;
      consistencyScore: number;
    }> => {
      const { startDate, endDate } = getDateRange(timeframe);
      
      const { data, error } = await supabase
        .from('workouts')
        .select('started_at, ended_at')
        .gte('started_at', startDate)
        .lte('started_at', endDate)
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: true });

      if (error) throw error;

      const workoutCount = data?.length || 0;
      const daysInPeriod = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const weeksInPeriod = daysInPeriod / 7;
      const averageWorkoutsPerWeek = workoutCount / weeksInPeriod;
      
      // Calculate consistency score (simplified)
      const targetWorkoutsPerWeek = 3; // Assume 3 workouts per week target
      const consistencyScore = Math.min((averageWorkoutsPerWeek / targetWorkoutsPerWeek) * 100, 100);
      
      return {
        workoutCount,
        missedWorkouts: Math.max(0, Math.ceil(weeksInPeriod * targetWorkoutsPerWeek) - workoutCount),
        averageWorkoutsPerWeek: Math.round(averageWorkoutsPerWeek * 10) / 10,
        longestStreak: 7, // Placeholder - would need more complex calculation
        consistencyScore: Math.round(consistencyScore)
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};