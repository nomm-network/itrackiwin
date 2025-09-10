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
  isCompact?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, isCompact = false }) => {
  const [meta, setMeta] = useState<{counts: Record<string, number>, repliesCount: number}>({counts:{}, repliesCount:0});
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<CommentReply[]>([]);
  const [showReplies, setShowReplies] = useState(false);
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
    <div className="space-y-1">
      <div className="flex items-start space-x-0">
        <div className="flex-1">
          <div className="text-sm">
            <span className="font-semibold mr-2">
              {authorProfile?.nickname || 'Anonymous'}
            </span>
            <span>{comment.body}</span>
          </div>
          
          {!isCompact && (
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReaction('heart')}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                {meta.counts.heart ? `${meta.counts.heart} likes` : 'Like'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyInput(!showReplyInput)}
                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                Reply
              </Button>

              {meta.repliesCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadReplies}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  {showReplies ? 'Hide replies' : `View replies (${meta.repliesCount})`}
                </Button>
              )}
            </div>
          )}

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
            <div className="ml-8 mt-3 space-y-3">
              {replies.map((reply) => (
                <div key={reply.id} className="flex items-start space-x-0">
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-semibold mr-2">
                        {reply.author?.nickname || 'Anonymous'}
                      </span>
                      {reply.replied_to_user && (
                        <span className="text-primary mr-1">@{reply.replied_to_user.nickname}</span>
                      )}
                      <span>{reply.body}</span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReplyReaction(reply.id, 'heart')}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {replyReactions[reply.id]?.counts?.heart ? `${replyReactions[reply.id].counts.heart} likes` : 'Like'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
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
  const [showAllComments, setShowAllComments] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      const data = await fetchComments(postId);
      
      // Fetch author profiles and comment metadata for popularity sorting
      const commentsWithProfiles = await Promise.all(
        data.map(async (comment: any) => {
          try {
            const [profile, meta] = await Promise.all([
              getUserProfile(comment.user_id),
              fetchCommentMeta(comment.id)
            ]);
            return { 
              ...comment, 
              author: profile,
              popularity: meta.repliesCount + Object.values(meta.counts).reduce((sum, count) => sum + count, 0)
            };
          } catch {
            return { ...comment, author: null, popularity: 0 };
          }
        })
      );
      
      // Sort by popularity (replies + reactions), then by creation date
      const sortedComments = commentsWithProfiles.sort((a, b) => {
        if (b.popularity !== a.popularity) {
          return b.popularity - a.popularity;
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      
      setComments(sortedComments as Comment[]);
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

  // Always show first comment if exists, then option to show all
  const shouldShowFirstComment = comments.length > 0;
  const displayedComments = showAllComments ? comments : (shouldShowFirstComment ? [comments[0]] : []);
  const hasMoreComments = comments.length > 1;

  return (
    <div className="space-y-3">
      {/* Comments Display - Always show first comment */}
      {shouldShowFirstComment && (
        <div className="space-y-3">
          {displayedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
          
          {hasMoreComments && !showAllComments && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllComments(true)}
              className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
            >
              View all {comments.length} comments
            </Button>
          )}
        </div>
      )}

      {/* Add Comment Input */}
      <div className="flex space-x-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 border-none shadow-none text-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
        />
        <Button 
          onClick={handleAddComment} 
          disabled={!newComment.trim() || loading}
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80"
        >
          {loading ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </div>
  );
};