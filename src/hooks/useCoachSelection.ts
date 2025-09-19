import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CoachForCategory {
  coach_id: string;
  display_name: string;
  type: 'ai' | 'human';
  is_default: boolean;
  selected: boolean;
  has_access: boolean;
  price_cents: number;
  avatar_url?: string;
}

export function useCoachesForCategory(categorySlug: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['coaches-for-category', user?.id, categorySlug],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('coaches_for_category' as any, {
        u: user.id,
        cat_slug: categorySlug
      });

      if (error) throw error;
      return data as CoachForCategory[];
    },
    enabled: !!user && !!categorySlug,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSelectCoach() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      categoryId: string;
      coachId: string | null; // null = default coach
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_category_prefs')
        .upsert({
          user_id: user.id,
          category_id: params.categoryId,
          selected_coach_id: params.coachId,
          is_enabled: true,
          nav_pinned: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-category-prefs'] });
      queryClient.invalidateQueries({ queryKey: ['bottom-nav'] });
      queryClient.invalidateQueries({ queryKey: ['coaches-for-category'] });
    },
  });
}