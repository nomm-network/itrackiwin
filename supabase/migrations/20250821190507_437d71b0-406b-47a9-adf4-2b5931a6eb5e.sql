-- Enable RLS if not already enabled
ALTER TABLE public.workout_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public shares are viewable by everyone" ON public.workout_shares;
DROP POLICY IF EXISTS "Users can create their own shares" ON public.workout_shares;
DROP POLICY IF EXISTS "Users can update their own shares" ON public.workout_shares;
DROP POLICY IF EXISTS "Users can delete their own shares" ON public.workout_shares;

DROP POLICY IF EXISTS "Comments on public shares are viewable by everyone" ON public.workout_comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.workout_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.workout_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.workout_comments;

DROP POLICY IF EXISTS "Likes on public shares are viewable by everyone" ON public.workout_likes;
DROP POLICY IF EXISTS "Users can manage their own likes" ON public.workout_likes;

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