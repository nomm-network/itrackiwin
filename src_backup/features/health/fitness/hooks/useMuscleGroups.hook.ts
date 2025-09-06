import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MuscleGroup {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export const useMuscleGroups = (language: string = 'en') => {
  return useQuery({
    queryKey: ['muscle-groups', language],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('muscle_groups')
        .select(`
          id,
          slug,
          muscle_groups_translations!inner(
            name,
            description
          )
        `)
        .eq('muscle_groups_translations.language_code', language)
        .order('muscle_groups_translations.name');

      if (error) throw error;

      return data.map((mg: any) => ({
        id: mg.id,
        slug: mg.slug,
        name: mg.muscle_groups_translations[0]?.name || mg.slug,
        description: mg.muscle_groups_translations[0]?.description
      })) as MuscleGroup[];
    }
  });
};