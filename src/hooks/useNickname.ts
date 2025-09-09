import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/features/social/lib/api';

export const useNickname = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Add debugging
  console.log('useNickname: Current user:', user?.id);

  const { data: nickname, isLoading: loading, refetch } = useQuery({
    queryKey: ['user-nickname', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('useNickname: Fetching profile for user:', user.id);
      try {
        const profile = await getUserProfile(user.id);
        console.log('useNickname: Profile result:', profile);
        return profile?.nickname || null;
      } catch (error) {
        console.error('useNickname: Error fetching profile:', error);
        return null;
      }
    },
    enabled: !!user?.id,
    staleTime: 0, // Always fresh
    gcTime: 0, // Don't cache
  });

  const updateNickname = (newNickname: string) => {
    console.log('useNickname: Updating nickname to:', newNickname);
    // Update the cache immediately
    queryClient.setQueryData(['user-nickname', user?.id], newNickname);
    // Also invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['user-nickname'] });
    queryClient.invalidateQueries({ queryKey: ['social-feed'] });
  };

  const refreshNickname = () => {
    console.log('useNickname: Refreshing nickname');
    refetch();
  };

  console.log('useNickname: Current nickname:', nickname, 'Loading:', loading);

  return { nickname, loading, updateNickname, refreshNickname };
};