import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleReaction, getUserReactionForPost, fetchPostMeta } from '@/features/social/lib/api';
import { toast } from 'sonner';
import { EmojiPicker } from './EmojiPicker';

interface ReactionBarProps {
  post: { 
    id: string; 
  };
}

export const ReactionBar: React.FC<ReactionBarProps> = ({ post }) => {
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [commentsCount, setCommentsCount] = useState(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reaction, meta] = await Promise.all([
          getUserReactionForPost(post.id),
          fetchPostMeta(post.id)
        ]);
        setUserReaction(reaction);
        setReactionCounts(meta.counts);
        setCommentsCount(meta.commentsCount);
      } catch (error) {
        console.error('Error fetching reaction data:', error);
      }
    };
    fetchData();
  }, [post.id]);

  const reactionMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      await toggleReaction(post.id, reactionType as any);
    },
    onSuccess: async () => {
      const [newReaction, meta] = await Promise.all([
        getUserReactionForPost(post.id),
        fetchPostMeta(post.id)
      ]);
      setUserReaction(newReaction);
      setReactionCounts(meta.counts);
      setCommentsCount(meta.commentsCount);
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
    onError: (error) => {
      console.error('Error updating reaction:', error);
      toast.error('Failed to update reaction');
    }
  });

  const handleReaction = (reactionType: string) => {
    reactionMutation.mutate(reactionType);
  };

  return (
    <div className="flex items-center justify-between">
      <EmojiPicker 
        onSelect={handleReaction}
        currentReaction={userReaction}
        counts={reactionCounts}
      />
      {commentsCount > 0 && (
        <span className="text-sm text-muted-foreground">
          {commentsCount} comment{commentsCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
};