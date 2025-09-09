-- Add nickname to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS nickname TEXT;

-- Create post reaction enum
DO $$ BEGIN
  CREATE TYPE public.post_reaction AS ENUM (
    'like','dislike','muscle','clap','ok','fire','heart','cheers','thumbsup'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Add comments table
CREATE TABLE IF NOT EXISTS public.social_post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (length(btrim(body)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update social_reactions to use new enum (migrate existing data)
ALTER TABLE public.social_reactions ADD COLUMN IF NOT EXISTS kind public.post_reaction;

-- Migrate existing emoji data to new enum
UPDATE public.social_reactions SET kind = CASE 
  WHEN emoji = '💪' THEN 'muscle'::post_reaction
  WHEN emoji = '👏' THEN 'clap'::post_reaction
  WHEN emoji = '👌' THEN 'ok'::post_reaction
  WHEN emoji = '🔥' THEN 'fire'::post_reaction
  WHEN emoji = '❤️' THEN 'heart'::post_reaction
  WHEN emoji = '🥂' THEN 'cheers'::post_reaction
  WHEN emoji = '👍' THEN 'thumbsup'::post_reaction
  ELSE 'like'::post_reaction
END WHERE kind IS NULL;

-- Make kind required and drop emoji column
ALTER TABLE public.social_reactions ALTER COLUMN kind SET NOT NULL;
ALTER TABLE public.social_reactions DROP COLUMN IF EXISTS emoji;

-- Enable RLS for comments
ALTER TABLE public.social_post_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for comments
CREATE POLICY "read comments" ON public.social_post_comments
  FOR SELECT USING (true);

-- Friend-only commenting policy
CREATE POLICY "comment friend-only" ON public.social_post_comments
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND (
      -- Allow commenting on own posts
      EXISTS (
        SELECT 1 FROM public.social_posts p 
        WHERE p.id = post_id AND p.author_id = auth.uid()
      )
      OR
      -- Allow commenting if friends with post author
      EXISTS (
        SELECT 1
        FROM public.social_posts p
        WHERE p.id = post_id 
        AND public.are_friends(p.author_id, auth.uid())
      )
    )
  );

-- Manage own comments
CREATE POLICY "manage own comments" ON public.social_post_comments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_comments_post ON public.social_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_users_nickname ON public.users(nickname);

-- Helper function to check friendship
CREATE OR REPLACE FUNCTION public.are_friends_with_user(target_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.social_friendships f
    WHERE f.status = 'accepted'
      AND ((f.user_id = auth.uid() AND f.friend_id = target_user_id)
        OR (f.friend_id = auth.uid() AND f.user_id = target_user_id))
  );
$$;