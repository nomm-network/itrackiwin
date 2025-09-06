import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AdminUser = {
  user_id: string;
  email: string;
  created_at: string;
  roles?: string[];
  is_pro?: boolean;
};

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users-simple'],
    queryFn: async (): Promise<AdminUser[]> => {
      console.log('🔍 [useAdminUsers] Calling admin_get_users_overview...');
      const { data, error } = await supabase.rpc('admin_get_users_overview');
      if (error) {
        console.error('❌ [useAdminUsers] Error:', error);
        throw error;
      }
      console.log('✅ [useAdminUsers] Success:', data);
      return data as AdminUser[];
    }
  });
};