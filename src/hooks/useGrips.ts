import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Grip {
  id: string;
  slug: string;
  category: string;
  name?: string;
  translations?: Array<{
    name: string;
    language_code: string;
  }>;
}

export const useGrips = () => {
  return useQuery({
    queryKey: ['grips'],
    queryFn: async (): Promise<Grip[]> => {
      const { data, error } = await supabase
        .from('grips')
        .select('id, slug, category')
        .order('slug');

      if (error) throw error;

      // Get translations separately
      const gripIds = data?.map(grip => grip.id) || [];
      const { data: translations } = await supabase
        .from('grips_translations')
        .select('grip_id, name, language_code')
        .in('grip_id', gripIds)
        .eq('language_code', 'en');

      // Process data to include translated names
      const processedData = data?.map(grip => {
        const translation = translations?.find(t => t.grip_id === grip.id);
        return {
          ...grip,
          name: translation?.name || 
                grip.slug.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')
        };
      }) || [];

      return processedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper function to get grip ID by name
export const getGripIdByName = (grips: Grip[], gripName: string): string | null => {
  const grip = grips.find(g => 
    g.name?.toLowerCase() === gripName.toLowerCase() ||
    g.slug?.toLowerCase() === gripName.toLowerCase()
  );
  return grip?.id || null;
};