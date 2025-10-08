import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReadinessData } from "@/hooks/useReadinessData";
import { getReadinessScoreColor, getReadinessScoreDescription } from "@/lib/readiness";
import { useNavigate } from "react-router-dom";
import { TodayReadinessSummary } from "./components/TodayReadinessSummary";
import { VitalMetricsDashboard } from "./components/VitalMetricsDashboard";
import { SmartInsights } from "./components/SmartInsights";
import { HabitsRecoveryTracker } from "./components/HabitsRecoveryTracker";
import { ConnectedPlanets } from "./components/ConnectedPlanets";
import { Activity } from "lucide-react";

export default function HealthPage() {
  const navigate = useNavigate();
  const readiness = useReadinessData();

  const scoreColor = readiness.score ? getReadinessScoreColor(readiness.score) : "text-muted-foreground";
  const scoreDescription = readiness.score ? getReadinessScoreDescription(readiness.score) : "Not logged";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 p-4 pb-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-teal-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Health</h1>
              <p className="text-sm text-muted-foreground">Your personal health command center</p>
            </div>
          </div>
          <Badge variant="outline" className={scoreColor}>
            {readiness.score ? `${Math.round(readiness.score)}/100` : "--/100"}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Section 1: Today's Readiness Summary */}
        <TodayReadinessSummary />

        {/* Section 2: Vital Metrics Dashboard */}
        <VitalMetricsDashboard />

        {/* Section 3: Smart Insights (AI Health Coach) */}
        <SmartInsights />

        {/* Section 4: Habits & Recovery Tracker */}
        <HabitsRecoveryTracker />

        {/* Section 5: Connected Planets */}
        <ConnectedPlanets />
      </div>
    </div>
  );
}
