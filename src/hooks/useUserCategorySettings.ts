import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserCategoryPreference {
  id: string;
  user_id: string;
  category_id: string;
  display_order: number;
  selected_coach_id?: string;
  is_enabled: boolean;
  nav_pinned: boolean;
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
    queryKey: ['user-category-prefs', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_category_prefs')
        .select(`
          *,
          category:life_categories(id, slug, name, icon)
        `)
        .eq('user_id', user.id)
        .order('display_order');

      if (error) throw error;
      return data as UserCategoryPreference[];
    },
    enabled: !!user,
  });

  const updateCategorySettingMutation = useMutation({
    mutationFn: async (params: {
      categoryId: string;
      updates: Partial<Pick<UserCategoryPreference, 'nav_pinned' | 'is_enabled' | 'selected_coach_id' | 'display_order'>>;
    }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_category_prefs')
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
      queryClient.invalidateQueries({ queryKey: ['user-category-prefs'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-category-prefs'] });
      queryClient.invalidateQueries({ queryKey: ['bottom-nav'] });
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