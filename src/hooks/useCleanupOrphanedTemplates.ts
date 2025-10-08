import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CleanupResult {
  success: boolean;
  deleted_count: number;
  orphaned_template_ids: string[];
}

export function useCleanupOrphanedTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('cleanup_orphaned_templates', {
        p_user_id: user.user.id
      });

      if (error) throw error;
      return data as unknown as CleanupResult;
    },
    onSuccess: (data) => {
      toast({
        title: 'Cleanup Complete',
        description: `Removed ${data.deleted_count} orphaned template${data.deleted_count !== 1 ? 's' : ''}`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['workout-templates'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cleanup templates',
        variant: 'destructive',
      });
    }
  });
}
