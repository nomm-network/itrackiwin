import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LifeCategory {
  id: string;
  slug: string;
  name: string;
  icon?: string;
  display_order: number;
}

export function useLifeCategories() {
  return useQuery({
    queryKey: ['life-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('life_categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      return data as LifeCategory[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}