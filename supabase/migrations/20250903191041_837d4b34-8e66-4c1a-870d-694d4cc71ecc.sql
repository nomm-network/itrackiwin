-- Create storage bucket for carousel images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('carousel-images', 'carousel-images', true);

-- Create RLS policies for carousel images bucket
CREATE POLICY "Admins can upload carousel images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'carousel-images' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can update carousel images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'carousel-images' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Admins can delete carousel images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'carousel-images' 
  AND is_admin(auth.uid())
);

CREATE POLICY "Carousel images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'carousel-images');

-- Create carousel_images table
CREATE TABLE public.carousel_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on carousel_images table
ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for carousel_images table
CREATE POLICY "Carousel images are viewable by everyone"
ON public.carousel_images
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage carousel images"
ON public.carousel_images
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_carousel_images_updated_at
  BEFORE UPDATE ON public.carousel_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default carousel images
INSERT INTO public.carousel_images (title, alt_text, file_path, file_url, order_index) VALUES
('Pre-workout Check', 'Pre-workout check interface showing readiness assessment', '/carousel-images/fitness-carousel-1.png', '/assets/fitness-carousel-1.png', 1),
('Warm-up Tracking', 'Warm-up exercise tracking interface with movement guidance', '/carousel-images/fitness-carousel-2.png', '/assets/fitness-carousel-2.png', 2),
('Workout Progress', 'Workout progress tracking showing sets and reps completion', '/carousel-images/fitness-carousel-3.png', '/assets/fitness-carousel-3.png', 3);