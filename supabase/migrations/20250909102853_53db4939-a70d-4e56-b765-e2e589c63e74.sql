-- Create storage bucket for social post images
INSERT INTO storage.buckets (id, name, public) VALUES ('social-posts', 'social-posts', true);

-- Create RLS policies for social post images
CREATE POLICY "Users can upload their own post images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view all post images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'social-posts');

CREATE POLICY "Users can update their own post images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own post images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'social-posts' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add image_url column to social_posts table
ALTER TABLE social_posts ADD COLUMN image_url TEXT;