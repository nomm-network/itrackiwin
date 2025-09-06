import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSetCoach = () => {
  const qc = useQueryClient();
  
  return useMutation({
    mutationFn: async (p: { userId: string; lifeCategoryId: string; isCoach: boolean }) => {
      const { data, error } = await supabase.rpc('admin_set_coach', {
        p_user_id: p.userId,
        p_life_category_id: p.lifeCategoryId,
        p_is_coach: p.isCoach
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user'] });
    }
  });
};