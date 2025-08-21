import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fitnessKeys } from '@/shared/lib/queryKeys';

interface ActiveTemplate {
  id: string;
  template_id: string;
  template_name: string;
  order_index: number;
  is_active: boolean;
  last_done_at: string | null;
  notes: string | null;
}

export const useTemplateRotation = () => {
  const queryClient = useQueryClient();

  const { data: activeTemplates = [], isLoading } = useQuery({
    queryKey: fitnessKeys.gym.rotation(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_active_templates')
        .select(`
          *,
          workout_templates!inner (
            name
          )
        `)
        .eq('user_id', user.id)
        .order('order_index');

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.id,
        template_id: item.template_id,
        template_name: item.workout_templates.name,
        order_index: item.order_index,
        is_active: item.is_active,
        last_done_at: item.last_done_at,
        notes: item.notes,
      })) as ActiveTemplate[];
    },
  });

  const reorderTemplates = useMutation({
    mutationFn: async (reorderedTemplates: ActiveTemplate[]) => {
      const updates = reorderedTemplates.map((template, index) => ({
        id: template.id,
        order_index: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('user_active_templates')
          .update({ order_index: update.order_index })
          .eq('id', update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fitnessKeys.gym.rotation() });
    },
  });

  const toggleTemplateActive = useMutation({
    mutationFn: async (templateId: string) => {
      const template = activeTemplates.find(t => t.id === templateId);
      if (!template) throw new Error('Template not found');

      const { error } = await supabase
        .from('user_active_templates')
        .update({ is_active: !template.is_active })
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fitnessKeys.gym.rotation() });
    },
  });

  const markAsNextTemplate = useMutation({
    mutationFn: async (templateId: string) => {
      // Set last_done_at to a very old date to make it the next in rotation
      const { error } = await supabase
        .from('user_active_templates')
        .update({ last_done_at: '1970-01-01T00:00:00Z' })
        .eq('id', templateId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fitnessKeys.gym.rotation() });
    },
  });

  return {
    activeTemplates,
    isLoading,
    reorderTemplates: reorderTemplates.mutateAsync,
    toggleTemplateActive: toggleTemplateActive.mutateAsync,
    markAsNextTemplate: markAsNextTemplate.mutateAsync,
  };
};