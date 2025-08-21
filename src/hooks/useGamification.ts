import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  criteria: any;
  is_active: boolean;
  created_at: string;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress?: any;
  achievement: Achievement;
}

interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  workout_streak: number;
  longest_streak: number;
  total_workouts: number;
  total_exercises: number;
  total_volume: number;
  last_workout_date?: string;
  created_at: string;
  updated_at: string;
}

interface Streak {
  id: string;
  user_id: string;
  type: string;
  current_count: number;
  longest_count: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

// Hook for user stats
export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No stats found, create initial stats
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            workout_streak: 0,
            longest_streak: 0,
            total_workouts: 0,
            total_exercises: 0,
            total_volume: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        return newStats;
      }

      if (error) throw error;
      return data;
    },
  });
};

// Hook for user achievements
export const useUserAchievements = () => {
  return useQuery({
    queryKey: ['user-achievements'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      return data as UserAchievement[];
    },
  });
};

// Hook for all achievements
export const useAchievements = () => {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
  });
};

// Hook for user streaks
export const useUserStreaks = () => {
  return useQuery({
    queryKey: ['user-streaks'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as Streak[];
    },
  });
};

// Hook for updating workout completion (awards XP and checks achievements)
export const useCompleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workoutData: {
      workoutId: string;
      exerciseCount: number;
      totalVolume: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update user stats
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const today = new Date().toISOString().split('T')[0];
      const lastWorkoutDate = currentStats?.last_workout_date;
      const isConsecutiveDay = lastWorkoutDate && 
        new Date(lastWorkoutDate).getTime() === new Date(today).getTime() - 86400000;

      const newStreak = isConsecutiveDay ? 
        (currentStats?.workout_streak || 0) + 1 : 1;

      const { error: updateError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_xp: (currentStats?.total_xp || 0) + 25, // Base XP for workout
          total_workouts: (currentStats?.total_workouts || 0) + 1,
          total_exercises: (currentStats?.total_exercises || 0) + workoutData.exerciseCount,
          total_volume: (currentStats?.total_volume || 0) + workoutData.totalVolume,
          workout_streak: newStreak,
          longest_streak: Math.max(newStreak, currentStats?.longest_streak || 0),
          last_workout_date: today,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // Check achievements
      const { error: achievementError } = await supabase.rpc('check_achievements', {
        p_user_id: user.id
      });

      if (achievementError) throw achievementError;

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      toast.success('Workout completed! XP earned!');
    },
    onError: (error) => {
      toast.error('Failed to update progress');
      console.error('Error completing workout:', error);
    },
  });
};

// Utility functions
export const calculateLevelProgress = (xp: number, level: number) => {
  const currentLevelXp = Math.pow(level - 1, 2) * 50;
  const nextLevelXp = Math.pow(level, 2) * 50;
  const progressXp = xp - currentLevelXp;
  const neededXp = nextLevelXp - currentLevelXp;
  
  return {
    current: progressXp,
    needed: neededXp,
    percentage: Math.min((progressXp / neededXp) * 100, 100)
  };
};

export const getXpForLevel = (level: number) => {
  return Math.pow(level - 1, 2) * 50;
};

export const getLevelFromXp = (xp: number) => {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
};