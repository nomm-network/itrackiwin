import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createPost } from '@/features/social/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { PostImageUpload } from './PostImageUpload';

export const PostComposer: React.FC = () => {
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('friends');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const createPostMutation = useMutation({
    mutationFn: ({ body, visibility, imageUrl }: { body: string; visibility: 'public' | 'friends' | 'private'; imageUrl?: string }) =>
      createPost(body, visibility, imageUrl),
    onSuccess: () => {
      setBody('');
      setImageUrl('');
      toast.success('Post shared successfully!');
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
    onError: (error) => {
      console.error('Error creating post:', error);
      toast.error('Failed to share post');
    }
  });

  const handleShare = async () => {
    if (!body.trim()) return;
    createPostMutation.mutate({ body: body.trim(), visibility, imageUrl: imageUrl || undefined });
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share Something</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your training, thoughts, or motivation..."
          className="min-h-[100px]"
          maxLength={2000}
        />
        
        <PostImageUpload
          onImageUpload={setImageUrl}
          currentImage={imageUrl}
          onRemoveImage={() => setImageUrl('')}
        />
        
        <div className="flex items-center justify-between">
          <Select value={visibility} onValueChange={(value: 'public' | 'friends' | 'private') => setVisibility(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="friends">Friends</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Only me</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleShare}
            disabled={!body.trim() || createPostMutation.isPending}
          >
            {createPostMutation.isPending ? 'Sharing...' : 'Share Post'}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {body.length}/2000 characters
        </div>
      </CardContent>
    </Card>
  );
};