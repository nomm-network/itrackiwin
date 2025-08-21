import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface WidgetSkeletonProps {
  className?: string;
}

const WidgetSkeleton: React.FC<WidgetSkeletonProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
};

export default WidgetSkeleton;