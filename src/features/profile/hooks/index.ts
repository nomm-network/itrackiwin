// Profile hooks using auth
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      return user.user;
    },
    staleTime: 300000,
  });
};