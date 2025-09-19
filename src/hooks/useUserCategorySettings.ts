import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserCategorySetting {
  id: string;
  user_id: string;
  category_id: string;
  selected_coach_id?: string;
  is_enabled: boolean;
  nav_pinned: boolean;
  priority_rank?: number;
  category?: {
    id: string;
    slug: string;
    name: string;
    icon?: string;
  };
}

export function useUserCategorySettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const categorySettingsQuery = useQuery({
    queryKey: ['user-category-settings', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_category_settings')
        .select(`
          *,
          category:life_categories(id, slug, name, icon)
        `)
        .eq('user_id', user.id)
        .order('priority_rank');

      if (error) throw error;
      return data as UserCategorySetting[];
    },
    enabled: !!user,
  });

  const updateCategorySettingMutation = useMutation({
    mutationFn: async (params: {
      categoryId: string;
      updates: Partial<Pick<UserCategorySetting, 'nav_pinned' | 'is_enabled' | 'selected_coach_id' | 'priority_rank'>>;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_category_settings')
        .upsert({
          user_id: user.id,
          category_id: params.categoryId,
          ...params.updates,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-category-settings'] });
      queryClient.invalidateQueries({ queryKey: ['bottom-nav'] });
    },
  });

  const toggleNavPinMutation = useMutation({
    mutationFn: async (params: { categoryId: string; pinned: boolean }) => {
      return updateCategorySettingMutation.mutateAsync({
        categoryId: params.categoryId,
        updates: {
          nav_pinned: params.pinned,
          is_enabled: params.pinned, // Also enable when pinning
        },
      });
    },
  });

  return {
    categorySettings: categorySettingsQuery.data || [],
    isLoading: categorySettingsQuery.isLoading,
    error: categorySettingsQuery.error,
    updateCategorySetting: updateCategorySettingMutation.mutateAsync,
    toggleNavPin: toggleNavPinMutation.mutateAsync,
    isUpdating: updateCategorySettingMutation.isPending || toggleNavPinMutation.isPending,
  };
}