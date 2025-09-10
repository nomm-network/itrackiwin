import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Battery, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchTodayReadiness, getReadinessScoreColor } from '@/lib/readiness';
import { useNavigate } from 'react-router-dom';

const FitnessReadiness: React.FC = () => {
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadReadiness = async () => {
      try {
        setIsLoading(true);
        const score = await fetchTodayReadiness();
        setReadinessScore(score);
      } catch (error) {
        console.error('Error loading readiness:', error);
        setReadinessScore(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadReadiness();
  }, []);

  const getScoreColor = (score: number) => {
    return getReadinessScoreColor(score);
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Ready to train hard';
    if (score >= 60) return 'Good to go';
    if (score >= 40) return 'Take it easy';
    return 'Consider rest day';
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Battery className="h-5 w-5" />
          Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          {isLoading ? (
            <div className="text-2xl font-bold text-muted-foreground">
              --/100
            </div>
          ) : readinessScore !== null ? (
            <>
              <div className={`text-3xl font-bold ${getScoreColor(readinessScore)}`}>
                {readinessScore}/100
              </div>
              <div className="text-sm text-muted-foreground">
                {getScoreDescription(readinessScore)}
              </div>
            </>
          ) : (
            <>
              <div className="text-2xl font-bold text-muted-foreground">
                0/100
              </div>
              <div className="text-sm text-muted-foreground">
                No data yet
              </div>
            </>
          )}
        </div>
        
        {readinessScore !== null && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Battery className="h-3 w-3" />
                Readiness
              </span>
              <span>{readinessScore}/100</span>
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate('/fitness')}
        >
          {readinessScore === null ? 'Log Readiness' : 'Update Readiness'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FitnessReadiness;