import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type UpsertPayload = {
  id?: string | null;
  user_id: string;
  mentor_type: 'mentor' | 'coach';
  primary_category_id?: string | null;
  is_active?: boolean;
  bio?: string | null;
  hourly_rate?: number | null;
};

export function useUpsertMentor() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertPayload) => {
      console.log('🔍 [useUpsertMentor] Calling admin_upsert_mentor...', payload);
      const { data, error } = await supabase.rpc('admin_upsert_mentor', {
        p_payload: payload
      });
      if (error) {
        console.error('❌ [useUpsertMentor] Error:', error);
        throw error;
      }
      console.log('✅ [useUpsertMentor] Success:', data);
      return data as string;
    },
    onSuccess: () => {
      toast({ title: 'Mentor saved successfully' });
      qc.invalidateQueries({ queryKey: ['admin','mentors'] });
    },
    onError: (e: any) => {
      console.error('[admin_upsert_mentor] Error:', e);
      toast({ title: 'Failed to save mentor', description: e?.message, variant: 'destructive' });
    }
  });
}