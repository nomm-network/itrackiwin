import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UpsertMentorPayload {
  id?: string;
  user_id: string;
  mentor_type: 'mentor' | 'coach';
  primary_category_id?: string;
  is_public?: boolean;
  display_name?: string;
  bio?: string;
  hourly_rate?: number;
}

export const useUpsertMentor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: UpsertMentorPayload) => {
      const { data, error } = await supabase.rpc('admin_upsert_mentor', {
        p_payload: payload as any
      });

      if (error) {
        console.error('Error upserting mentor:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch mentors list
      queryClient.invalidateQueries({ queryKey: ['admin', 'mentors'] });
      
      // If we got an ID back, invalidate that specific mentor
      if (data && data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['admin', 'mentor', data[0].id] });
      }

      toast({
        title: "Success",
        description: "Mentor saved successfully",
      });
    },
    onError: (error: any) => {
      console.error('Mentor upsert error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save mentor",
        variant: "destructive",
      });
    },
  });
};