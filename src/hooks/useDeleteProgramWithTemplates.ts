import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DeleteResult {
  success: boolean;
  deleted_templates: number;
}

export function useDeleteProgramWithTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (programId: string) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('delete_program_with_templates', {
        p_program_id: programId,
        p_user_id: user.user.id
      });

      if (error) throw error;
      return data as unknown as DeleteResult;
    },
    onSuccess: (data) => {
      const message = data.deleted_templates > 0
        ? `Program and ${data.deleted_templates} template${data.deleted_templates > 1 ? 's' : ''} deleted`
        : 'Program deleted';
      
      toast({
        title: 'Success',
        description: message,
      });
      
      queryClient.invalidateQueries({ queryKey: ['training-programs'] });
      queryClient.invalidateQueries({ queryKey: ['ai-programs'] });
      queryClient.invalidateQueries({ queryKey: ['next-program-block'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete program',
        variant: 'destructive',
      });
    }
  });
}
