import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDeleteMentor() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // If your RPC name differs, change it here:
      const { data, error } = await supabase.rpc('admin_delete_mentor', {
        p_id: id
      });
      if (error) throw error;
      return data as boolean;
    },
    onSuccess: () => {
      toast.success('Mentor deleted');
      qc.invalidateQueries({ queryKey: ['admin','mentors'] });
    },
    onError: (e: any) => {
      console.error('[admin_delete_mentor]', e);
      toast.error(e?.message ?? 'Failed to delete mentor');
    }
  });
}