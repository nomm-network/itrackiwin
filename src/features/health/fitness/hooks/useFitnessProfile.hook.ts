import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FitnessProfile {
  id: string;
  user_id: string;
  goal: string;
  training_goal: string;
  experience_level: "new" | "returning" | "intermediate" | "advanced" | "very_experienced";
  bodyweight?: number;
  height_cm?: number;
  height?: number;
  injuries?: string[];
  days_per_week?: number;
  preferred_session_minutes?: number;
  created_at: string;
  updated_at: string;
}

export const useFitnessProfile = () => {
  return useQuery({
    queryKey: ['fitness-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profile_fitness')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as FitnessProfile | null;
    }
  });
};

export const useUpsertFitnessProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Partial<FitnessProfile> & { goal: string; training_goal: string; experience_level: "new" | "returning" | "intermediate" | "advanced" | "very_experienced" }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profile_fitness')
        .upsert({
          user_id: user.id,
          goal: profile.goal,
          training_goal: profile.training_goal,
          experience_level: profile.experience_level,
          bodyweight: profile.bodyweight,
          height_cm: profile.height_cm,
          height: profile.height,
          injuries: profile.injuries,
          days_per_week: profile.days_per_week,
          preferred_session_minutes: profile.preferred_session_minutes
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fitness-profile'] });
      toast({
        title: "Profile Updated",
        description: "Your fitness profile has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating fitness profile:', error);
      toast({
        title: "Error",
        description: "Failed to update your fitness profile. Please try again.",
        variant: "destructive",
      });
    }
  });
};

export const useGamification = () => {
  return useQuery({
    queryKey: ['user-gamification'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });
};

export const useUpdateXP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (xpGain: number) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get current XP
      const { data: current } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const newTotalXP = (current?.total_xp || 0) + xpGain;
      const newLevel = Math.floor(newTotalXP / 1000) + 1; // 1000 XP per level

      const { data, error } = await supabase
        .from('user_gamification')
        .upsert({
          user_id: user.id,
          total_xp: newTotalXP,
          current_level: newLevel
        })
        .select()
        .single();

      if (error) throw error;
      return { data, xpGain };
    },
    onSuccess: ({ xpGain }) => {
      queryClient.invalidateQueries({ queryKey: ['user-gamification'] });
      toast({
        title: "XP Gained!",
        description: `You earned ${xpGain} XP!`,
      });
    }
  });
};