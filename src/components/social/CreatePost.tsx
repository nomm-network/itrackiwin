import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createPost } from '@/features/social/lib/api';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { PostImageUpload } from './PostImageUpload';

export const CreatePost: React.FC = () => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isPosting, setIsPosting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleCreatePost = async () => {
    if (!user || !content.trim()) return;

    setIsPosting(true);
    try {
      await createPost(content.trim(), 'friends', imageUrl || undefined);
      
      setContent('');
      setImageUrl('');
      toast.success('Post shared successfully!');
      
      // Refresh the social feed
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to share post');
    } finally {
      setIsPosting(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5" />
          Share Something
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="What's on your mind? Share your fitness journey, thoughts, or motivation..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="resize-none"
        />
        
        <PostImageUpload
          onImageUpload={setImageUrl}
          currentImage={imageUrl}
          onRemoveImage={() => setImageUrl('')}
        />
        
        <div className="flex justify-end">
          <Button
            onClick={handleCreatePost}
            disabled={!content.trim() || isPosting}
            size="sm"
          >
            {isPosting ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Posting...
              </span>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Share Post
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};