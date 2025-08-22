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
  const { i18n } = useTranslation();

  return useQuery({
    queryKey: ['experience-levels', i18n.language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experience_levels')
        .select(`
          id,
          slug,
          sort_order,
          experience_level_translations!inner (
            name,
            description
          )
        `)
        .eq('experience_level_translations.language_code', i18n.language)
        .order('sort_order');

      if (error) {
        console.error('Error fetching experience levels:', error);
        throw error;
      }

      return data?.map(level => ({
        id: level.id,
        slug: level.slug,
        sort_order: level.sort_order,
        name: level.experience_level_translations[0]?.name || level.slug,
        description: level.experience_level_translations[0]?.description
      })) || [];
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