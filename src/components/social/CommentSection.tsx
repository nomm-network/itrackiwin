import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchComments, addComment, fetchCommentMeta, toggleCommentReaction, addCommentReply, fetchCommentReplies, getUserProfile } from '@/features/social/lib/api';
import { ReactionBar } from './ReactionBar';
import { MessageCircle, Reply } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  author?: { nickname: string; avatar_url?: string } | null;
}

interface CommentReply {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  replied_to_user_id: string | null;
  author?: { nickname: string; avatar_url?: string } | null;
  replied_to_user?: { nickname: string } | null;
}

interface CommentItemProps {
  comment: Comment;
  isFirst?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, isFirst = false }) => {
  const [meta, setMeta] = useState<{counts: Record<string, number>, repliesCount: number}>({counts:{}, repliesCount:0});
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<CommentReply[]>([]);
  const [showReplies, setShowReplies] = useState(isFirst);
  const [replyReactions, setReplyReactions] = useState<Record<string, {counts: Record<string, number>}>>({});
  const [authorProfile, setAuthorProfile] = useState<{nickname: string; avatar_url?: string} | null>(null);

  useEffect(() => {
    fetchCommentMeta(comment.id).then(setMeta);
    getUserProfile(comment.user_id).then(setAuthorProfile);
  }, [comment.id, comment.user_id]);

  const handleReaction = async (kind: string) => {
    await toggleCommentReaction(comment.id, kind);
    setMeta(await fetchCommentMeta(comment.id));
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    await addCommentReply(comment.id, replyText);
    setReplyText('');
    setShowReplyInput(false);
    setMeta(await fetchCommentMeta(comment.id));
    
    if (showReplies) {
      const newReplies = await fetchCommentReplies(comment.id);
      setReplies(newReplies as any);
    }
  };

  const loadReplies = async () => {
    if (!showReplies) {
      const newReplies = await fetchCommentReplies(comment.id);
      setReplies(newReplies as any);
      // Load reaction counts for all replies
      const reactionPromises = newReplies.map(async (reply: any) => {
        const replyMeta = await fetchCommentMeta(reply.id);
        return { id: reply.id, meta: replyMeta };
      });
      const replyReactionsData = await Promise.all(reactionPromises);
      const reactionMap: Record<string, {counts: Record<string, number>}> = {};
      replyReactionsData.forEach(({ id, meta }) => {
        reactionMap[id] = { counts: meta.counts };
      });
      setReplyReactions(reactionMap);
    }
    setShowReplies(!showReplies);
  };

  const handleReplyReaction = async (replyId: string, kind: string) => {
    await toggleCommentReaction(replyId, kind);
    const updatedMeta = await fetchCommentMeta(replyId);
    setReplyReactions(prev => ({
      ...prev,
      [replyId]: { counts: updatedMeta.counts }
    }));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm">
              {authorProfile?.nickname || 'Anonymous'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-sm mt-1">{comment.body}</p>
          
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" onClick={() => handleReaction('like')} className="h-6 px-1 text-xs">
                👍 {meta.counts.like || 0}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleReaction('heart')} className="h-6 px-1 text-xs">
                ❤️ {meta.counts.heart || 0}
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="h-auto p-1 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>

            {meta.repliesCount > 0 && !showReplies && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadReplies}
                className="h-auto p-1 text-xs"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Show {meta.repliesCount} replies
              </Button>
            )}
          </div>

          {showReplyInput && (
            <div className="flex space-x-2 mt-2">
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="text-sm"
              />
              <Button onClick={handleReply} size="sm" disabled={!replyText.trim()}>
                Reply
              </Button>
            </div>
          )}

          {showReplies && replies.length > 0 && (
            <div className="ml-6 mt-3 space-y-2 border-l-2 border-muted pl-4">
              {replies.slice(0, 3).map((reply) => (
                <div key={reply.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {reply.author?.nickname || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleReplyReaction(reply.id, 'heart')} 
                      className="h-6 px-1 text-xs"
                    >
                      ❤️ {replyReactions[reply.id]?.counts?.heart || 0}
                    </Button>
                  </div>
                  <p className="text-sm">
                    {reply.replied_to_user && (
                      <span className="text-primary">@{reply.replied_to_user.nickname} </span>
                    )}
                    {reply.body}
                  </p>
                </div>
              ))}
              
              {meta.repliesCount > 0 && (
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplies(false)}
                    className="h-auto p-1 text-xs text-muted-foreground"
                  >
                    Hide replies
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CommentSectionProps {
  postId: string;
  onCommentAdded?: () => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCommentAdded }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const data = await fetchComments(postId);
      // Fetch author profiles for each comment
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment: any) => {
          try {
            const profile = await getUserProfile(comment.user_id);
            return { ...comment, author: profile };
          } catch {
            return { ...comment, author: null };
          }
        })
      );
      setComments(commentsWithProfiles as Comment[]);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      await addComment(postId, newComment.trim());
      setNewComment('');
      await loadComments();
      onCommentAdded?.();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment... (friends only)"
          className="flex-1"
        />
        <Button 
          onClick={handleAddComment} 
          disabled={!newComment.trim() || loading}
        >
          {loading ? 'Adding...' : 'Comment'}
        </Button>
      </div>

      <div className="space-y-4">
        {comments.map((comment, index) => (
          <CommentItem key={comment.id} comment={comment} isFirst={index === 0} />
        ))}
      </div>
    </div>
  );
};