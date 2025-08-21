-- Create profiles table for user social data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create friendships table
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Create policies for friendships
CREATE POLICY "Users can view their own friendships" 
ON public.friendships 
FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create friendship requests" 
ON public.friendships 
FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update friendships they're involved in" 
ON public.friendships 
FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- Create workout shares table
CREATE TABLE public.workout_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caption TEXT,
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for workout shares
CREATE POLICY "Public workout shares are viewable by everyone" 
ON public.workout_shares 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own workout shares" 
ON public.workout_shares 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout shares" 
ON public.workout_shares 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create likes table
CREATE TABLE public.workout_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_share_id UUID NOT NULL REFERENCES public.workout_shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workout_share_id, user_id)
);

-- Enable RLS
ALTER TABLE public.workout_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for likes
CREATE POLICY "Users can view all likes" 
ON public.workout_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.workout_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.workout_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create comments table
CREATE TABLE public.workout_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_share_id UUID NOT NULL REFERENCES public.workout_shares(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Users can view comments on public shares" 
ON public.workout_comments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.workout_shares 
  WHERE id = workout_share_id AND (is_public = true OR user_id = auth.uid())
));

CREATE POLICY "Users can create comments" 
ON public.workout_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('distance', 'weight', 'reps', 'time', 'workouts')),
  target_value NUMERIC NOT NULL,
  target_unit TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  participants_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Create policies for challenges
CREATE POLICY "Public challenges are viewable by everyone" 
ON public.challenges 
FOR SELECT 
USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "Users can create challenges" 
ON public.challenges 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_value NUMERIC DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for challenge participants
CREATE POLICY "Users can view challenge participants" 
ON public.challenge_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join challenges" 
ON public.challenge_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create functions for like/unlike
CREATE OR REPLACE FUNCTION public.toggle_workout_like(share_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  existing_like UUID;
  is_liked BOOLEAN;
BEGIN
  SELECT id INTO existing_like 
  FROM public.workout_likes 
  WHERE workout_share_id = share_id AND user_id = auth.uid();
  
  IF existing_like IS NOT NULL THEN
    DELETE FROM public.workout_likes WHERE id = existing_like;
    UPDATE public.workout_shares 
    SET likes_count = likes_count - 1 
    WHERE id = share_id;
    is_liked := false;
  ELSE
    INSERT INTO public.workout_likes (workout_share_id, user_id) 
    VALUES (share_id, auth.uid());
    UPDATE public.workout_shares 
    SET likes_count = likes_count + 1 
    WHERE id = share_id;
    is_liked := true;
  END IF;
  
  RETURN is_liked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;