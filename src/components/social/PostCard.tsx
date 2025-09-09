import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ReactionBar } from './ReactionBar';
import { Trash2, MessageCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePost, getUserProfile, fetchPostMeta } from '@/features/social/lib/api';
import { CommentSection } from './CommentSection';
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
    image_url?: string;
  };
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwnPost = user?.id === post.author_id;
  const [showComments, setShowComments] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<{nickname: string; avatar_url?: string} | null>(null);
  const [commentCount, setCommentCount] = useState(post.comment_count);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      try {
        const profile = await getUserProfile(post.author_id);
        setAuthorProfile(profile);
      } catch (error) {
        console.error('Error fetching author profile:', error);
      }
    };
    fetchAuthorProfile();

    const fetchCommentCount = async () => {
      try {
        const meta = await fetchPostMeta(post.id);
        setCommentCount(meta.commentsCount);
      } catch (error) {
        console.error('Error fetching comment count:', error);
      }
    };
    fetchCommentCount();
  }, [post.author_id, post.id]);

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


  const getAuthorInitials = (authorId: string) => {
    return authorId.slice(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (authorProfile?.nickname) return authorProfile.nickname;
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
              <AvatarImage src={authorProfile?.avatar_url} />
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
        
        {post.image_url && (
          <div className="mt-3">
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full max-h-96 object-cover rounded-lg"
            />
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <ReactionBar post={post} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="text-muted-foreground hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Comments ({commentCount})
          </Button>
        </div>

        {showComments && (
          <CommentSection postId={post.id} onCommentAdded={() => {
            fetchPostMeta(post.id).then(meta => setCommentCount(meta.commentsCount));
          }} />
        )}
      </CardContent>
    </Card>
  );
};