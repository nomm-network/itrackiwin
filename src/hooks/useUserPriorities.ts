import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserPriority {
  category_id: string;
  slug: string;
  name: string;
  icon: string;
  priority_rank: number;
}

export function useUserPriorities() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-priorities', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('user_priorities' as any, { u: user.id });
      if (error) throw error;
      return data as UserPriority[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}