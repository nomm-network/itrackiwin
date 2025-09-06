import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDeleteMentor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc('admin_delete_mentor', {
        p_id: id
      });

      if (error) {
        console.error('Error deleting mentor:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Mentor not found or could not be deleted');
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate mentors list
      queryClient.invalidateQueries({ queryKey: ['admin', 'mentors'] });

      toast({
        title: "Success",
        description: "Mentor deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Mentor delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete mentor",
        variant: "destructive",
      });
    },
  });
};