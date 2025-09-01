import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Handle {
  id: string;
  name: string;
  slug: string;
  description?: string;
  translations?: Array<{
    name: string;
    description?: string;
    language_code: string;
  }>;
}

export const useHandles = () => {
  return useQuery({
    queryKey: ['handles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('handles')
        .select(`
          id,
          slug,
          translations:handles_translations(
            name,
            description,
            language_code
          )
        `)
        .order('slug');

      if (error) throw error;

      // Process data to include formatted name if needed
      const processedData = data?.map(handle => ({
        ...handle,
        name: (handle.translations as any)?.[0]?.name || 
              handle.slug.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
      })) || [];

      return processedData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Helper function to get handle ID by name
export const getHandleIdByName = (handles: any[], handleName: string): string | null => {
  const handle = handles.find(h => 
    h.name?.toLowerCase() === handleName.toLowerCase() ||
    h.slug?.toLowerCase() === handleName.toLowerCase()
  );
  return handle?.id || null;
};