import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactToPost, removeReaction, getUserReactionForPost } from '@/features/social/lib/api';
import { toast } from 'sonner';

const EMOJIS = ['💪', '👏', '👌', '🔥', '❤️', '🥂', '👍'] as const;

interface ReactionBarProps {
  post: { 
    id: string; 
    like_count: number; 
  };
}

export const ReactionBar: React.FC<ReactionBarProps> = ({ post }) => {
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUserReaction = async () => {
      try {
        const reaction = await getUserReactionForPost(post.id);
        setUserReaction(reaction);
      } catch (error) {
        console.error('Error fetching user reaction:', error);
      }
    };
    fetchUserReaction();
  }, [post.id]);

  const reactionMutation = useMutation({
    mutationFn: async ({ emoji, shouldRemove }: { emoji: string; shouldRemove: boolean }) => {
      if (shouldRemove) {
        await removeReaction(post.id);
      } else {
        await reactToPost(post.id, emoji);
      }
    },
    onSuccess: (_, { emoji, shouldRemove }) => {
      setUserReaction(shouldRemove ? null : emoji);
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
    onError: (error) => {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    }
  });

  const handleReaction = (emoji: string) => {
    const shouldRemove = userReaction === emoji;
    reactionMutation.mutate({ emoji, shouldRemove });
  };

  return (
    <div className="flex items-center gap-1">
      {EMOJIS.map((emoji) => (
        <Button
          key={emoji}
          variant={userReaction === emoji ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleReaction(emoji)}
          disabled={reactionMutation.isPending}
          className="h-8 w-8 p-0 text-lg hover:scale-110 transition-transform"
        >
          {emoji}
        </Button>
      ))}
      {post.like_count > 0 && (
        <span className="text-sm text-muted-foreground ml-2">
          {post.like_count} reaction{post.like_count !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};