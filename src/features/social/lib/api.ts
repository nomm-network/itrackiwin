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
  emoji: string;
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
export async function reactToPost(postId: string, emoji: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('social_reactions')
    .upsert({ post_id: postId, user_id: user.id, emoji }, { onConflict: 'post_id,user_id' });
  if (error) throw error;
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
    .select('emoji')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data?.emoji || null;
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