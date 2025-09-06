import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Calendar, Zap, Target } from "lucide-react";

interface PerformanceMetricsProps {
  timeframe: string;
}

// Mock performance data - replace with real calculations
const mockMetrics = {
  strengthGains: {
    trend: "up" as const,
    percentage: 8.2,
    description: "Above average strength progression"
  },
  volumeLoad: {
    trend: "up" as const,
    percentage: 12.4,
    description: "Increased training volume"
  },
  consistency: {
    score: 87,
    missedWorkouts: 2,
    plannedWorkouts: 16
  },
  intensity: {
    averageRPE: 7.2,
    trend: "stable" as const,
    optimalRange: "7.0-8.0"
  },
  recovery: {
    readinessScore: 8.1,
    sleepQuality: 7.8,
    stressLevel: 3.2
  }
};

const getTrendIcon = (trend: "up" | "down" | "stable") => {
  switch (trend) {
    case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
    case "stable": return <Minus className="h-4 w-4 text-yellow-600" />;
  }
};

const getTrendColor = (trend: "up" | "down" | "stable") => {
  switch (trend) {
    case "up": return "text-green-600";
    case "down": return "text-red-600";
    case "stable": return "text-yellow-600";
  }
};

export const PerformanceMetrics = ({ timeframe }: PerformanceMetricsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Key indicators for {timeframe === "1m" ? "this month" : "selected period"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strength Progression */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon(mockMetrics.strengthGains.trend)}
              <span className="font-medium">Strength Gains</span>
            </div>
            <Badge variant="secondary" className={getTrendColor(mockMetrics.strengthGains.trend)}>
              +{mockMetrics.strengthGains.percentage}%
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {mockMetrics.strengthGains.description}
          </div>
          <Progress value={mockMetrics.strengthGains.percentage * 5} className="h-2" />
        </div>

        {/* Volume Load */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon(mockMetrics.volumeLoad.trend)}
              <span className="font-medium">Volume Load</span>
            </div>
            <Badge variant="secondary" className={getTrendColor(mockMetrics.volumeLoad.trend)}>
              +{mockMetrics.volumeLoad.percentage}%
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {mockMetrics.volumeLoad.description}
          </div>
          <Progress value={mockMetrics.volumeLoad.percentage * 4} className="h-2" />
        </div>

        {/* Training Consistency */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Consistency</span>
            </div>
            <Badge variant="secondary" className="text-blue-600">
              {mockMetrics.consistency.score}%
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            {mockMetrics.consistency.plannedWorkouts - mockMetrics.consistency.missedWorkouts} of {mockMetrics.consistency.plannedWorkouts} planned workouts completed
          </div>
          <Progress value={mockMetrics.consistency.score} className="h-2" />
        </div>

        {/* Training Intensity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon(mockMetrics.intensity.trend)}
              <span className="font-medium">Avg Intensity (RPE)</span>
            </div>
            <Badge variant="secondary">
              {mockMetrics.intensity.averageRPE}/10
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Optimal range: {mockMetrics.intensity.optimalRange}
          </div>
          <Progress value={mockMetrics.intensity.averageRPE * 10} className="h-2" />
        </div>

        {/* Recovery Metrics */}
        <div className="space-y-4 pt-4 border-t">
          <div className="font-medium text-sm">Recovery Indicators</div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Readiness Score</span>
              <div className="flex items-center gap-2">
                <Progress value={mockMetrics.recovery.readinessScore * 10} className="w-16 h-2" />
                <span className="text-sm font-medium">{mockMetrics.recovery.readinessScore}/10</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Sleep Quality</span>
              <div className="flex items-center gap-2">
                <Progress value={mockMetrics.recovery.sleepQuality * 10} className="w-16 h-2" />
                <span className="text-sm font-medium">{mockMetrics.recovery.sleepQuality}/10</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Stress Level</span>
              <div className="flex items-center gap-2">
                <Progress value={100 - (mockMetrics.recovery.stressLevel * 10)} className="w-16 h-2" />
                <span className="text-sm font-medium">{mockMetrics.recovery.stressLevel}/10</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action */}
        <div className="pt-4 border-t">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <div className="text-sm font-medium text-blue-900">
                  Performance Tip
                </div>
                <div className="text-xs text-blue-700">
                  Your consistency is excellent! Consider slightly increasing intensity for faster gains.
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};