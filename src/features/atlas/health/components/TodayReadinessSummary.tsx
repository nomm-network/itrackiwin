import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useReadinessData } from "@/hooks/useReadinessData";
import { getReadinessScoreColor } from "@/lib/readiness";
import { useNavigate } from "react-router-dom";
import { Moon, Zap, Heart, Smile, Droplets, TrendingUp } from "lucide-react";

export function TodayReadinessSummary() {
  const navigate = useNavigate();
  const readiness = useReadinessData();

  const hasReadiness = readiness.score !== undefined;
  const scoreColor = readiness.score ? getReadinessScoreColor(readiness.score) : "text-muted-foreground";

  return (
    <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Today's Readiness</h2>
        {hasReadiness && (
          <div className={`text-3xl font-bold ${scoreColor}`}>
            {Math.round(readiness.score!)}
            <span className="text-sm text-muted-foreground">/100</span>
          </div>
        )}
      </div>

      {hasReadiness && (
        <>
          <Progress value={readiness.score} className="mb-6 h-2" />

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Sleep */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Moon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sleep</p>
                <p className="font-medium">
                  {readiness.sleepHours ? `${readiness.sleepHours}h` : "--"}
                  {readiness.sleepQuality && (
                    <span className="text-xs text-muted-foreground ml-1">
                      • {readiness.sleepQuality >= 8 ? "Excellent" : readiness.sleepQuality >= 6 ? "Good" : "Fair"}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Energy */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Energy</p>
                <p className="font-medium">
                  {readiness.energy ? `${readiness.energy}/10` : "--"}
                </p>
              </div>
            </div>

            {/* Stress */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stress</p>
                <p className="font-medium">
                  {readiness.stress !== undefined
                    ? readiness.stress <= 3
                      ? "Low"
                      : readiness.stress <= 6
                      ? "Moderate"
                      : "High"
                    : "--"}
                </p>
              </div>
            </div>

            {/* Soreness */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Soreness</p>
                <p className="font-medium">
                  {readiness.soreness !== undefined
                    ? readiness.soreness <= 3
                      ? "Low"
                      : readiness.soreness <= 6
                      ? "Moderate"
                      : "High"
                    : "--"}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button 
          onClick={() => navigate("/fitness")} 
          className="flex-1"
          variant={hasReadiness ? "outline" : "default"}
        >
          {hasReadiness ? "Update Readiness" : "Log Readiness"}
        </Button>
        {hasReadiness && (
          <Button variant="ghost" size="icon">
            <TrendingUp className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
