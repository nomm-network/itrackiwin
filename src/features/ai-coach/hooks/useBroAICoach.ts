import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ProgramGenerationRequest {
  goal: 'recomp' | 'fat_loss' | 'muscle_gain' | 'strength' | 'general_fitness';
  experience_level: 'new' | 'returning' | 'intermediate' | 'advanced' | 'very_experienced';
  training_days_per_week: number;
  location_type: 'home' | 'gym';
  available_equipment: string[];
  priority_muscle_groups: string[];
  time_per_session_min?: number;
}

export interface AIProgram {
  id: string;
  title: string;
  goal: string;
  weeks: number;
  status: string;
  created_at: string;
  ai_program_weeks: Array<{
    week_number: number;
    ai_program_workouts: Array<{
      day_of_week: number;
      title: string;
      focus_tags: string[];
    }>;
  }>;
}

export const useGenerateProgram = () => {
  return useMutation({
    mutationFn: async (params: ProgramGenerationRequest) => {
      const { data, error } = await supabase.functions.invoke('bro-ai-coach', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Program Generated! 💪",
        description: `Bro AI has created your custom ${data.program?.weeks}-week program.`,
      });
    },
    onError: (error: any) => {
      console.error('Error generating program:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate your program. Please try again.",
        variant: "destructive",
      });
    }
  });
};

export const useAIPrograms = () => {
  return useQuery({
    queryKey: ['ai-programs'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('bro-ai-coach', {
        method: 'GET',
      });

      if (error) throw error;
      return data.programs as AIProgram[];
    },
  });
};

export const useFitnessProfile = () => {
  return useQuery({
    queryKey: ['fitness-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('fitness_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
  });
};

export const useUpsertFitnessProfile = () => {
  return useMutation({
    mutationFn: async (profile: ProgramGenerationRequest) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('fitness_profile')
        .upsert({
          user_id: user.id,
          experience_level: profile.experience_level,
          training_days_per_week: profile.training_days_per_week,
          location_type: profile.location_type,
          available_equipment: profile.available_equipment || [],
          priority_muscle_groups: profile.priority_muscle_groups || [],
          time_per_session_min: profile.time_per_session_min || 60
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your fitness profile has been saved.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating profile:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });
};