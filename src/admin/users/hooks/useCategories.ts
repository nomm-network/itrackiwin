import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useCategories = () => {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_categories');
      if (error) throw error;
      return data;
    }
  });
};