import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Handle {
  id: string;
  name: string;
  slug: string;
}

interface Grip {
  id: string;
  slug: string;
  category: string;
  name?: string; // Added during processing
}

interface HandleGripCompatibility {
  id: string;
  handle_id: string;
  grip_id: string;
  is_default: boolean;
  handle: Handle;
  grip: Grip;
}

export const useHandleGripCompatibility = (handleId?: string) => {
  return useQuery<HandleGripCompatibility[]>({
    queryKey: ['handle-grip-compatibility', handleId],
    queryFn: async () => {
      let query = supabase
        .from('handle_grip_compatibility')
        .select(`
          id,
          handle_id,
          grip_id,
          is_default,
          handle:handles(
            id,
            name,
            slug
          ),
          grip:grips(
            id,
            slug,
            category
          )
        `)
        .order('is_default', { ascending: false });

      if (handleId) {
        query = query.eq('handle_id', handleId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get grip translations separately to avoid relation issues
      const gripIds = data?.map(item => item.grip?.id).filter(Boolean) || [];
      const { data: gripTranslations } = await supabase
        .from('grips_translations')
        .select('grip_id, name, language_code')
        .in('grip_id', gripIds)
        .eq('language_code', 'en');

      // Process data to include formatted grip names
      const processedData = data?.map(item => {
        const translation = gripTranslations?.find(t => t.grip_id === item.grip?.id);
        
        return {
          ...item,
          grip: {
            ...item.grip,
            name: translation?.name || 
                  item.grip?.slug?.split('-').map((word: string) => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ') || 'Unknown Grip'
          } as Grip
        }
      }) || [];

      return processedData as HandleGripCompatibility[];
    },
    enabled: !!handleId || handleId === undefined, // Enable if handleId is provided or if fetching all
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get compatible grips for a specific handle
export const useCompatibleGrips = (handleId?: string) => {
  const { data: compatibility, ...rest } = useHandleGripCompatibility(handleId);
  
  const grips = compatibility?.map(item => ({
    ...item.grip,
    is_default: item.is_default
  })) || [];

  return {
    data: grips,
    ...rest
  };
};