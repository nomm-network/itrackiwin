import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { getUserProfile } from '@/features/social/lib/api';

export const useNickname = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: nickname, isLoading: loading, refetch } = useQuery({
    queryKey: ['user-nickname', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profile = await getUserProfile(user.id);
      return profile?.nickname || null;
    },
    enabled: !!user?.id,
    staleTime: 0, // Always fresh
    gcTime: 0, // Don't cache
  });

  const updateNickname = (newNickname: string) => {
    // Update the cache immediately
    queryClient.setQueryData(['user-nickname', user?.id], newNickname);
    // Also invalidate related queries
    queryClient.invalidateQueries({ queryKey: ['user-nickname'] });
    queryClient.invalidateQueries({ queryKey: ['social-feed'] });
  };

  const refreshNickname = () => {
    refetch();
  };

  return { nickname, loading, updateNickname, refreshNickname };
};