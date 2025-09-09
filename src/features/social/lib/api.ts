import { supabase } from '@/integrations/supabase/client';

export type SocialPost = {
  id: string;
  author_id: string;
  body: string;
  media?: any;
  visibility: 'public' | 'friends' | 'private';
  like_count: number;
  comment_count: number;
  created_at: string;
};

export type SocialReaction = {
  post_id: string;
  user_id: string;
  kind: 'like' | 'dislike' | 'muscle' | 'clap' | 'ok' | 'fire' | 'heart' | 'cheers' | 'thumbsup';
  created_at: string;
};

export type SocialComment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
};

export type SocialFriendship = {
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  requested_by: string;
  created_at: string;
  updated_at: string;
};

// Post API functions
export async function createPost(body: string, visibility: 'public' | 'friends' | 'private' = 'friends') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('social_posts')
    .insert({ author_id: user.id, body, visibility })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchFeed() {
  const { data, error } = await supabase
    .from('social_posts')
    .select('id, body, author_id, like_count, comment_count, created_at, visibility')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

export async function deletePost(postId: string) {
  const { error } = await supabase
    .from('social_posts')
    .delete()
    .eq('id', postId);
  if (error) throw error;
}

// Reaction API functions
export async function toggleReaction(postId: string, kind: 'like' | 'dislike' | 'muscle' | 'clap' | 'ok' | 'fire' | 'heart' | 'cheers' | 'thumbsup') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: existing } = await supabase
    .from('social_reactions')
    .select('kind')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase
      .from('social_reactions')
      .insert({ post_id: postId, user_id: user.id, kind });
    if (error) throw error;
    return;
  }

  // Same kind -> remove (toggle off). Different kind -> switch
  if (existing.kind === kind) {
    const { error } = await supabase
      .from('social_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('social_reactions')
      .update({ kind })
      .eq('post_id', postId)
      .eq('user_id', user.id);
    if (error) throw error;
  }
}

export async function removeReaction(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('social_reactions')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);
  if (error) throw error;
}

export async function getUserReactionForPost(postId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('social_reactions')
    .select('kind')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data?.kind || null;
}

export async function fetchPostMeta(postId: string) {
  const { data: reactions, error: reactionsError } = await supabase
    .from('social_reactions')
    .select('kind')
    .eq('post_id', postId);
  if (reactionsError) throw reactionsError;

  const counts = (reactions ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.kind] = (acc[r.kind] ?? 0) + 1;
    return acc;
  }, {});

  const { count: commentsCount, error: commentsError } = await supabase
    .from('social_post_comments')
    .select('*', { head: true, count: 'exact' })
    .eq('post_id', postId);
  if (commentsError) throw commentsError;

  return { counts, commentsCount: commentsCount ?? 0 };
}

export async function addComment(postId: string, body: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('social_post_comments')
    .insert({ post_id: postId, body, user_id: user.id });
  return { error };
}

export async function fetchComments(postId: string) {
  const { data, error } = await supabase
    .from('social_post_comments')
    .select('id, body, user_id, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('nickname')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateUserNickname(nickname: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('users')
    .update({ nickname })
    .eq('id', user.id);
  if (error) throw error;
}

// Friendship API functions
export async function sendFriendRequest(otherId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Normalize order so (min,max) avoids duplicates
  const [a, b] = [user.id, otherId].sort();
  const { error } = await supabase.from('social_friendships').upsert({
    user_id: a, 
    friend_id: b, 
    status: 'pending', 
    requested_by: user.id
  }, { onConflict: 'user_id,friend_id' });
  if (error) throw error;
}

export async function respondToFriendRequest(otherId: string, accept: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const [a, b] = [user.id, otherId].sort();
  const { error } = await supabase
    .from('social_friendships')
    .update({ 
      status: accept ? 'accepted' : 'blocked', 
      updated_at: new Date().toISOString() 
    })
    .eq('user_id', a)
    .eq('friend_id', b);
  if (error) throw error;
}

export async function listFriends() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('social_friendships')
    .select('*')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq('status', 'accepted');
  if (error) throw error;
  
  return data.map(r => (r.user_id === user.id ? r.friend_id : r.user_id));
}

export async function listFriendRequests() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('social_friendships')
    .select('*')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq('status', 'pending')
    .neq('requested_by', user.id);
  if (error) throw error;
  
  return data;
}