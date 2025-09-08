import React, { useEffect } from 'react';
import { useReadinessStore } from '@/stores/readinessStore';
import { loadTodayReadiness, getReadinessScoreColor } from '@/lib/readiness';
import { Badge } from '@/components/ui/badge';

interface ReadinessBadgeProps {
  className?: string;
}

export const ReadinessBadge: React.FC<ReadinessBadgeProps> = ({ className }) => {
  const readiness = useReadinessStore();

  useEffect(() => {
    // Load today's readiness when component mounts
    loadTodayReadiness().catch(console.error);
  }, []);

  if (readiness.score == null) {
    return (
      <Badge variant="outline" className={className}>
        --/100
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`${className} ${getReadinessScoreColor(readiness.score)}`}
    >
      {Math.round(readiness.score)}/100
    </Badge>
  );
};