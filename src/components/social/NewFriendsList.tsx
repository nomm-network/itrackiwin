import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listFriends, listFriendRequests, sendFriendRequest, respondToFriendRequest } from '@/features/social/lib/api';
import { toast } from 'sonner';
import { UserPlus, Check, X } from 'lucide-react';

export const NewFriendsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: listFriends,
  });

  const { data: friendRequests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: listFriendRequests,
  });

  const sendRequestMutation = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success('Friend request sent!');
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
    onError: (error) => {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    }
  });

  const respondMutation = useMutation({
    mutationFn: ({ otherId, accept }: { otherId: string; accept: boolean }) =>
      respondToFriendRequest(otherId, accept),
    onSuccess: (_, { accept }) => {
      toast.success(accept ? 'Friend request accepted!' : 'Friend request declined');
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] });
    },
    onError: (error) => {
      console.error('Error responding to friend request:', error);
      toast.error('Failed to respond to friend request');
    }
  });

  const handleSendRequest = () => {
    if (!searchQuery.trim()) return;
    sendRequestMutation.mutate(searchQuery.trim());
    setSearchQuery('');
  };

  const getInitials = (id: string) => {
    return id.slice(0, 2).toUpperCase();
  };

  if (friendsLoading || requestsLoading) {
    return <div>Loading friends...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Send Friend Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Add Friends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
            />
            <Button 
              onClick={handleSendRequest}
              disabled={!searchQuery.trim() || sendRequestMutation.isPending}
            >
              {sendRequestMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Friend Requests */}
      {friendRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Friend Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {friendRequests.map((request) => {
                const requesterId = request.requested_by;
                return (
                  <div key={`${request.user_id}-${request.friend_id}`} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(requesterId)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">User {requesterId.slice(-4)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => respondMutation.mutate({ otherId: requesterId, accept: true })}
                        disabled={respondMutation.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => respondMutation.mutate({ otherId: requesterId, accept: false })}
                        disabled={respondMutation.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle>Friends ({friends.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No friends yet. Send some friend requests to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {friends.map((friendId) => (
                <div key={friendId} className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{getInitials(friendId)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">User {friendId.slice(-4)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};