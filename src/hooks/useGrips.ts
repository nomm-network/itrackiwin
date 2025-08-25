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
      console.log('Fetching grips from database...');
      
      // First try to get grips with translations
      let { data, error } = await supabase
        .from('grips')
        .select(`
          id,
          slug,
          category
        `);

      console.log('Grips query result:', { data, error });

      if (error) {
        console.error('Error fetching grips:', error);
        
        // Fallback to hardcoded grips if database fails
        console.log('Using fallback grips...');
        return [
          { id: 'overhand', slug: 'overhand', category: 'basic', name: 'Overhand' },
          { id: 'underhand', slug: 'underhand', category: 'basic', name: 'Underhand' },
          { id: 'neutral', slug: 'neutral', category: 'basic', name: 'Neutral' },
          { id: 'wide', slug: 'wide', category: 'variation', name: 'Wide' },
          { id: 'close', slug: 'close', category: 'variation', name: 'Close' },
          { id: 'mixed', slug: 'mixed', category: 'variation', name: 'Mixed' }
        ];
      }
      
      if (!data || data.length === 0) {
        console.log('No grips found in database, using fallback...');
        return [
          { id: 'overhand', slug: 'overhand', category: 'basic', name: 'Overhand' },
          { id: 'underhand', slug: 'underhand', category: 'basic', name: 'Underhand' },
          { id: 'neutral', slug: 'neutral', category: 'basic', name: 'Neutral' },
          { id: 'wide', slug: 'wide', category: 'variation', name: 'Wide' },
          { id: 'close', slug: 'close', category: 'variation', name: 'Close' },
          { id: 'mixed', slug: 'mixed', category: 'variation', name: 'Mixed' }
        ];
      }

      // Process the data - use slug as name since we don't have translations yet
      const processedData = data.map(grip => ({
        id: grip.id,
        slug: grip.slug,
        category: grip.category,
        name: grip.slug.charAt(0).toUpperCase() + grip.slug.slice(1).replace(/-/g, ' ')
      }));
      
      console.log('Processed grips data:', processedData);
      return processedData;
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