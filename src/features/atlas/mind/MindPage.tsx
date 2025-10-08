import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { TodayMindSnapshot } from "./components/TodayMindSnapshot";
import { MoodMetrics } from "./components/MoodMetrics";
import { MindInsights } from "./components/MindInsights";
import { MindHabits } from "./components/MindHabits";
import { ConnectedPlanets } from "./components/ConnectedPlanets";
import { Brain } from "lucide-react";

export default function MindPage() {
  const navigate = useNavigate();
  const mindScore = 75; // TODO: Calculate from mood/stress data

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 p-4 pb-24">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Mind</h1>
              <p className="text-sm text-muted-foreground">Mental clarity & emotional balance</p>
            </div>
          </div>
          <Badge variant="outline" className="text-purple-500">
            {mindScore}/100
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-6">
        <TodayMindSnapshot />
        <MoodMetrics />
        <MindInsights />
        <MindHabits />
        <ConnectedPlanets />
      </div>
    </div>
  );
}
