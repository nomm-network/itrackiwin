import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchFeed } from '@/features/social/lib/api';
import { PostCard } from './PostCard';
import { Skeleton } from '@/components/ui/skeleton';

export const NewSocialFeed: React.FC = () => {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['social-feed'],
    queryFn: fetchFeed,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex space-x-2">
              {Array.from({ length: 7 }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-8 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load posts. Please try again.</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};