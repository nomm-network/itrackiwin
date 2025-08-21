import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, Target, Loader2, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ProgressInsight {
  exerciseName: string;
  timeframe: string;
  analysis: {
    trend: string;
    volumeChange: number;
    strengthChange: number;
    consistency: string;
  };
  insights: string;
  recommendations: Array<{
    action: string;
    reason: string;
  }>;
}

const ProgressInsights: React.FC = () => {
  const { toast } = useToast();
  const [selectedExercise, setSelectedExercise] = useState("");
  const [timeframe, setTimeframe] = useState<'1week' | '1month' | '3months' | '6months'>('1month');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressInsight, setProgressInsight] = useState<ProgressInsight | null>(null);

  const { data: exercises = [] } = useQuery({
    queryKey: ['user-exercises'],
    queryFn: async () => {
      // Mock data for demonstration - in reality would fetch from workout history
      return [
        { id: '1', name: 'Bench Press' },
        { id: '2', name: 'Squat' },
        { id: '3', name: 'Deadlift' },
        { id: '4', name: 'Pull-ups' },
        { id: '5', name: 'Overhead Press' },
      ];
    },
  });

  const analyzeProgress = async () => {
    if (!selectedExercise) {
      toast({
        title: "Exercise required",
        description: "Please select an exercise to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Mock workout data for demonstration
      const mockExerciseData = {
        exerciseId: selectedExercise,
        exerciseName: exercises.find(e => e.id === selectedExercise)?.name || 'Unknown',
        recentSets: [
          { weight: 70, reps: 8, date: '2024-01-15', rpe: 7 },
          { weight: 72.5, reps: 8, date: '2024-01-18', rpe: 8 },
          { weight: 75, reps: 6, date: '2024-01-22', rpe: 9 },
          { weight: 75, reps: 8, date: '2024-01-25', rpe: 8 },
          { weight: 77.5, reps: 6, date: '2024-01-29', rpe: 9 },
        ],
        personalRecords: [
          { kind: 'heaviest', value: 77.5, achievedAt: '2024-01-29' },
          { kind: 'reps', value: 12, achievedAt: '2024-01-10' },
          { kind: '1RM', value: 92.5, achievedAt: '2024-01-29' },
        ]
      };

      const { data, error } = await supabase.functions.invoke('progress-insights', {
        body: {
          userId: 'user123',
          exerciseData: mockExerciseData,
          timeframe
        }
      });

      if (error) throw error;

      setProgressInsight(data);
      toast({
        title: "Analysis complete!",
        description: `Progress insights for ${data.exerciseName}`,
      });
    } catch (error) {
      console.error('Progress analysis error:', error);
      toast({
        title: "Analysis failed",
        description: "Unable to analyze progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'plateauing':
        return <Minus className="h-4 w-4 text-yellow-500" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50 dark:bg-green-950';
      case 'declining':
        return 'text-red-600 bg-red-50 dark:bg-red-950';
      case 'plateauing':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950';
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-950';
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Progress Insights</h1>
        </div>
        <p className="text-muted-foreground">
          AI-powered analysis of your training progress
        </p>
      </div>

      {/* Analysis Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Analyze Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Exercise</label>
            <Select value={selectedExercise} onValueChange={setSelectedExercise}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose an exercise to analyze" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Time Period</label>
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1week">Last Week</SelectItem>
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={analyzeProgress}
            disabled={isAnalyzing || !selectedExercise}
            className="w-full h-12"
          >
            {isAnalyzing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing Progress...</>
            ) : (
              <><BarChart3 className="h-4 w-4 mr-2" /> Analyze Progress</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Analysis Results */}
      {progressInsight && (
        <>
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Progress Overview
                <Badge variant="outline">{progressInsight.timeframe}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-3 rounded-lg ${getTrendColor(progressInsight.analysis.trend)}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {getTrendIcon(progressInsight.analysis.trend)}
                    <span className="text-sm font-medium">Overall Trend</span>
                  </div>
                  <p className="text-lg font-bold capitalize">{progressInsight.analysis.trend}</p>
                </div>

                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-600">Volume Change</span>
                  </div>
                  <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                    {progressInsight.analysis.volumeChange > 0 ? '+' : ''}
                    {progressInsight.analysis.volumeChange}%
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-600">Strength Change</span>
                  </div>
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                    {progressInsight.analysis.strengthChange > 0 ? '+' : ''}
                    {progressInsight.analysis.strengthChange}%
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Consistency</span>
                  </div>
                  <p className="text-lg font-bold text-green-800 dark:text-green-200 capitalize">
                    {progressInsight.analysis.consistency}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle>AI Coach Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {progressInsight.insights}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Actionable Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {progressInsight.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium text-sm mb-2">{rec.action}</h4>
                    <p className="text-xs text-muted-foreground">{rec.reason}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ProgressInsights;