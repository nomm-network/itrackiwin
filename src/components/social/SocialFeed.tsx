import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface WorkoutShare {
  id: string;
  user_id: string;
  workout_id: string;
  caption: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    display_name: string;
    username: string;
    avatar_url: string;
  };
  workouts: {
    started_at: string;
    ended_at: string;
  };
}

interface WorkoutComment {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string;
    username: string;
    avatar_url: string;
  };
}

export const SocialFeed: React.FC = () => {
  const [shares, setShares] = useState<WorkoutShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, WorkoutComment[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_shares')
        .select(`
          *,
          profiles!workout_shares_user_id_fkey(display_name, username, avatar_url),
          workouts!workout_shares_workout_id_fkey(started_at, ended_at)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setShares((data as any) || []);
    } catch (error) {
      console.error('Error fetching shares:', error);
      toast({
        title: "Error",
        description: "Failed to load social feed",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (shareId: string) => {
    try {
      const { data, error } = await supabase
        .from('workout_comments')
        .select(`
          *,
          profiles!workout_comments_user_id_fkey(display_name, username, avatar_url)
        `)
        .eq('workout_share_id', shareId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(prev => ({ ...prev, [shareId]: (data as any) || [] }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const toggleLike = async (shareId: string) => {
    try {
      const { data, error } = await supabase.rpc('toggle_workout_like', {
        share_id: shareId
      });

      if (error) throw error;

      // Update local state
      setShares(prev => prev.map(share => 
        share.id === shareId 
          ? { 
              ...share, 
              likes_count: data ? share.likes_count + 1 : share.likes_count - 1 
            }
          : share
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const addComment = async (shareId: string) => {
    const content = commentInputs[shareId]?.trim();
    if (!content) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('workout_comments')
        .insert({
          workout_share_id: shareId,
          user_id: user.id,
          content
        });

      if (error) throw error;

      setCommentInputs(prev => ({ ...prev, [shareId]: '' }));
      fetchComments(shareId);
      
      // Update comments count
      setShares(prev => prev.map(share => 
        share.id === shareId 
          ? { ...share, comments_count: share.comments_count + 1 }
          : share
      ));
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
    }
  };

  const toggleComments = (shareId: string) => {
    const isVisible = showComments[shareId];
    setShowComments(prev => ({ ...prev, [shareId]: !isVisible }));
    
    if (!isVisible && !comments[shareId]) {
      fetchComments(shareId);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {shares.map((share) => (
        <Card key={share.id} className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={share.profiles?.avatar_url} />
                  <AvatarFallback>
                    {share.profiles?.display_name?.[0] || share.profiles?.username?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">
                    {share.profiles?.display_name || share.profiles?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(share.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Completed a workout</p>
              {share.caption && (
                <p className="text-sm text-muted-foreground">{share.caption}</p>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                Duration: {share.workouts?.started_at && share.workouts?.ended_at ? 
                  Math.round((new Date(share.workouts.ended_at).getTime() - new Date(share.workouts.started_at).getTime()) / (1000 * 60)) + ' minutes'
                  : 'Unknown'
                }
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLike(share.id)}
                  className="flex items-center space-x-1"
                >
                  <Heart className="h-4 w-4" />
                  <span className="text-xs">{share.likes_count}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleComments(share.id)}
                  className="flex items-center space-x-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">{share.comments_count}</span>
                </Button>
                
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showComments[share.id] && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentInputs[share.id] || ''}
                    onChange={(e) => setCommentInputs(prev => ({ 
                      ...prev, 
                      [share.id]: e.target.value 
                    }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addComment(share.id);
                      }
                    }}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => addComment(share.id)}
                    disabled={!commentInputs[share.id]?.trim()}
                  >
                    Post
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {comments[share.id]?.map((comment) => (
                    <div key={comment.id} className="flex space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.profiles?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {comment.profiles?.display_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-muted rounded-lg px-3 py-2">
                          <p className="font-semibold text-xs">
                            {comment.profiles?.display_name || comment.profiles?.username}
                          </p>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};