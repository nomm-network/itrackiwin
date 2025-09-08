import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useFavoriteTemplate = (templateId?: string) => {
  return useQuery({
    queryKey: ['favorite-template', templateId],
    queryFn: async () => {
      if (!templateId) return false;
      
      const { data, error } = await supabase
        .from('user_favorite_templates')
        .select('template_id')
        .eq('template_id', templateId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!templateId
  });
};

export const useToggleFavoriteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ templateId, isFavorite }: { templateId: string; isFavorite: boolean }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('user_favorite_templates')
          .delete()
          .eq('template_id', templateId)
          .eq('user_id', user.user.id);
        
        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('user_favorite_templates')
          .insert({
            template_id: templateId,
            user_id: user.user.id
          });
        
        if (error) throw error;
      }
      
      return !isFavorite;
    },
    onSuccess: (newFavoriteState, variables) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-template', variables.templateId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] }); // For Training Center
      
      toast.success(
        newFavoriteState 
          ? 'Added to favorites' 
          : 'Removed from favorites'
      );
    },
    onError: () => {
      toast.error('Failed to update favorite status');
    }
  });
};