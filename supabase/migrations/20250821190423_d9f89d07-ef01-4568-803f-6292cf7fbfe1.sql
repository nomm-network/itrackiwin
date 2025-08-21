-- Create workout shares table
CREATE TABLE public.workout_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  caption TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout comments table
CREATE TABLE public.workout_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_share_id UUID NOT NULL REFERENCES public.workout_shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout likes table  
CREATE TABLE public.workout_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_share_id UUID NOT NULL REFERENCES public.workout_shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workout_share_id, user_id)
);

-- Enable RLS
ALTER TABLE public.workout_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_shares
CREATE POLICY "Public shares are viewable by everyone" 
ON public.workout_shares 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create their own shares" 
ON public.workout_shares 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shares" 
ON public.workout_shares 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares" 
ON public.workout_shares 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for workout_comments
CREATE POLICY "Comments on public shares are viewable by everyone" 
ON public.workout_comments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.workout_shares ws 
  WHERE ws.id = workout_share_id AND ws.is_public = true
));

CREATE POLICY "Users can create comments" 
ON public.workout_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.workout_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.workout_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for workout_likes
CREATE POLICY "Likes on public shares are viewable by everyone" 
ON public.workout_likes 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.workout_shares ws 
  WHERE ws.id = workout_share_id AND ws.is_public = true
));

CREATE POLICY "Users can manage their own likes" 
ON public.workout_likes 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create function to toggle likes
CREATE OR REPLACE FUNCTION public.toggle_workout_like(share_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_uuid UUID := auth.uid();
  like_exists BOOLEAN;
BEGIN
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if like exists
  SELECT EXISTS(
    SELECT 1 FROM public.workout_likes 
    WHERE workout_share_id = share_id AND user_id = user_uuid
  ) INTO like_exists;

  IF like_exists THEN
    -- Remove like
    DELETE FROM public.workout_likes 
    WHERE workout_share_id = share_id AND user_id = user_uuid;
    
    -- Decrease count
    UPDATE public.workout_shares 
    SET likes_count = likes_count - 1 
    WHERE id = share_id;
    
    RETURN FALSE;
  ELSE
    -- Add like
    INSERT INTO public.workout_likes (workout_share_id, user_id) 
    VALUES (share_id, user_uuid);
    
    -- Increase count
    UPDATE public.workout_shares 
    SET likes_count = likes_count + 1 
    WHERE id = share_id;
    
    RETURN TRUE;
  END IF;
END;
$$;

-- Create trigger to update comments count
CREATE OR REPLACE FUNCTION public.update_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.workout_shares 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.workout_share_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.workout_shares 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.workout_share_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER update_comments_count_trigger
  AFTER INSERT OR DELETE ON public.workout_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_comments_count();

-- Create trigger for updated_at on workout_shares
CREATE TRIGGER update_workout_shares_updated_at
  BEFORE UPDATE ON public.workout_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();