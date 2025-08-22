import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const useFitnessProfileCheck = () => {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    }
  });

  const { data: fitnessProfile } = useQuery({
    queryKey: ['user-fitness-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_fitness_profile')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id
  });

  const checkAndRedirect = (action: string = 'continue') => {
    if (!fitnessProfile || 
        !fitnessProfile.primary_weight_goal_id || 
        !fitnessProfile.training_focus_id || 
        !fitnessProfile.experience ||
        !fitnessProfile.days_per_week ||
        !fitnessProfile.preferred_session_minutes) {
      toast({
        title: "Fitness Profile Required",
        description: `Please complete your fitness profile to ${action}.`,
        variant: "destructive"
      });
      navigate('/fitness/configure?tab=profile');
      return false;
    }
    return true;
  };

  return {
    hasProfile: !!(fitnessProfile && 
                   fitnessProfile.primary_weight_goal_id && 
                   fitnessProfile.training_focus_id && 
                   fitnessProfile.experience &&
                   fitnessProfile.days_per_week &&
                   fitnessProfile.preferred_session_minutes),
    profile: fitnessProfile,
    checkAndRedirect
  };
};