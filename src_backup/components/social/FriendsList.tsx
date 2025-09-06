import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, UserMinus, Check, X, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Friend {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  profiles: {
    user_id: string;
    display_name: string;
    username: string;
    avatar_url: string;
  };
}

interface Profile {
  user_id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  is_public: boolean;
}

export const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchFriends = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          requester_profile:profiles!friendships_requester_id_fkey(user_id, display_name, username, avatar_url),
          addressee_profile:profiles!friendships_addressee_id_fkey(user_id, display_name, username, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

      if (error) throw error;

      // Transform the data to show the other person's profile
      const transformedFriends = data?.map((friendship: any) => ({
        ...friendship,
        profiles: friendship.requester_id === user.id 
          ? friendship.addressee_profile 
          : friendship.requester_profile
      })) || [];

      setFriends(transformedFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast({
        title: "Error",
        description: "Failed to load friends",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    setSearchLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, username, avatar_url, is_public')
        .or(`display_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .eq('is_public', true)
        .limit(10);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user.id,
          addressee_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend request sent!"
      });

      fetchFriends();
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
    }
  };

  const respondToFriendRequest = async (friendshipId: string, status: 'accepted' | 'blocked') => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status })
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: status === 'accepted' ? "Friend request accepted!" : "Friend request declined"
      });

      fetchFriends();
    } catch (error) {
      console.error('Error responding to friend request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to friend request",
        variant: "destructive"
      });
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Friend removed"
      });

      fetchFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive"
      });
    }
  };

  const getFriendshipStatus = (userId: string) => {
    return friends.find(f => f.profiles.user_id === userId);
  };

  const pendingRequests = friends.filter(f => f.status === 'pending');
  const acceptedFriends = friends.filter(f => f.status === 'accepted');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Friends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">
              Friends ({acceptedFriends.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>
          
          <TabsContent value="friends" className="space-y-4">
            {acceptedFriends.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No friends yet. Start by searching for users!
              </p>
            ) : (
              acceptedFriends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={friend.profiles?.avatar_url} />
                      <AvatarFallback>
                        {friend.profiles?.display_name?.[0] || friend.profiles?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {friend.profiles?.display_name || friend.profiles?.username}
                      </p>
                      {friend.profiles?.username && friend.profiles?.display_name && (
                        <p className="text-sm text-muted-foreground">
                          @{friend.profiles.username}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFriend(friend.id)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No pending requests
              </p>
            ) : (
              pendingRequests.map((request) => {
                const currentUser = supabase.auth.getUser().then(({data}) => data.user);
                // For now, check if this is incoming based on the current auth state
                const isIncoming = request.addressee_id !== request.requester_id;
                
                return (
                  <div key={request.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={request.profiles?.avatar_url} />
                        <AvatarFallback>
                          {request.profiles?.display_name?.[0] || request.profiles?.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {request.profiles?.display_name || request.profiles?.username}
                        </p>
                        <Badge variant="default" className="text-xs">
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => respondToFriendRequest(request.id, 'accepted')}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => respondToFriendRequest(request.id, 'blocked')}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>
          
          <TabsContent value="search" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="space-y-3">
              {searchLoading ? (
                <p className="text-center text-muted-foreground">Searching...</p>
              ) : searchResults.length === 0 ? (
                searchQuery.trim() && (
                  <p className="text-center text-muted-foreground">No users found</p>
                )
              ) : (
                searchResults.map((user) => {
                  const friendship = getFriendshipStatus(user.user_id);
                  
                  return (
                    <div key={user.user_id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.display_name?.[0] || user.username?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user.display_name || user.username}
                          </p>
                          {user.username && user.display_name && (
                            <p className="text-sm text-muted-foreground">
                              @{user.username}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {friendship ? (
                        <Badge variant={
                          friendship.status === 'accepted' ? 'default' : 
                          friendship.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {friendship.status === 'accepted' ? 'Friends' : 
                           friendship.status === 'pending' ? 'Pending' : 'Blocked'}
                        </Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendFriendRequest(user.user_id)}
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};