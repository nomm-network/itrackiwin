import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const useSocialShare = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const shareWorkout = useCallback(async (workoutId: string, caption?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to share workouts",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('workout_shares')
        .insert({
          user_id: user.id,
          workout_id: workoutId,
          caption: caption || "Check out my workout! 💪",
          is_public: true
        });

      if (error) throw error;

      toast({
        title: "Workout Shared!",
        description: "Your workout has been shared with the community"
      });

      // Invalidate queries to refresh the social feed
      queryClient.invalidateQueries({ queryKey: ['workout_shares'] });

    } catch (error) {
      console.error('Error sharing workout:', error);
      toast({
        title: "Share Failed",
        description: "Failed to share workout. Please try again.",
        variant: "destructive"
      });
    }
  }, [queryClient, toast]);

  const likeWorkoutShare = useCallback(async (shareId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('workout_likes')
        .select('id')
        .eq('workout_share_id', shareId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('workout_likes')
          .delete()
          .eq('id', existingLike.id);

        // Decrement likes count (using direct update)
        const { data: currentShare } = await supabase
          .from('workout_shares')
          .select('likes_count')
          .eq('id', shareId)
          .single();
        
        if (currentShare) {
          await supabase
            .from('workout_shares')
            .update({ likes_count: Math.max(0, (currentShare.likes_count || 0) - 1) })
            .eq('id', shareId);
        }
      } else {
        // Like
        await supabase
          .from('workout_likes')
          .insert({
            workout_share_id: shareId,
            user_id: user.id
          });

        // Increment likes count (using direct update)
        const { data: currentShare } = await supabase
          .from('workout_shares')
          .select('likes_count')
          .eq('id', shareId)
          .single();
        
        if (currentShare) {
          await supabase
            .from('workout_shares')
            .update({ likes_count: (currentShare.likes_count || 0) + 1 })
            .eq('id', shareId);
        }
      }

      // Refresh the social feed
      queryClient.invalidateQueries({ queryKey: ['workout_shares'] });

    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }, [queryClient]);

  const commentOnShare = useCallback(async (shareId: string, content: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('workout_comments')
        .insert({
          workout_share_id: shareId,
          user_id: user.id,
          content
        });

      if (error) throw error;

      // Increment comments count (using direct update)
      const { data: currentShare } = await supabase
        .from('workout_shares')
        .select('comments_count')
        .eq('id', shareId)
        .single();
      
      if (currentShare) {
        await supabase
          .from('workout_shares')
          .update({ comments_count: (currentShare.comments_count || 0) + 1 })
          .eq('id', shareId);
      }

      // Refresh comments and social feed
      queryClient.invalidateQueries({ queryKey: ['workout_comments', shareId] });
      queryClient.invalidateQueries({ queryKey: ['workout_shares'] });

      toast({
        title: "Comment Added",
        description: "Your comment has been posted"
      });

    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Comment Failed",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    }
  }, [queryClient, toast]);

  return {
    shareWorkout,
    likeWorkoutShare,
    commentOnShare
  };
};