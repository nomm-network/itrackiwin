import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, MessageCircle, TrendingUp, Target, Loader2, Sparkles } from "lucide-react";
import DebugPanel from "@/components/debug/DebugPanel";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRecentWorkouts } from "@/features/health/fitness/services/fitness.api";
import { useQuery } from "@tanstack/react-query";

interface CoachingResponse {
  coaching: string;
  workoutRecommendation?: any;
  analysis?: any;
}

const AICoach: React.FC = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [question, setQuestion] = useState("");
  const [coachingResponse, setCoachingResponse] = useState<CoachingResponse | null>(null);
  const [userGoals, setUserGoals] = useState("");
  
  const { data: recentWorkouts = [] } = useRecentWorkouts(10);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const getPersonalizedCoaching = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to get personalized coaching",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // Add debug logging for request
      if ((window as any).debugLog) {
        (window as any).debugLog({
          level: 'info',
          message: 'Starting AI Coach Analysis',
          details: {
            userId: user.id,
            userGoals: userGoals.split(',').map(g => g.trim()).filter(Boolean),
            workoutCount: recentWorkouts.length
          },
          source: 'AI Coach'
        });
      }

      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          userId: user.id,
          workoutHistory: recentWorkouts,
          userGoals: userGoals.split(',').map(g => g.trim()).filter(Boolean),
          preferences: {
            difficulty: 'intermediate',
            duration: 45,
            equipment: ['dumbbells', 'barbell', 'bodyweight']
          }
        }
      });

      // Log the raw response for debugging
      if ((window as any).debugLog) {
        (window as any).debugLog({
          level: 'info',
          message: 'AI Coach Raw Response',
          details: {
            data: data,
            error: error,
            hasData: !!data,
            hasError: !!error
          },
          source: 'AI Coach Response'
        });
      }

      if (error) {
        // Log detailed error for debugging
        if ((window as any).debugLog) {
          (window as any).debugLog({
            level: 'error',
            message: 'AI Coach Edge Function Error',
            details: {
              error: error,
              errorMessage: error.message,
              errorCode: error.code,
              errorDetails: error.details,
              timestamp: new Date().toISOString()
            },
            source: 'AI Coach Functions'
          });
        }
        throw error;
      }

      setCoachingResponse(data);
      toast({
        title: "Coaching analysis complete!",
        description: "Your personalized insights are ready",
      });
    } catch (error: any) {
      console.error('Coaching error:', error);
      
      // Final error logging
      if ((window as any).debugLog) {
        (window as any).debugLog({
          level: 'error',
          message: 'AI Coach Analysis Exception',
          details: {
            error: error.message,
            stack: error.stack,
            userGoals: userGoals
          },
          source: 'AI Coach Exception'
        });
      }

      toast({
        title: "Analysis failed",
        description: error.message || "Unable to generate coaching insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const askCoachQuestion = async () => {
    if (!question.trim()) return;

    setIsAnalyzing(true);
    try {
      // Add debug logging for question
      if ((window as any).debugLog) {
        (window as any).debugLog({
          level: 'info',
          message: 'Asking AI Coach Question',
          details: {
            question: question,
            userId: user?.id || 'anonymous',
            workoutCount: recentWorkouts.length
          },
          source: 'AI Coach Question'
        });
      }

      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          userId: user?.id || 'anonymous',
          workoutHistory: recentWorkouts,
          userGoals: userGoals.split(',').map(g => g.trim()).filter(Boolean),
          question: question
        }
      });

      // Log the raw response for debugging
      if ((window as any).debugLog) {
        (window as any).debugLog({
          level: 'info',
          message: 'AI Coach Question Response',
          details: {
            data: data,
            error: error,
            hasData: !!data,
            hasError: !!error
          },
          source: 'AI Coach Question Response'
        });
      }

      if (error) {
        // Log detailed error for debugging
        if ((window as any).debugLog) {
          (window as any).debugLog({
            level: 'error',
            message: 'AI Coach Question Error',
            details: {
              error: error,
              errorMessage: error.message,
              errorCode: error.code,
              errorDetails: error.details,
              question: question,
              timestamp: new Date().toISOString()
            },
            source: 'AI Coach Question Error'
          });
        }
        throw error;
      }

      setCoachingResponse(data);
      setQuestion("");
    } catch (error: any) {
      console.error('Question error:', error);
      
      // Final error logging
      if ((window as any).debugLog) {
        (window as any).debugLog({
          level: 'error',
          message: 'AI Coach Question Exception',
          details: {
            error: error.message,
            stack: error.stack,
            question: question
          },
          source: 'AI Coach Question Exception'
        });
      }

      toast({
        title: "Unable to answer",
        description: error.message || "Please try rephrasing your question",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">AI Fitness Coach</h1>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-muted-foreground">
          Get personalized coaching insights powered by AI
        </p>
      </div>

      {/* Goals Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Fitness Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="goals">What are your main fitness goals? (comma-separated)</Label>
            <Input
              id="goals"
              placeholder="e.g., Build muscle, Lose weight, Improve strength, Get fitter"
              value={userGoals}
              onChange={(e) => setUserGoals(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button 
            onClick={getPersonalizedCoaching}
            disabled={isAnalyzing}
            className="w-full h-12"
          >
            {isAnalyzing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Brain className="h-4 w-4 mr-2" /> Get Personalized Coaching</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Ask Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Ask Your Coach
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question">What would you like to know?</Label>
            <Textarea
              id="question"
              placeholder="e.g., How can I improve my bench press? What should I do for better recovery?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1"
              rows={3}
            />
          </div>
          <Button 
            onClick={askCoachQuestion}
            disabled={isAnalyzing || !question.trim()}
            variant="outline"
            className="w-full"
          >
            {isAnalyzing ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Thinking...</>
            ) : (
              <><MessageCircle className="h-4 w-4 mr-2" /> Ask Question</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Coaching Response */}
      {coachingResponse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Coaching Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-sm">
                {coachingResponse.coaching}
              </div>
            </div>

            {coachingResponse.workoutRecommendation && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-3">Recommended Workout</h4>
                {coachingResponse.workoutRecommendation.exercises?.map((exercise: any, index: number) => (
                  <div key={index} className="mb-2 p-2 bg-background rounded border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{exercise.name}</span>
                      <Badge variant="secondary">
                        {exercise.sets} × {exercise.reps}
                      </Badge>
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{exercise.notes}</p>
                    )}
                  </div>
                ))}
                <div className="mt-3 text-sm text-muted-foreground">
                  <p><strong>Duration:</strong> {coachingResponse.workoutRecommendation.duration}</p>
                  <p><strong>Focus:</strong> {coachingResponse.workoutRecommendation.focus}</p>
                </div>
              </div>
            )}

            {coachingResponse.analysis && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm">
                <p><strong>Workout Analysis:</strong></p>
                <p>• {coachingResponse.analysis.trends}</p>
                <p>• {coachingResponse.analysis.strengths}</p>
                <p>• {coachingResponse.analysis.improvements}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Coaching Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Coaching Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                💪 Progressive Overload
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Gradually increase weight, reps, or sets each week for continued progress
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                😴 Recovery Matters
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Allow 48-72 hours between training the same muscle groups
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                🎯 Consistency Wins
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                3-4 workouts per week consistently beats sporadic intense sessions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <DebugPanel forceOpen={true} />
    </div>
  );
};

export default AICoach;