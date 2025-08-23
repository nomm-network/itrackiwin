// Re-export existing gym hooks if available
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMyGym = () => {
  return useQuery({
    queryKey: ['my-gym'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      
      // Simplified gym lookup
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .limit(1);
      
      if (error) return null;
      return data?.[0] || null;
    },
    staleTime: 300000,
  });
};