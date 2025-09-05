import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Template = { 
  id: string; 
  name: string | null;
  is_favorite?: boolean;
};

type TemplatesResult = {
  favorites: Template[];
  allCount: number;
};

type UseTemplatesOptions = {
  onlyFavorites?: boolean;
};

export const useTemplates = (options: UseTemplatesOptions = {}) => {
  return useQuery({
    queryKey: ['training', 'templates', options],
    queryFn: async (): Promise<TemplatesResult> => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      if (options.onlyFavorites) {
        // Get only favorite templates
        const { data, error } = await supabase
          .from('user_favorite_templates')
          .select(`
            template_id,
            workout_templates!inner(id, name, is_public)
          `)
          .eq('user_id', user.user.id)
          .order('created_at', { ascending: false })
          .limit(5); // Max 5 favorites for Training Center

        if (error) throw error;

        const favorites = data?.map(item => ({
          id: item.workout_templates.id,
          name: item.workout_templates.name,
          is_favorite: true
        })) ?? [];

        return { favorites, allCount: 0 };
      }

      // Get all templates with favorite status
      const { data: templates, error: templatesError } = await supabase
        .from('workout_templates')
        .select('id, name, is_public, user_id')
        .or(`is_public.eq.true,user_id.eq.${user.user.id}`)
        .order('name', { ascending: true });

      if (templatesError) throw templatesError;

      // Get user's favorites
      const { data: favoriteData, error: favError } = await supabase
        .from('user_favorite_templates')
        .select('template_id')
        .eq('user_id', user.user.id);

      if (favError) throw favError;

      const favoriteIds = new Set(favoriteData?.map(f => f.template_id) ?? []);

      const templatesWithFavorites = templates?.map(template => ({
        id: template.id,
        name: template.name,
        is_favorite: favoriteIds.has(template.id)
      })) ?? [];

      const favorites = templatesWithFavorites.filter(t => t.is_favorite);

      return { favorites, allCount: templatesWithFavorites.length };
    },
    staleTime: 60_000,
  });
};

export const useFavoriteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, isFavorite }: { templateId: string; isFavorite: boolean }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      if (isFavorite) {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorite_templates')
          .insert({ user_id: user.user.id, template_id: templateId });
        
        if (error) throw error;
      } else {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorite_templates')
          .delete()
          .eq('user_id', user.user.id)
          .eq('template_id', templateId);
        
        if (error) throw error;
      }
    },
    onSuccess: (_, { isFavorite }) => {
      // Invalidate all template queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['training', 'templates'] });
      toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
    },
    onError: (error) => {
      console.error('Error updating favorite:', error);
      toast.error('Failed to update favorite');
    }
  });
};