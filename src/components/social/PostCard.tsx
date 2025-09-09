import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ReactionBar } from './ReactionBar';
import { Trash2, MessageCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost, addComment, fetchComments, getUserProfile } from '@/features/social/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: {
    id: string;
    author_id: string;
    body: string;
    visibility: string;
    like_count: number;
    comment_count: number;
    created_at: string;
  };
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwnPost = user?.id === post.author_id;
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [authorNickname, setAuthorNickname] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
        const profile = await getUserProfile(post.author_id);
        setAuthorNickname(profile?.nickname || null);
      } catch (error) {
        console.error('Error fetching author profile:', error);
      }
    };
    fetchAuthorProfile();
  }, [post.author_id]);

  useEffect(() => {
    if (showComments) {
      const loadComments = async () => {
        try {
          const commentsData = await fetchComments(post.id);
          setComments(commentsData);
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      };
      loadComments();
    }
  }, [showComments, post.id]);

  const deletePostMutation = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      toast.success('Post deleted');
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
    onError: (error) => {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await addComment(post.id, comment.trim());
      if (error) throw error;
    },
    onSuccess: async () => {
      setComment('');
      setCommentError(null);
      const commentsData = await fetchComments(post.id);
      setComments(commentsData);
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
    onError: (error: any) => {
      console.error('Error adding comment:', error);
      if (error.message.includes('policy')) {
        setCommentError('Only friends can comment on this post.');
      } else {
        setCommentError('Failed to add comment');
      }
    }
  });

  const getAuthorInitials = (authorId: string) => {
    return authorId.slice(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (authorNickname) return authorNickname;
    return `User ${post.author_id.slice(-4)}`;
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return '🌍';
      case 'friends': return '👥';
      case 'private': return '🔒';
      default: return '👥';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getAuthorInitials(post.author_id)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{getDisplayName()}</p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                <span>{getVisibilityIcon(post.visibility)}</span>
              </div>
            </div>
          </div>
          {isOwnPost && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deletePostMutation.mutate()}
              disabled={deletePostMutation.isPending}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>
        
        <div className="flex items-center justify-between">
          <ReactionBar post={post} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Comments
          </Button>
        </div>

        {showComments && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Comment (friends only)..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && comment.trim()) {
                    e.preventDefault();
                    commentMutation.mutate();
                  }
                }}
              />
              <Button 
                onClick={() => commentMutation.mutate()}
                disabled={!comment.trim() || commentMutation.isPending}
                size="sm"
              >
                Reply
              </Button>
            </div>
            
            {commentError && (
              <p className="text-sm text-destructive">{commentError}</p>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm bg-muted p-2 rounded">
                  <div className="font-medium text-xs text-muted-foreground mb-1">
                    User {comment.user_id.slice(-4)} • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </div>
                  <p>{comment.body}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};