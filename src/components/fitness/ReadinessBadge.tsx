import React, { useEffect, useState } from 'react';
import { fetchTodayReadiness } from '@/lib/api/readiness';
import { getReadinessScoreColor } from '@/lib/readiness';
import { Badge } from '@/components/ui/badge';

interface ReadinessBadgeProps {
  className?: string;
}

export const ReadinessBadge: React.FC<ReadinessBadgeProps> = ({ className }) => {
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReadiness = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 ReadinessBadge loading today readiness...');
        const score = await fetchTodayReadiness();
        console.log('🎯 ReadinessBadge loaded score:', score);
        setReadinessScore(score);
      } catch (error) {
        console.error('❌ Error loading readiness:', error);
        setReadinessScore(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadReadiness();
  }, []);

  if (isLoading) {
    return (
      <Badge variant="outline" className={className}>
        --/100
      </Badge>
    );
  }

  if (readinessScore === null) {
    return (
      <Badge variant="outline" className={className}>
        0/100
      </Badge>
    );
  }

  return (
    <Badge 
      variant="outline" 
      className={`${className} ${getReadinessScoreColor(readinessScore * 10)}`}
    >
      {Math.round(readinessScore * 10)}/100
    </Badge>
  );
};