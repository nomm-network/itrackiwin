import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UpsertPayload = {
  id?: string;                 // omit for new
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
      // If your RPC name differs, change it here:
      const { data, error } = await supabase.rpc('admin_upsert_mentor', {
        p_payload: payload
      });
      if (error) throw error;
      return data as { id: string }[];
    },
    onSuccess: () => {
      toast.success('Mentor saved');
      qc.invalidateQueries({ queryKey: ['admin','mentors'] });
    },
    onError: (e: any) => {
      console.error('[admin_upsert_mentor]', e);
      toast.error(e?.message ?? 'Failed to save mentor');
    }
  });
}