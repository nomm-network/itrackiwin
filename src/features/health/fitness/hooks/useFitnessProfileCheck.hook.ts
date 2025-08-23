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
    queryKey: ['user-profile-fitness', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_profile_fitness')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching fitness profile:', error);
      }
      return data;
    },
    enabled: !!user?.id
  });

  const checkAndRedirect = (action: string = 'continue') => {
    if (!fitnessProfile || 
        !fitnessProfile.goal ||
        !fitnessProfile.days_per_week ||
        !fitnessProfile.preferred_session_minutes ||
        !fitnessProfile.experience_level) {
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
                   fitnessProfile.goal && 
                   fitnessProfile.days_per_week &&
                   fitnessProfile.preferred_session_minutes &&
                   fitnessProfile.experience_level),
    profile: fitnessProfile,
    checkAndRedirect
  };
};