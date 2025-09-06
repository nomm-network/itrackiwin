import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Send } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export const CreatePost: React.FC = () => {
  const [caption, setCaption] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleCreatePost = async () => {
    if (!user || !caption.trim()) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('workout_shares')
        .insert({
          user_id: user.id,
          workout_id: null, // Allow posts without specific workouts
          caption: caption.trim(),
          is_public: true,
          workout_data: null,
          share_type: 'general' // Add a general post type
        });

      if (error) throw error;

      setCaption('');
      toast.success('Post shared successfully!');
      
      // Refresh the social feed
      queryClient.invalidateQueries({ queryKey: ['workout_shares'] });
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
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button
            onClick={handleCreatePost}
            disabled={!caption.trim() || isPosting}
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