import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDeleteMentor() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (mentorId: string) => {
      console.log('🔍 [useDeleteMentor] Deleting mentor:', mentorId);
      const { error } = await supabase.rpc('admin_delete_mentor', { p_id: mentorId });
      if (error) {
        console.error('❌ [useDeleteMentor] Error:', error);
        throw error;
      }
      console.log('✅ [useDeleteMentor] Success');
      return true;
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