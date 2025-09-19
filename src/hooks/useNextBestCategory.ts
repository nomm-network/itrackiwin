import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface NextBestCategory {
  slug: string;
  name: string;
}

export function useNextBestCategory() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['next-best-category', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('next_best_category' as any, { u: user.id });
      if (error) throw error;
      return data?.[0] ?? null as NextBestCategory | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}