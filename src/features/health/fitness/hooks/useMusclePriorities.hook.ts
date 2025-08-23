import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface MusclePriority {
  id: string;
  user_id: string;
  muscle_id: string;
  priority_level: number;
  created_at: string;
}

export interface MusclePriorityWithName extends MusclePriority {
  muscle_name: string;
  muscle_slug: string;
}

export const useMusclePriorities = () => {
  return useQuery({
    queryKey: ['muscle-priorities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_muscle_priorities')
        .select(`
          *,
          muscle_groups!inner(
            slug,
            muscle_groups_translations!inner(name)
          )
        `)
        .eq('user_id', user.id)
        .eq('muscle_groups.muscle_groups_translations.language_code', 'en')
        .order('priority_level');

      if (error) throw error;

      return data.map((mp: any) => ({
        id: mp.id,
        user_id: mp.user_id,
        muscle_id: mp.muscle_id,
        priority_level: mp.priority_level,
        created_at: mp.created_at,
        muscle_name: mp.muscle_groups.muscle_groups_translations[0]?.name || mp.muscle_groups.slug,
        muscle_slug: mp.muscle_groups.slug
      })) as MusclePriorityWithName[];
    }
  });
};

export const useUpsertMusclePriorities = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (priorities: { muscle_id: string; priority_level: number }[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, delete existing priorities
      await supabase
        .from('user_muscle_priorities')
        .delete()
        .eq('user_id', user.id);

      // Then insert new priorities
      if (priorities.length > 0) {
        const { data, error } = await supabase
          .from('user_muscle_priorities')
          .insert(
            priorities.map(p => ({
              user_id: user.id,
              muscle_id: p.muscle_id,
              priority_level: p.priority_level
            }))
          )
          .select();

        if (error) throw error;
        return data;
      }

      return [];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['muscle-priorities'] });
      toast({
        title: "Muscle Priorities Updated",
        description: "Your muscle group priorities have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating muscle priorities:', error);
      toast({
        title: "Error",
        description: "Failed to update muscle priorities. Please try again.",
        variant: "destructive",
      });
    }
  });
};