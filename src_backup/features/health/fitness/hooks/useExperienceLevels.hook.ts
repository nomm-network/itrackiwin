import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

export interface ExperienceLevel {
  id: string;
  slug: string;
  sort_order: number;
  name: string;
  description?: string;
}

export const useExperienceLevels = () => {
  return useQuery({
    queryKey: ['experience-levels'],
    queryFn: async () => {
      // Return experience levels matching the database enum
      return [
        { id: 'new', slug: 'new', sort_order: 1, name: 'New to Exercise', description: 'Just starting your fitness journey' },
        { id: 'returning', slug: 'returning', sort_order: 2, name: 'Returning', description: 'Getting back into fitness after a break' },
        { id: 'intermediate', slug: 'intermediate', sort_order: 3, name: 'Intermediate', description: 'Consistent training for several months' },
        { id: 'advanced', slug: 'advanced', sort_order: 4, name: 'Advanced', description: 'Years of training experience' },
        { id: 'very_experienced', slug: 'very_experienced', sort_order: 5, name: 'Very Experienced', description: 'Elite level training and competition experience' }
      ];
    }
  });
};

export const useUserCoachParams = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['user-coach-params', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .rpc('get_user_coach_params', { _user_id: userId });

      if (error) {
        console.error('Error fetching user coach params:', error);
        throw error;
      }

      return data?.[0] || null;
    },
    enabled: !!userId
  });
};