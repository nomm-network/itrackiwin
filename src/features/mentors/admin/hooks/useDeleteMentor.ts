import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDeleteMentor() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🔍 [useDeleteMentor] Calling admin_delete_mentor...', id);
      const { data, error } = await supabase.rpc('admin_delete_mentor', {
        p_id: id
      });
      if (error) {
        console.error('❌ [useDeleteMentor] Error:', error);
        throw error;
      }
      console.log('✅ [useDeleteMentor] Success:', data);
      return data as boolean;
    },
    onSuccess: () => {
      toast({ title: 'Mentor deleted successfully' });
      qc.invalidateQueries({ queryKey: ['admin','mentors'] });
    },
    onError: (e: any) => {
      console.error('[admin_delete_mentor] Error:', e);
      toast({ title: 'Failed to delete mentor', description: e?.message, variant: 'destructive' });
    }
  });
}