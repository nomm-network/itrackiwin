import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminUser = (userId?: string) => {
  return useQuery({
    enabled: !!userId,
    queryKey: ['admin-user', userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_users_overview');
      if (error) throw error;
      
      const user = data.find((u: any) => u.user_id === userId);
      if (!user) throw new Error('User not found');
      
      return user;
    }
  });
};