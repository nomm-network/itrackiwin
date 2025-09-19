import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type SexType = "male" | "female" | "other" | "prefer_not_to_say";

export interface FitnessProfile {
  id: string;
  user_id: string;
  goal: string;
  training_goal: string;
  experience_level: "new" | "returning" | "intermediate" | "advanced" | "very_experienced";
  sex?: SexType;
  // bodyweight and height_cm moved to user_body_metrics table
  height?: number;
  injuries?: string[];
  days_per_week?: number;
  preferred_session_minutes?: number;
  location_type?: "home" | "gym";
  available_equipment?: string[];
  priority_muscle_groups?: string[];
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
    mutationFn: async (profile: Partial<FitnessProfile> & { goal: string; training_goal: string; experience_level?: "new" | "returning" | "intermediate" | "advanced" | "very_experienced"; sex?: SexType; location_type?: "home" | "gym"; available_equipment?: string[]; priority_muscle_groups?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profile_fitness')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const profileData = {
        user_id: user.id,
        goal: profile.goal,
        training_goal: profile.training_goal,
        sex: profile.sex,
        // bodyweight and height_cm are now stored in user_body_metrics table, not here
        days_per_week: profile.days_per_week,
        preferred_session_minutes: profile.preferred_session_minutes,
        location_type: profile.location_type,
        available_equipment: profile.available_equipment,
        priority_muscle_groups: profile.priority_muscle_groups,
        weight_entry_style: 'per_side', // Required field with default
        // Only include experience_level if it's not empty
        ...(profile.experience_level && profile.experience_level.trim() !== '' && {
          experience_level: profile.experience_level
        })
      };

      let data, error;

      if (existingProfile) {
        // Update existing profile
        const result = await supabase
          .from('user_profile_fitness')
          .update(profileData)
          .eq('user_id', user.id)
          .select()
          .single();
        data = result.data;
        error = result.error;
      } else {
        // Insert new profile
        const result = await supabase
          .from('user_profile_fitness')
          .insert(profileData)
          .select()
          .single();
        data = result.data;
        error = result.error;
      }

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