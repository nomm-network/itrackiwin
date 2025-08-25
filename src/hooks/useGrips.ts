import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Grip {
  id: string;
  slug: string;
  category: string;
  translations?: {
    name: string;
    description?: string;
  }[];
}

export const useGrips = () => {
  return useQuery({
    queryKey: ['grips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grips')
        .select(`
          id,
          slug,
          category,
          grips_translations!inner(
            name,
            description,
            language_code
          )
        `)
        .eq('grips_translations.language_code', 'en');

      if (error) throw error;
      
      return data?.map(grip => ({
        id: grip.id,
        slug: grip.slug,
        category: grip.category,
        name: Array.isArray(grip.grips_translations) && grip.grips_translations.length > 0 
          ? grip.grips_translations[0].name 
          : grip.slug,
        description: Array.isArray(grip.grips_translations) && grip.grips_translations.length > 0 
          ? grip.grips_translations[0].description 
          : undefined
      })) || [];
    },
  });
};

// Helper function to get grip ID by name
export const getGripIdByName = (grips: any[], gripName: string): string | null => {
  const grip = grips.find(g => 
    g.name?.toLowerCase() === gripName.toLowerCase() || 
    g.slug?.toLowerCase() === gripName.toLowerCase()
  );
  return grip?.id || null;
};