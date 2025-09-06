import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingDown, TrendingUp, AlertTriangle, Target, Zap } from "lucide-react";

interface StrengthInsightsProps {
  timeframe: string;
}

// Mock insights data - replace with real data from useStagnationDetection and other hooks
const mockInsights = {
  stagnationAlerts: [
    {
      exercise: "Bench Press",
      sessions: 5,
      recommendation: "Consider a deload week (reduce weight by 10-20%)",
      severity: "warning"
    }
  ],
  progressingExercises: [
    { exercise: "Squat", improvement: "+12.5kg", percentage: 8.9 },
    { exercise: "Deadlift", improvement: "+10kg", percentage: 6.2 },
    { exercise: "Overhead Press", improvement: "+5kg", percentage: 11.1 }
  ],
  strengthImbalances: [
    {
      type: "Push/Pull Ratio",
      description: "Your pushing strength is developing faster than pulling",
      recommendation: "Add 1-2 extra back exercises per week",
      severity: "info"
    }
  ],
  performanceMetrics: {
    consistencyScore: 87,
    progressRate: 6.2,
    effortOptimization: 91
  }
};

export const StrengthInsights = ({ timeframe }: StrengthInsightsProps) => {
  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Performance Insights
          </CardTitle>
          <CardDescription>
            Intelligent analysis of your training patterns and progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{mockInsights.performanceMetrics.consistencyScore}%</div>
              <div className="text-sm text-muted-foreground">Consistency Score</div>
              <Progress value={mockInsights.performanceMetrics.consistencyScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{mockInsights.performanceMetrics.progressRate}%</div>
              <div className="text-sm text-muted-foreground">Monthly Progress Rate</div>
              <Progress value={mockInsights.performanceMetrics.progressRate * 10} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{mockInsights.performanceMetrics.effortOptimization}%</div>
              <div className="text-sm text-muted-foreground">Effort Optimization</div>
              <Progress value={mockInsights.performanceMetrics.effortOptimization} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stagnation Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Stagnation Alerts
            </CardTitle>
            <CardDescription>
              Exercises that may need attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockInsights.stagnationAlerts.length > 0 ? (
              mockInsights.stagnationAlerts.map((alert, index) => (
                <Alert key={index} className="border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="font-medium">{alert.exercise}</div>
                      <div className="text-sm text-muted-foreground">
                        No progress in last {alert.sessions} sessions
                      </div>
                      <div className="text-sm">
                        <strong>Recommendation:</strong> {alert.recommendation}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>All exercises showing good progress!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progressing Exercises */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Performers
            </CardTitle>
            <CardDescription>
              Exercises with the best progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockInsights.progressingExercises.map((exercise, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium">{exercise.exercise}</div>
                  <div className="text-sm text-muted-foreground">
                    {exercise.improvement} improvement
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  +{exercise.percentage}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strength Imbalances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Balance Analysis
            </CardTitle>
            <CardDescription>
              Potential muscle imbalances to address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockInsights.strengthImbalances.map((imbalance, index) => (
              <Alert key={index} className="border-blue-200">
                <Target className="h-4 w-4 text-blue-500" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium">{imbalance.type}</div>
                    <div className="text-sm text-muted-foreground">
                      {imbalance.description}
                    </div>
                    <div className="text-sm">
                      <strong>Suggestion:</strong> {imbalance.recommendation}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>

        {/* Quick Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Quick Wins
            </CardTitle>
            <CardDescription>
              Easy improvements for next week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div>
                <div className="font-medium text-sm">Increase squat frequency</div>
                <div className="text-xs text-muted-foreground">
                  Add one extra squat session this week for faster progress
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div>
                <div className="font-medium text-sm">Focus on form over weight</div>
                <div className="text-xs text-muted-foreground">
                  Your RPE data suggests room for technique improvements
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <div>
                <div className="font-medium text-sm">Try pause reps</div>
                <div className="text-xs text-muted-foreground">
                  Break through your bench press plateau with tempo work
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};